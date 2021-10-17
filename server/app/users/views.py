from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.db.models import Q
from django.http import HttpResponseRedirect, HttpResponseBadRequest
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.urls.base import reverse
from django.views import generic
from django.views.generic.edit import CreateView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from .forms import SignUpForm
from .models import User
from .serializers import UserListSerializer


class SignUpView(CreateView):
    form_class = SignUpForm
    template_name = "users/signup.html"
    success_url = reverse_lazy('chats:message_list')

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        self.object = user
        return HttpResponseRedirect(self.get_success_url())


class SignInView(generic.View):
    def post(self, request, *arg, **kwargs):
        form = AuthenticationForm(data=request.POST)
        if not form.is_valid():
            return render(request, 'users/signin.html', {'form': form})
        username = form.cleaned_data.get('username')
        user = User.objects.get(username=username)
        login(request, user)
        return redirect(reverse('chats:message_list'))

    def get(self, request, *args, **kwargs):
        form = AuthenticationForm(request.POST)
        return render(request, 'users/signin.html', {'form': form})


class SearchUserView(ListAPIView):
    serializer_class = UserListSerializer

    def get_queryset(self):
        try:
            perPage = int(self.request.GET.get('perPage') or 5)
        except:
            return HttpResponseBadRequest({'detail': 'Bad perPage parameter'})
        if (name := self.request.GET.get('name', None) or None) is None:
            return Response({'detail': 'Invalid query param'}, status=status.HTTP_400_BAD_REQUEST)
        return User.objects.filter(Q(username__icontains=name) | Q(display_name__icontains=name), is_staff=False).exclude(pk=self.request.user.pk)[:perPage]

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models.query_utils import Q
from django.http.response import HttpResponseBadRequest, JsonResponse
from django.shortcuts import redirect
from django.urls.base import reverse
from django.views.generic import TemplateView, View

from users.models import User
from .models import Rooms, Messages


class MessageListView(LoginRequiredMixin, TemplateView):
    template_name = 'chats/message_list.html'

    def get_context_data(self):
        context = super().get_context_data()
        context['message_list'] = Rooms.objects.filter(
            Q(created_user=self.request.user) | Q(added_user=self.request.user)
        )

        return context


class MessageView(LoginRequiredMixin, TemplateView):
    template_name = 'chats/message.html'

    def get_chat_partner(self, room):
        if room.created_user != self.request.user:
            return room.created_user
        return room.added_user

    def get_context_data(self, room_pk):
        context = super().get_context_data()
        room = Rooms.objects.get(pk=room_pk)
        context['room'] = room
        context['chat_partner'] = self.get_chat_partner(room)
        context['message_list'] = Messages.objects.filter(room=room).order_by('send_at')

        return context


class MessageRedirectView(LoginRequiredMixin, View):
    def get_or_create_chat_room(self, user_list):
        try:
            return Rooms.objects.get(created_user=user_list[1], added_user=user_list[0])
        except Rooms.DoesNotExist:
            room, _ = Rooms.objects.get_or_create(created_user=user_list[0], added_user=user_list[1])
            return room

    def get(self, request, user_pk):
        req_user = request.user
        another_user = User.objects.get(pk=user_pk)

        if req_user == another_user:
            return HttpResponseBadRequest()
        room = self.get_or_create_chat_room((req_user, another_user))
        if request.GET.get('json') == 'true':
            return JsonResponse({'room_pk': room.pk})
        return redirect(reverse('chats:message', kwargs={'room_pk': room.pk}))

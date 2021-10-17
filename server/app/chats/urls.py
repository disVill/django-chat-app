from django.urls import path

from . import views

app_name = 'chats'
urlpatterns = [
    path('', views.MessageListView.as_view(), name='message_list'),
    path('room_redirect/<str:user_pk>', views.MessageRedirectView.as_view(), name='message_redirect'),
    path('rooms/<slug:room_pk>', views.MessageView.as_view(), name='message'),
]

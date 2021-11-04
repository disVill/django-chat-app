import json

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import HttpResponse

from users.models import User
from .models import Messages, Rooms


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_pk']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user_pk = text_data_json['user_pk']
        user = await self.get_user_info(user_pk)

        if not message:
            return

        created_message = await self.create_message_data(message, user_pk)
        send_at = created_message.send_at.strftime('%Y年%m月%d日 %H:%M')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'icon_url': user.icon.url if user.icon else None,
                'user_pk': str(user.pk),
                'display_name': user.display_name,
                'username': user.username,
                'send_at': send_at,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'icon_url': event['icon_url'],
            'user_pk': event['user_pk'],
            'display_name': event['display_name'],
            'username': event['username'],
            'send_at': event['send_at'],
        }))

    @sync_to_async
    def get_user_info(self, pk):
        user = User.objects.get(pk=pk)
        return user

    @database_sync_to_async
    def create_message_data(self, message, user_pk):
        try:
            room = Rooms.objects.get(pk=self.room_name)
            sender = User.objects.get(pk=user_pk)
            return Messages.objects.create(
                room=room,
                body=message,
                sender=sender
            )
        except Exception:
            raise HttpResponse(status=500)

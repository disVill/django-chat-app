from django.db import models

from users.models import User


class Rooms(models.Model):
    created_user = models.ForeignKey(User, related_name='created_rooms', on_delete=models.CASCADE)
    added_user = models.ForeignKey(User, related_name='added_rooms', on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'

    def __str__(self):
        return f'@{self.created_user.username} & @{self.added_user.username}'


class Messages(models.Model):
    room = models.ForeignKey(Rooms, related_name='messages', on_delete=models.CASCADE)

    body = models.TextField('Message Body', max_length=1000)

    sender = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)

    send_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['send_at']
        get_latest_by = ['send_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    def __str__(self):
        return f'@{self.sender.username}: {self.body[:15]}'

from rest_framework import serializers

from .models import User


class UserListSerializer(serializers.ModelSerializer):
    icon_url = serializers.SerializerMethodField()

    def get_icon_url(self, obj):
        if obj.icon:
            return obj.icon.url

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'icon_url']

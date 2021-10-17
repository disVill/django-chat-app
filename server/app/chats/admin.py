from django.contrib import admin

from .models import Rooms, Messages


admin.site.register(Messages)
admin.site.register(Rooms)

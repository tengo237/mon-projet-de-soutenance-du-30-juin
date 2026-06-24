from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone", "full_name", "is_manager", "is_staff", "date_joined")
    search_fields = ("phone", "full_name")
    list_filter = ("is_manager", "is_staff")

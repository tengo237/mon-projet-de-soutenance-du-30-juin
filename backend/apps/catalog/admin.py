from django.contrib import admin

from .models import City, Hotel, HotelImage, Landmark, Quartier, Room


class RoomInline(admin.TabularInline):
    model = Room
    extra = 1


class HotelImageInline(admin.TabularInline):
    model = HotelImage
    extra = 1


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("name", "quartier", "price_from", "rating", "is_verified")
    list_filter = ("is_verified", "quartier__city", "has_generator", "has_wifi")
    search_fields = ("name", "quartier__name")
    list_editable = ("is_verified",)
    inlines = [RoomInline, HotelImageInline]


@admin.register(Quartier)
class QuartierAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "safety_index")
    list_filter = ("city",)


admin.site.register(City)
admin.site.register(Landmark)
admin.site.register(Room)

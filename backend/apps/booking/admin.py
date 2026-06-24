from django.contrib import admin

from .models import Payment, Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("code", "room", "user", "checkin", "checkout", "amount", "status")
    list_filter = ("status", "payment_mode")
    search_fields = ("code", "user__phone")
    list_editable = ("status",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("reservation", "operator", "amount", "status", "reference")
    list_filter = ("operator", "status")

import secrets

from django.conf import settings
from django.db import models

from apps.catalog.models import Room


def generate_code():
    return "MBOA-" + secrets.token_hex(3).upper()


class Reservation(models.Model):
    STATUS = (
        ("pending", "En attente"),
        ("confirmed", "Confirmée"),
        ("cancelled", "Annulée"),
    )
    PAYMENT_MODE = (
        ("mobile_money", "Mobile Money"),
        ("on_arrival", "Paiement à l'arrivée"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reservations", on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name="reservations", on_delete=models.PROTECT)
    code = models.CharField(max_length=20, unique=True, default=generate_code)
    checkin = models.DateField()
    checkout = models.DateField()
    guests = models.PositiveSmallIntegerField(default=1)
    amount = models.PositiveIntegerField("Montant (FCFA)", default=0)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE, default="on_arrival")
    status = models.CharField(max_length=12, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Réservation"
        ordering = ["-created_at"]

    @property
    def nights(self):
        return max((self.checkout - self.checkin).days, 1)

    def __str__(self):
        return f"{self.code} — {self.room.hotel.name}"


class Payment(models.Model):
    OPERATORS = (("orange_money", "Orange Money"), ("mtn_momo", "MTN MoMo"))
    STATUS = (("pending", "En attente"), ("paid", "Payé"), ("failed", "Échec"))

    reservation = models.OneToOneField(Reservation, related_name="payment", on_delete=models.CASCADE)
    operator = models.CharField(max_length=20, choices=OPERATORS)
    amount = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS, default="pending")
    reference = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.operator} — {self.reservation.code} ({self.status})"

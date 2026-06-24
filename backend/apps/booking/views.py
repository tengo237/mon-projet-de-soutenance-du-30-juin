import secrets
from datetime import date

from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Room

from .models import Payment, Reservation


class ReservationSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source="room.hotel.name", read_only=True)
    hotel_slug = serializers.CharField(source="room.hotel.slug", read_only=True)
    room_type = serializers.CharField(source="room.room_type", read_only=True)
    nights = serializers.IntegerField(read_only=True)
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id", "code", "hotel_name", "hotel_slug", "room_type",
            "checkin", "checkout", "nights", "guests", "amount",
            "payment_mode", "status", "payment_status", "created_at",
        ]

    def get_payment_status(self, obj):
        return getattr(getattr(obj, "payment", None), "status", None)


class ReservationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        d = request.data
        try:
            room = Room.objects.select_related("hotel").get(pk=d.get("room"))
        except Room.DoesNotExist:
            return Response({"detail": "Chambre introuvable."}, status=status.HTTP_404_NOT_FOUND)

        try:
            checkin = date.fromisoformat(d["checkin"])
            checkout = date.fromisoformat(d["checkout"])
        except (KeyError, ValueError):
            return Response({"detail": "Dates invalides (format AAAA-MM-JJ)."},
                            status=status.HTTP_400_BAD_REQUEST)
        if checkout <= checkin:
            return Response({"detail": "La date de départ doit suivre l'arrivée."},
                            status=status.HTTP_400_BAD_REQUEST)

        nights = (checkout - checkin).days
        guests = int(d.get("guests", 1))
        payment_mode = d.get("payment_mode", "on_arrival")
        amount = room.price_per_night * nights

        reservation = Reservation.objects.create(
            user=request.user, room=room, checkin=checkin, checkout=checkout,
            guests=guests, amount=amount, payment_mode=payment_mode,
            status="pending" if payment_mode == "on_arrival" else "pending",
        )
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Reservation.objects.filter(user=request.user).select_related("room__hotel")
        return Response(ReservationSerializer(qs, many=True).data)


class PayView(APIView):
    """Stub de paiement Mobile Money.

    NOTE MVP : ne contacte aucun agrégateur réel. Simule un paiement réussi pour
    démontrer le parcours. À remplacer par Campay / Notch Pay / Flutterwave en
    phase 2 (cf. cahier des charges F-PAY-01/02).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, user=request.user)
        except Reservation.DoesNotExist:
            return Response({"detail": "Réservation introuvable."}, status=status.HTTP_404_NOT_FOUND)

        operator = request.data.get("operator", "orange_money")
        payment, _ = Payment.objects.get_or_create(reservation=reservation, defaults={
            "operator": operator, "amount": reservation.amount,
        })
        # Simulation de succès
        payment.operator = operator
        payment.amount = reservation.amount
        payment.status = "paid"
        payment.reference = "SIM-" + secrets.token_hex(5).upper()
        payment.save()

        reservation.status = "confirmed"
        reservation.payment_mode = "mobile_money"
        reservation.save()

        return Response({
            "detail": "Paiement simulé avec succès (stub MVP).",
            "reservation": ReservationSerializer(reservation).data,
        })

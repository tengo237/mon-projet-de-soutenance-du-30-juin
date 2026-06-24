from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Hotel
from apps.booking.models import Reservation

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        by_city = (Hotel.objects.filter(is_verified=True)
                   .values("quartier__city__name").annotate(count=Count("id")).order_by("-count"))
        return Response({
            "hotels_verified":        Hotel.objects.filter(is_verified=True).count(),
            "hotels_pending":         Hotel.objects.filter(is_verified=False).count(),
            "reservations_total":     Reservation.objects.count(),
            "reservations_confirmed": Reservation.objects.filter(status="confirmed").count(),
            "revenue_total":          Reservation.objects.filter(status="confirmed").aggregate(t=Sum("amount"))["t"] or 0,
            "users_total":            User.objects.count(),
            "by_city": [{"city": r["quartier__city__name"], "count": r["count"]} for r in by_city],
        })


class AdminHotelListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        from apps.catalog.serializers import HotelListSerializer
        hotels = Hotel.objects.select_related("quartier__city").order_by("is_verified", "-id")
        return Response(HotelListSerializer(hotels, many=True).data)


class AdminHotelDetailView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"detail": "Hotel introuvable."}, status=404)
        hotel.is_verified = request.data.get("is_verified", hotel.is_verified)
        hotel.save()
        return Response({"id": hotel.id, "is_verified": hotel.is_verified})
    def delete(self, request, pk):
        try:
            Hotel.objects.get(pk=pk).delete()
        except Hotel.DoesNotExist:
            return Response({"detail": "Hotel introuvable."}, status=404)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReservationListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        reservations = Reservation.objects.select_related("user", "room__hotel").order_by("-created_at")
        return Response([{
            "id": r.id, "code": r.code, "hotel_name": r.room.hotel.name,
            "user_name": r.user.full_name or r.user.phone,
            "checkin": str(r.checkin), "checkout": str(r.checkout),
            "amount": r.amount, "status": r.status, "payment_mode": r.payment_mode,
        } for r in reservations])


class AdminReservationCancelView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        try:
            r = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response({"detail": "Reservation introuvable."}, status=404)
        r.status = "cancelled"
        r.save()
        return Response({"id": r.id, "status": r.status})


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        return Response([{
            "id": u.id, "phone": u.phone, "full_name": u.full_name,
            "is_staff": u.is_staff, "is_active": getattr(u, "is_active", True),
        } for u in User.objects.all()])


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        try:
            u = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=404)
        if "is_staff"  in request.data: u.is_staff  = request.data["is_staff"]
        if "is_active" in request.data: u.is_active = request.data["is_active"]
        u.save()
        return Response({"id": u.id, "is_staff": u.is_staff, "is_active": u.is_active})

from django.urls import path

from .views import MyReservationsView, PayView, ReservationCreateView

urlpatterns = [
    path("reservations", ReservationCreateView.as_view(), name="reservation-create"),
    path("reservations/mine", MyReservationsView.as_view(), name="reservations-mine"),
    path("reservations/<int:pk>/pay", PayView.as_view(), name="reservation-pay"),
]

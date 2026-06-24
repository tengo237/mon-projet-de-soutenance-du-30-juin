from django.urls import path
from .admin_views import (
    AdminStatsView,
    AdminHotelListView, AdminHotelDetailView,
    AdminReservationListView, AdminReservationCancelView,
    AdminUserListView, AdminUserDetailView,
)

urlpatterns = [
    path("admin/stats",                        AdminStatsView.as_view()),
    path("admin/hotels",                       AdminHotelListView.as_view()),
    path("admin/hotels/<int:pk>/verify",       AdminHotelDetailView.as_view()),
    path("admin/hotels/<int:pk>",              AdminHotelDetailView.as_view()),
    path("admin/reservations",                 AdminReservationListView.as_view()),
    path("admin/reservations/<int:pk>/cancel", AdminReservationCancelView.as_view()),
    path("admin/users",                        AdminUserListView.as_view()),
    path("admin/users/<int:pk>",               AdminUserDetailView.as_view()),
]

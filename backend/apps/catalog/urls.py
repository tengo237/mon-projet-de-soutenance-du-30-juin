from django.urls import path
from .views import (
    CityListView, HotelCreateView,
    HotelDetailView, HotelListView, QuartierListView,
)

urlpatterns = [
    path("cities",             CityListView.as_view(),    name="city-list"),
    path("quartiers",          QuartierListView.as_view(), name="quartier-list"),
    path("hotels",             HotelListView.as_view(),   name="hotel-list"),
    path("hotels/create",      HotelCreateView.as_view(), name="hotel-create"),
    path("hotels/<slug:slug>", HotelDetailView.as_view(), name="hotel-detail"),
]

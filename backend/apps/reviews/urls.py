from django.urls import path
from .views import ReviewListCreateView, ReviewDeleteView

urlpatterns = [
    path("hotels/<slug:hotel_slug>/reviews", ReviewListCreateView.as_view()),
    path("reviews/<int:pk>",                 ReviewDeleteView.as_view()),
]

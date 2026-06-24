from django.urls import path

from .views import AssistantView, SearchView

urlpatterns = [
    path("search", SearchView.as_view(), name="search"),
    path("assistant", AssistantView.as_view(), name="assistant"),
]

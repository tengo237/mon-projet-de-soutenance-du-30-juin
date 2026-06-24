from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.catalog.admin_urls")),
    path("api/", include("apps.matching.urls")),
    path("api/", include("apps.booking.urls")),
    path("api/", include("apps.reviews.urls")),
]

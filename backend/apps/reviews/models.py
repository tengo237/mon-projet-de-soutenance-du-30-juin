from django.conf import settings
from django.db import models
from apps.catalog.models import Hotel


class Review(models.Model):
    hotel      = models.ForeignKey(Hotel, related_name="reviews", on_delete=models.CASCADE)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reviews", on_delete=models.CASCADE)
    rating     = models.PositiveSmallIntegerField()
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("hotel", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} — {self.hotel.name} ({self.rating}/5)"

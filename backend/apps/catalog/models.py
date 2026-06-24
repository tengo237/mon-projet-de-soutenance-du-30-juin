from django.conf import settings
from django.db import models
from django.utils.text import slugify


class City(models.Model):
    name = models.CharField(max_length=80)
    region = models.CharField(max_length=80, blank=True)
    slug = models.SlugField(unique=True, blank=True)
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)

    class Meta:
        verbose_name = "Ville"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Quartier(models.Model):
    city = models.ForeignKey(City, related_name="quartiers", on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    # Indice de sécurité ressenti, 1 (faible) à 5 (élevé) — critère local clé.
    safety_index = models.PositiveSmallIntegerField(default=3)
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)

    class Meta:
        verbose_name = "Quartier"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city.name})"


class Landmark(models.Model):
    """Point d'intérêt pour l'orientation (campus, gare, marché, hôpital...)."""
    city = models.ForeignKey(City, related_name="landmarks", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    keywords = models.CharField(max_length=200, blank=True, help_text="mots-clés séparés par des virgules")
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Hotel(models.Model):
    quartier = models.ForeignKey(Quartier, related_name="hotels", on_delete=models.CASCADE)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="hotels",
    )
    name = models.CharField(max_length=140)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)
    cover_image_url = models.URLField(blank=True)
    price_from = models.PositiveIntegerField("Prix à partir de (FCFA)", default=0)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField("Vérifié par un agent", default=False)

    # Équipements locaux — critères réels du contexte camerounais.
    has_generator = models.BooleanField("Groupe électrogène", default=False)
    has_hot_water = models.BooleanField("Eau chaude", default=False)
    has_ac = models.BooleanField("Climatisation", default=False)
    has_wifi = models.BooleanField("Wifi", default=False)
    has_parking = models.BooleanField("Parking", default=False)
    has_restaurant = models.BooleanField("Restauration", default=False)

    class Meta:
        verbose_name = "Hôtel"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            i = 1
            while Hotel.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def amenities(self):
        return {
            "has_generator": self.has_generator,
            "has_hot_water": self.has_hot_water,
            "has_ac": self.has_ac,
            "has_wifi": self.has_wifi,
            "has_parking": self.has_parking,
            "has_restaurant": self.has_restaurant,
        }

    def __str__(self):
        return self.name


class HotelImage(models.Model):
    hotel = models.ForeignKey(Hotel, related_name="images", on_delete=models.CASCADE)
    url = models.URLField()

    def __str__(self):
        return f"Image — {self.hotel.name}"


class Room(models.Model):
    hotel = models.ForeignKey(Hotel, related_name="rooms", on_delete=models.CASCADE)
    room_type = models.CharField(max_length=80, default="Chambre standard")
    capacity = models.PositiveSmallIntegerField(default=2)
    price_per_night = models.PositiveIntegerField("Prix / nuit (FCFA)", default=0)
    count = models.PositiveSmallIntegerField("Nombre de chambres", default=1)

    class Meta:
        verbose_name = "Chambre"
        ordering = ["price_per_night"]

    def __str__(self):
        return f"{self.room_type} — {self.hotel.name}"

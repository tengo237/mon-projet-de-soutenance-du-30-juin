from rest_framework import serializers
from django.utils.text import slugify
import uuid

from .models import City, Hotel, HotelImage, Quartier, Room


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name", "region", "slug", "latitude", "longitude"]


class QuartierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quartier
        fields = ["id", "name", "safety_index"]


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "room_type", "capacity", "price_per_night", "count"]


class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = ["id", "url"]


class HotelListSerializer(serializers.ModelSerializer):
    quartier = serializers.CharField(source="quartier.name")
    city = serializers.CharField(source="quartier.city.name")
    safety_index = serializers.IntegerField(source="quartier.safety_index")
    amenities = serializers.DictField(read_only=True)

    class Meta:
        model = Hotel
        fields = [
            "id", "name", "slug", "quartier", "city", "safety_index",
            "cover_image_url", "price_from", "rating", "review_count",
            "is_verified", "amenities",
        ]


class HotelDetailSerializer(HotelListSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    images = HotelImageSerializer(many=True, read_only=True)

    class Meta(HotelListSerializer.Meta):
        fields = HotelListSerializer.Meta.fields + [
            "description", "address", "latitude", "longitude", "rooms", "images",
        ]


class HotelCreateSerializer(serializers.Serializer):
    name            = serializers.CharField(max_length=200)
    city            = serializers.SlugField()
    quartier        = serializers.IntegerField()
    address         = serializers.CharField(required=False, allow_blank=True, max_length=200)
    description     = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    price_from      = serializers.IntegerField(min_value=1000)
    cover_image_url = serializers.URLField(required=False, allow_blank=True, max_length=500)
    has_wifi        = serializers.BooleanField(default=False)
    has_generator   = serializers.BooleanField(default=False)
    has_ac          = serializers.BooleanField(default=False)
    has_hot_water   = serializers.BooleanField(default=False)
    has_parking     = serializers.BooleanField(default=False)
    has_restaurant  = serializers.BooleanField(default=False)

    def validate_quartier(self, value):
        try:
            return Quartier.objects.get(pk=value)
        except Quartier.DoesNotExist:
            raise serializers.ValidationError("Quartier introuvable.")

    def validate(self, data):
        quartier = data.get("quartier")
        city_slug = data.get("city")
        if quartier and quartier.city.slug != city_slug:
            raise serializers.ValidationError("Ce quartier n appartient pas a la ville choisie.")
        return data

    def save(self, owner):
        data = self.validated_data
        quartier = data["quartier"]
        base_slug = slugify(data["name"])[:180]
        slug = base_slug
        if Hotel.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        address = data.get("address", "").strip() or f"{quartier.name}, {quartier.city.name}"
        hotel = Hotel.objects.create(
            quartier=quartier, name=data["name"], slug=slug,
            description=data.get("description", "")[:2000],
            address=address[:200],
            latitude=quartier.latitude, longitude=quartier.longitude,
            cover_image_url=data.get("cover_image_url", "")[:500],
            price_from=data["price_from"], rating=0, review_count=0, is_verified=False,
            has_wifi=data.get("has_wifi", False), has_generator=data.get("has_generator", False),
            has_ac=data.get("has_ac", False), has_hot_water=data.get("has_hot_water", False),
            has_parking=data.get("has_parking", False), has_restaurant=data.get("has_restaurant", False),
        )
        Room.objects.create(hotel=hotel, room_type="Chambre standard", capacity=2,
                            price_per_night=data["price_from"], count=4)
        return hotel

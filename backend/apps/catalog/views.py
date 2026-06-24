from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import City, Hotel, Quartier
from .serializers import (
    CitySerializer, HotelCreateSerializer,
    HotelDetailSerializer, HotelListSerializer, QuartierSerializer,
)


class CityListView(generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer


class QuartierListView(generics.ListAPIView):
    serializer_class = QuartierSerializer
    def get_queryset(self):
        city = self.request.query_params.get("city")
        if city:
            return Quartier.objects.filter(city__slug=city).order_by("name")
        return Quartier.objects.none()


class HotelListView(generics.ListAPIView):
    serializer_class = HotelListSerializer
    def get_queryset(self):
        qs = Hotel.objects.filter(is_verified=True).select_related("quartier__city")
        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(quartier__city__slug=city)
        return qs


class HotelDetailView(generics.RetrieveAPIView):
    queryset = Hotel.objects.select_related("quartier__city").prefetch_related("rooms", "images")
    serializer_class = HotelDetailSerializer
    lookup_field = "slug"


class HotelCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = HotelCreateSerializer(data=request.data)
        if serializer.is_valid():
            hotel = serializer.save(owner=request.user)
            return Response({"slug": hotel.slug, "message": "Hotel soumis avec succes."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

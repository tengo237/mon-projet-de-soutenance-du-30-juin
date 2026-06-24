from django.db.models import Avg
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Hotel
from .models import Review


class ReviewListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, hotel_slug):
        try:
            hotel = Hotel.objects.get(slug=hotel_slug)
        except Hotel.DoesNotExist:
            return Response({"detail": "Hotel introuvable."}, status=404)
        reviews = Review.objects.filter(hotel=hotel).select_related("user")
        return Response([{
            "id": r.id,
            "user_name": r.user.full_name or r.user.phone,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime("%d/%m/%Y"),
            "is_mine": r.user == request.user if request.user.is_authenticated else False,
        } for r in reviews])

    def post(self, request, hotel_slug):
        try:
            hotel = Hotel.objects.get(slug=hotel_slug)
        except Hotel.DoesNotExist:
            return Response({"detail": "Hotel introuvable."}, status=404)
        rating = request.data.get("rating")
        if not rating or not (1 <= int(rating) <= 5):
            return Response({"detail": "Note entre 1 et 5 requise."}, status=400)
        review, created = Review.objects.update_or_create(
            hotel=hotel, user=request.user,
            defaults={"rating": int(rating), "comment": request.data.get("comment", "").strip()},
        )
        avg = Review.objects.filter(hotel=hotel).aggregate(a=Avg("rating"))["a"] or 0
        hotel.rating = round(avg, 1)
        hotel.review_count = Review.objects.filter(hotel=hotel).count()
        hotel.save()
        return Response({
            "id": review.id,
            "user_name": request.user.full_name or request.user.phone,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.strftime("%d/%m/%Y"),
            "is_mine": True,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ReviewDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            review = Review.objects.get(pk=pk, user=request.user)
        except Review.DoesNotExist:
            return Response({"detail": "Avis introuvable."}, status=404)
        hotel = review.hotel
        review.delete()
        avg = Review.objects.filter(hotel=hotel).aggregate(a=Avg("rating"))["a"] or 0
        hotel.rating = round(avg, 1)
        hotel.review_count = Review.objects.filter(hotel=hotel).count()
        hotel.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

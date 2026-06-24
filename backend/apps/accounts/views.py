from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "full_name", "preferred_language", "is_manager", "is_staff"]

class RegisterView(APIView):
    def post(self, request):
        phone = (request.data.get("phone") or "").strip()
        full_name = (request.data.get("full_name") or "").strip()
        password = request.data.get("password") or ""
        language = request.data.get("preferred_language") or "fr"
        if not phone or not password:
            return Response({"detail": "Telephone et mot de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(phone=phone).exists():
            return Response({"detail": "Ce numero est deja inscrit."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(phone=phone, password=password, full_name=full_name, preferred_language=language)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        user = request.user
        if "full_name" in request.data:
            user.full_name = request.data["full_name"].strip()
        if "phone" in request.data:
            new_phone = request.data["phone"].strip()
            if new_phone != user.phone and User.objects.filter(phone=new_phone).exists():
                return Response({"detail": "Ce numero est deja utilise."}, status=status.HTTP_400_BAD_REQUEST)
            user.phone = new_phone
        if "password" in request.data and request.data["password"]:
            old = request.data.get("old_password", "")
            if not user.check_password(old):
                return Response({"detail": "Ancien mot de passe incorrect."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(request.data["password"])
        user.save()
        return Response(UserSerializer(user).data)

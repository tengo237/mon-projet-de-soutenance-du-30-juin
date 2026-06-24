from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Gestionnaire d'utilisateurs identifiés par leur numéro de téléphone."""

    def create_user(self, phone, password=None, **extra):
        if not phone:
            raise ValueError("Le numéro de téléphone est obligatoire.")
        user = self.model(phone=phone, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    LANG_CHOICES = (("fr", "Français"), ("en", "English"))

    phone = models.CharField("Téléphone", max_length=20, unique=True)
    full_name = models.CharField("Nom complet", max_length=120, blank=True)
    preferred_language = models.CharField(max_length=2, choices=LANG_CHOICES, default="fr")
    is_manager = models.BooleanField("Gérant d'hôtel", default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.full_name or self.phone}"

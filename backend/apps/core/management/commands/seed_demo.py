import random
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.catalog.models import City, Hotel, HotelImage, Landmark, Quartier, Room

User = get_user_model()

# ================= IMAGES =================
COVERS = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80",
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d5?w=900&q=80",
]

GALLERY = [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80",
]

# ================= VILLES =================
# slug → (nom affiché, région, lat, lng)
CITIES_INFO = {
    "bafoussam": ("Bafoussam", "Ouest",    5.4781, 10.4179),
    "yaounde":   ("Yaoundé",   "Centre",   3.8634, 11.5167),
    "douala":    ("Douala",    "Littoral", 4.0511,  9.6986),
}

# ================= QUARTIERS =================
QUARTIERS = {
    "bafoussam": [
        ("Tamdja",            4, 5.4895, 10.4060),
        ("Famla",             4, 5.4650, 10.4310),
        ("Centre commercial", 4, 5.4781, 10.4179),
        ("Tougang",           3, 5.4760, 10.4205),
        ("Kamkop",            3, 5.4980, 10.4180),
        ("Banengo",           2, 5.4720, 10.4350),
        ("Djeleng",           3, 5.4810, 10.4290),
        ("Tyo-ville",         3, 5.4705, 10.4120),
    ],
    "yaounde": [
        ("Bastos",       5, 3.8870, 11.5210),
        ("Melen",        4, 3.8670, 11.4940),
        ("Omnisports",   4, 3.8760, 11.5450),
        ("Ngoa-Ekelle",  4, 3.8570, 11.5020),
        ("Nlongkak",     4, 3.8920, 11.5300),
        ("Mvog-Ada",     3, 3.8730, 11.5050),
        ("Essos",        4, 3.8840, 11.5350),
        ("Tsinga",       3, 3.8790, 11.4990),
        ("Mokolo",       3, 3.8830, 11.5070),
        ("Odza",         4, 3.7980, 11.5580),
        ("Biyem-Assi",   4, 3.8460, 11.4820),
        ("Elig-Essono",  4, 3.8620, 11.5200),
    ],
    "douala": [
        ("Akwa",          4, 4.0510, 9.7040),
        ("Bonapriso",     5, 4.0400, 9.7120),
        ("Deido",         3, 4.0610, 9.7210),
        ("Logpom",        4, 4.0900, 9.7600),
        ("Bonamoussadi",  4, 4.0890, 9.7570),
        ("Makepe",        4, 4.0740, 9.7420),
        ("Japoma",        4, 4.0160, 9.7990),
        ("Bepanda",       3, 4.0720, 9.7300),
        ("New Bell",      2, 4.0390, 9.6900),
        ("Kotto",         5, 4.0830, 9.7790),
        ("Cité Sic",      3, 4.0650, 9.7350),
        ("Logbaba",       3, 4.0950, 9.7700),
    ],
}

# ================= LANDMARKS =================
LANDMARKS = {
    "bafoussam": [
        ("Marché A",      "marché,marche,commerce,centre", 5.4781, 10.4179),
        ("Gare routière", "gare,voyage,car,bus",           5.4720, 10.4250),
    ],
    "yaounde": [
        ("Université Yaoundé I",    "université,universite,campus,étudiant,etudiant,fac", 3.8480, 11.5021),
        ("Stade Ahmadou Ahidjo",    "stade,sport,foot",                                  3.8795, 11.5160),
        ("Marché Mokolo",           "marché,marche,commerce,achat",                      3.8830, 11.5070),
        ("Aéroport Nsimalen",       "aéroport,aeroport,vol,avion",                       3.7233, 11.5533),
        ("Hôpital Central",         "hôpital,hopital,clinique,santé,sante",              3.8634, 11.5167),
    ],
    "douala": [
        ("Marché Central",   "marché,marche,commerce,achat,centre",  4.0500, 9.7000),
        ("Aéroport Douala",  "aéroport,aeroport,vol,avion",          4.0061, 9.7195),
        ("Port de Douala",   "port,maritime,cargo",                  4.0450, 9.6900),
        ("Hôpital Laquintinie", "hôpital,hopital,clinique,santé,sante", 4.0530, 9.7010),
        ("Université de Douala", "université,universite,campus,étudiant,etudiant,fac", 4.0780, 9.7350),
    ],
}

# ================= HOTELS =================
# (nom base, prix, note, équipements)
HOTEL_TEMPLATES = [
    ("Résidence Premium",  28000, 4.6, {"has_wifi", "has_ac", "has_parking", "has_hot_water"}),
    ("Hôtel Central",      18000, 4.3, {"has_wifi", "has_generator", "has_hot_water"}),
    ("Auberge Confort",    12000, 4.1, {"has_wifi", "has_hot_water"}),
    ("Hôtel Prestige",     32000, 4.7, {"has_wifi", "has_ac", "has_restaurant", "has_hot_water"}),
    ("Résidence Élégance", 25000, 4.5, {"has_wifi", "has_parking", "has_generator"}),
    ("Auberge Voyageurs",  10000, 3.9, {"has_wifi", "has_generator"}),
    ("Hôtel Business",     30000, 4.6, {"has_wifi", "has_ac", "has_parking", "has_generator"}),
    ("Résidence Moderne",  22000, 4.4, {"has_wifi", "has_generator", "has_hot_water"}),
    ("Hôtel Panorama",     27000, 4.5, {"has_wifi", "has_ac", "has_parking"}),
    ("Auberge Soleil",      9000, 3.8, {"has_wifi"}),
    ("Résidence Horizon",  26000, 4.6, {"has_wifi", "has_ac", "has_hot_water"}),
    ("Hôtel Signature",    35000, 4.8, {"has_wifi", "has_ac", "has_restaurant", "has_parking", "has_hot_water"}),
]

ROOM_PRESETS = [
    ("Chambre standard", 2, 1.0, 6),
    ("Chambre confort",  2, 1.4, 4),
    ("Suite familiale",  4, 2.1, 2),
]


class Command(BaseCommand):
    help = "Seed multi-villes : Bafoussam, Yaoundé, Douala"

    def handle(self, *args, **options):
        random.seed(42)

        # ── Comptes démo ────────────────────────────────────────────────────
        if not User.objects.filter(phone="admin").exists():
            User.objects.create_superuser(phone="admin", password="admin1234", full_name="Admin MboaStay")
            self.stdout.write(self.style.SUCCESS("Superuser créé : admin / admin1234"))
        if not User.objects.filter(phone="690000000").exists():
            User.objects.create_user(phone="690000000", password="demo1234", full_name="Voyageur Démo")
            self.stdout.write(self.style.SUCCESS("Utilisateur démo : 690000000 / demo1234"))

        # ── Villes ──────────────────────────────────────────────────────────
        for city_slug, (city_name, region, lat, lng) in CITIES_INFO.items():
            city, created = City.objects.get_or_create(
                slug=city_slug,
                defaults={"name": city_name, "region": region, "latitude": lat, "longitude": lng},
            )
            if created:
                self.stdout.write(f"  Ville créée : {city_name}")
            else:
                # Corriger le nom si mal seedé avant (ex: "Yaounde" sans accent)
                if city.name != city_name:
                    city.name = city_name
                    city.region = region
                    city.save()
                    self.stdout.write(f"  Ville corrigée : {city_name}")

            # ── Quartiers ───────────────────────────────────────────────────
            quartiers_map = {}
            for name, safety, qlat, qlng in QUARTIERS[city_slug]:
                q, _ = Quartier.objects.get_or_create(
                    city=city, name=name,
                    defaults={"safety_index": safety, "latitude": qlat, "longitude": qlng},
                )
                quartiers_map[name] = q
            quartiers_list = list(quartiers_map.values())

            # ── Landmarks ───────────────────────────────────────────────────
            for name, keywords, llat, llng in LANDMARKS[city_slug]:
                Landmark.objects.get_or_create(
                    city=city, name=name,
                    defaults={"keywords": keywords, "latitude": llat, "longitude": llng},
                )

            # ── Hôtels ──────────────────────────────────────────────────────
            hotel_count = 0
            for i, (base_name, price, rating, amenities) in enumerate(HOTEL_TEMPLATES):
                # Nom propre : "Hôtel Central — Yaoundé"
                hotel_name = f"{base_name} — {city_name}"

                # Nettoyer les anciens noms mal formés (ex: "Hôtel Central yaounde")
                Hotel.objects.filter(
                    name=f"{base_name} {city_slug}",
                    quartier__city=city,
                ).delete()

                if Hotel.objects.filter(name=hotel_name, quartier__city=city).exists():
                    continue

                quartier = quartiers_list[i % len(quartiers_list)]
                hotel = Hotel.objects.create(
                    quartier=quartier,
                    name=hotel_name,
                    description=f"{base_name} situé à {city_name}, dans le quartier {quartier.name}. Confort moderne et services adaptés au contexte camerounais.",
                    address=f"{quartier.name}, {city_name}",
                    latitude=quartier.latitude + random.uniform(-0.004, 0.004),
                    longitude=quartier.longitude + random.uniform(-0.004, 0.004),
                    cover_image_url=COVERS[i % len(COVERS)],
                    price_from=price,
                    rating=rating,
                    review_count=random.randint(50, 300),
                    is_verified=True,
                    has_generator="has_generator" in amenities,
                    has_hot_water="has_hot_water" in amenities,
                    has_ac="has_ac" in amenities,
                    has_wifi="has_wifi" in amenities,
                    has_parking="has_parking" in amenities,
                    has_restaurant="has_restaurant" in amenities,
                )
                for url in GALLERY:
                    HotelImage.objects.create(hotel=hotel, url=url)
                for rtype, cap, mult, count in ROOM_PRESETS:
                    Room.objects.create(
                        hotel=hotel, room_type=rtype, capacity=cap,
                        price_per_night=int(price * mult / 1000) * 1000,
                        count=count,
                    )
                hotel_count += 1

            self.stdout.write(self.style.SUCCESS(
                f"  {city_name} : {hotel_count} hôtel(s) créé(s)"
            ))

        self.stdout.write(self.style.SUCCESS(
            f"\nSeed terminé : {Hotel.objects.count()} hôtels — {City.objects.count()} villes."
        ))

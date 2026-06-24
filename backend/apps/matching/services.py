"""
Moteur de recommandation MboaStay.

Classe les hôtels selon le *profil d'arrivant* et les préférences, et produit
pour chacun une raison de recommandation lisible (« pourquoi on te recommande ça »).

Conçu par pondération de règles — transparent et sans dépendance externe. Il peut
être remplacé / enrichi par un client LLM en phase 2 sans changer l'interface.
"""
from math import asin, cos, radians, sin, sqrt

PROFILES = {
    "etudiant": "Étudiant",
    "affaires": "Affaires",
    "famille": "Famille",
    "decouverte": "Découverte",
}

# Équipements valorisés par profil.
PROFILE_AMENITIES = {
    "etudiant": ["has_wifi", "has_generator"],
    "affaires": ["has_wifi", "has_generator", "has_ac", "has_parking"],
    "famille": ["has_restaurant", "has_hot_water", "has_parking"],
    "decouverte": ["has_restaurant", "has_wifi"],
}

# Pondérations par profil (somme = 1).
PROFILE_WEIGHTS = {
    "etudiant": {"price": 0.40, "safety": 0.25, "amenities": 0.15, "distance": 0.15, "rating": 0.05},
    "affaires": {"price": 0.10, "safety": 0.15, "amenities": 0.35, "distance": 0.25, "rating": 0.15},
    "famille": {"price": 0.20, "safety": 0.30, "amenities": 0.30, "distance": 0.10, "rating": 0.10},
    "decouverte": {"price": 0.20, "safety": 0.15, "amenities": 0.20, "distance": 0.25, "rating": 0.20},
}

AMENITY_LABELS = {
    "has_generator": "groupe électrogène",
    "has_hot_water": "eau chaude",
    "has_ac": "climatisation",
    "has_wifi": "wifi",
    "has_parking": "parking",
    "has_restaurant": "restauration",
}


def haversine_km(lat1, lon1, lat2, lon2):
    """Distance en km entre deux points (repli local, sans service externe)."""
    if not all([lat1, lon1, lat2, lon2]):
        return None
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))


def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def score_hotels(hotels, profile="decouverte", budget_max=None, poi_coords=None, filters=None):
    """Retourne une liste de dicts {hotel, score, reason, distance_km} triés."""
    profile = profile if profile in PROFILE_WEIGHTS else "decouverte"
    weights = PROFILE_WEIGHTS[profile]
    wanted_amenities = PROFILE_AMENITIES[profile]
    filters = filters or {}

    hotels = list(hotels)

    # Filtres durs (équipements exigés explicitement).
    for key in ["has_generator", "has_hot_water", "has_ac", "has_wifi", "has_parking", "has_restaurant"]:
        if filters.get(key):
            hotels = [h for h in hotels if getattr(h, key)]
    if filters.get("max_price"):
        hotels = [h for h in hotels if h.price_from <= int(filters["max_price"])]

    if not hotels:
        return []

    prices = [h.price_from for h in hotels] or [0]
    pmin, pmax = min(prices), max(prices)

    results = []
    for h in hotels:
        # --- Prix ---
        if budget_max:
            if h.price_from <= budget_max:
                price_score = 0.6 + 0.4 * (1 - h.price_from / max(budget_max, 1))
            else:
                price_score = _clamp(0.6 - (h.price_from - budget_max) / max(budget_max, 1))
        else:
            price_score = 1.0 if pmax == pmin else 1 - (h.price_from - pmin) / (pmax - pmin)

        # --- Sécurité du quartier ---
        safety_score = (h.quartier.safety_index or 3) / 5.0

        # --- Équipements ---
        present = sum(1 for a in wanted_amenities if getattr(h, a))
        amenity_score = present / len(wanted_amenities) if wanted_amenities else 0.5

        # --- Distance au point d'intérêt ---
        distance_km = None
        if poi_coords:
            distance_km = haversine_km(h.latitude, h.longitude, poi_coords[0], poi_coords[1])
        distance_score = 0.5 if distance_km is None else _clamp(1 / (1 + distance_km / 3))

        # --- Note ---
        rating_score = float(h.rating or 0) / 5.0

        total = (
            weights["price"] * price_score
            + weights["safety"] * safety_score
            + weights["amenities"] * amenity_score
            + weights["distance"] * distance_score
            + weights["rating"] * rating_score
        )

        results.append({
            "hotel": h,
            "score": round(total * 100),
            "distance_km": round(distance_km, 1) if distance_km is not None else None,
            "reason": _build_reason(h, profile, budget_max, present, wanted_amenities, distance_km),
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def _build_reason(hotel, profile, budget_max, amenity_hits, wanted, distance_km):
    """Phrase d'explication, dans la voix d'un hôte qui t'oriente."""
    bits = []
    if budget_max and hotel.price_from <= budget_max:
        bits.append("dans ton budget")
    if (hotel.quartier.safety_index or 3) >= 4:
        bits.append(f"quartier sûr ({hotel.quartier.name})")
    present_labels = [AMENITY_LABELS[a] for a in wanted if getattr(hotel, a)]
    if present_labels:
        bits.append(" et ".join(present_labels[:2]))
    if distance_km is not None and distance_km <= 2:
        bits.append("à deux pas de ce que tu cherches")

    tail = {
        "etudiant": "pratique pour un séjour étudiant",
        "affaires": "idéal pour un déplacement professionnel",
        "famille": "rassurant pour venir en famille",
        "decouverte": "bien placé pour découvrir la ville",
    }[profile]

    if not bits:
        return f"Une valeur sûre, {tail}."
    head = ", ".join(bits[:3]).capitalize()
    return f"{head} — {tail}."

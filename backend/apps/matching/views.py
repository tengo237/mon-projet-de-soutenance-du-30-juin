import re

from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Hotel, Landmark
from apps.catalog.serializers import HotelListSerializer

from .services import PROFILE_AMENITIES, score_hotels


def _serialize_results(scored):
    out = []
    for r in scored:
        data = HotelListSerializer(r["hotel"]).data
        data["score"] = r["score"]
        data["match_reason"] = r["reason"]
        data["distance_km"] = r["distance_km"]
        out.append(data)
    return out


def _resolve_poi(city_slug, poi_text):
    """Tente de localiser un point d'intérêt par mots-clés."""
    if not poi_text:
        return None
    poi_text = poi_text.lower()
    qs = Landmark.objects.all()
    if city_slug:
        qs = qs.filter(city__slug=city_slug)
    for lm in qs:
        keys = [lm.name.lower()] + [k.strip().lower() for k in (lm.keywords or "").split(",") if k.strip()]
        if any(k and k in poi_text for k in keys):
            return (lm.latitude, lm.longitude)
    return None


class SearchView(APIView):
    """Recherche par profil et préférences. Renvoie un classement justifié."""

    def post(self, request):
        d = request.data
        city_slug = d.get("city")
        profile = d.get("profile", "decouverte")
        budget_max = d.get("budget_max")
        budget_max = int(budget_max) if budget_max else None
        poi_coords = _resolve_poi(city_slug, d.get("point_of_interest"))
        filters = d.get("filters") or {}

        qs = Hotel.objects.filter(is_verified=True).select_related("quartier__city")
        if city_slug:
            qs = qs.filter(quartier__city__slug=city_slug)

        scored = score_hotels(qs, profile=profile, budget_max=budget_max,
                              poi_coords=poi_coords, filters=filters)
        return Response({"profile": profile, "count": len(scored),
                         "results": _serialize_results(scored)})


class AssistantView(APIView):
    """Assistant : transforme une demande en langage naturel en recommandations.

    NLU par règles (sans dépendance). En phase 2, remplaçable par le client LLM
    provider-agnostic réutilisé de PointCheck — même contrat d'entrée/sortie.
    """

    PROFILE_HINTS = {
        "etudiant": ["étudiant", "etudiant", "campus", "université", "universite", "fac", "école"],
        "affaires": ["affaire", "boulot", "travail", "mission", "réunion", "reunion", "conférence", "business"],
        "famille": ["famille", "enfant", "enfants", "mariage", "deuil", "parent"],
        "decouverte": ["visite", "tourisme", "découvrir", "decouvrir", "vacances", "week-end", "weekend"],
    }

    def post(self, request):
        query = (request.data.get("query") or "").lower()
        city_slug = request.data.get("city")

        # Profil
        profile = "decouverte"
        for key, hints in self.PROFILE_HINTS.items():
            if any(h in query for h in hints):
                profile = key
                break

        # Budget : capture "15000", "15 000", "15.000", "15k"
        budget = None
        m = re.search(r"(\d[\d\s.]{2,})\s*(?:fcfa|f|francs?)?", query)
        if m:
            raw = m.group(1).replace(" ", "").replace(".", "")
            if raw.isdigit():
                budget = int(raw)
        mk = re.search(r"(\d+)\s*k\b", query)
        if mk:
            budget = int(mk.group(1)) * 1000

        qs = Hotel.objects.filter(is_verified=True).select_related("quartier__city")
        if city_slug:
            qs = qs.filter(quartier__city__slug=city_slug)

        poi_coords = _resolve_poi(city_slug, query)
        scored = score_hotels(qs, profile=profile, budget_max=budget, poi_coords=poi_coords)

        understood = {
            "profile": profile,
            "budget_max": budget,
            "located_landmark": poi_coords is not None,
        }
        return Response({
            "understood": understood,
            "results": _serialize_results(scored[:3]),
        })

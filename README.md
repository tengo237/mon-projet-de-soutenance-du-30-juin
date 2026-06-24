# MboaStay

**Se loger en confiance quand on arrive dans une ville qu'on ne connaît pas — au Cameroun.**

MboaStay n'est pas « un site de réservation de plus » : il catégorise les logements
par *profil d'arrivant* (étudiant, affaires, famille, découverte) et explique
**pourquoi** chaque adresse te convient — quartier, sécurité, équipements locaux
(groupe électrogène, eau chaude…). Ville pilote : **Bafoussam**.

---

## Démarrage en une commande

Prérequis : **Docker** et **Docker Compose** (rien d'autre à installer — ni Python, ni Node, ni PostgreSQL).

```bash
docker compose up --build
```

Au premier lancement, le backend attend PostgreSQL, applique les migrations,
puis charge les données de démonstration (Bafoussam). Patiente ~1 min, puis ouvre :

| Service | URL | |
|---|---|---|
| **Application** | http://localhost:5173 | l'interface voyageur |
| **API** | http://localhost:8000/api | endpoints REST |
| **Admin / espace gérant** | http://localhost:8000/admin | gestion hôtels & réservations |

### Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Voyageur | `690000000` | `demo1234` |
| Admin / gérant | `admin` | `admin1234` |

> L'identifiant est le **numéro de téléphone** (choix produit : public sans email).

---

## Le parcours à tester

1. **Accueil** → choisis un profil (« Tu es ? »).
2. **Résultats** → liste classée par pertinence, avec le *mot de l'hôte* (« pourquoi on te recommande ça ») et les tags locaux ; filtre par budget / équipements.
3. **Fiche hôtel** → photos, équipements, puis réserve (dates, chambre, Mobile Money **ou** paiement à l'arrivée).
4. **Assistant** → décris ton besoin en langage naturel (« hôtel calme près du campus à moins de 15 000 FCFA »).
5. **Mes séjours** → tes réservations, avec finalisation du paiement.

---

## Architecture

```
mboastay/
├── docker-compose.yml      db (PostgreSQL) + backend (Django) + frontend (React/Vite)
├── backend/                Django 5 + DRF + JWT
│   └── apps/
│       ├── accounts/       utilisateur basé sur le téléphone, auth JWT
│       ├── catalog/        villes, quartiers, hôtels, chambres, points d'intérêt
│       ├── matching/       moteur de recommandation par profil + assistant
│       ├── booking/        réservations + paiement (stub Mobile Money)
│       └── core/           commande de seed (Bafoussam)
└── frontend/               React 18 + Vite + react-router (CSS maison, sans framework)
```

Le frontend appelle l'API via le proxy `/api` (même origine) — aucun souci de CORS en dev.

---

## Ce qui est implémenté ✅ vs simulé ⏳ (MVP)

| Fonction | État |
|---|---|
| Catégorisation par profil + scoring justifié | ✅ Réel (pondération par règles, transparent) |
| Assistant en langage naturel | ✅ Réel — NLU par règles (budget, profil, lieu) |
| Recherche, filtres, fiches, réservation | ✅ Réel |
| Espace gérant / admin | ✅ via l'admin Django |
| Authentification | ✅ JWT — ⏳ **OTP par SMS** à brancher (phase 2) |
| Paiement Mobile Money | ⏳ **Stub** : simule un succès. À brancher sur Campay / Notch Pay / Flutterwave |
| Cartographie spatiale | ⏳ distances via **haversine** en Python (PostGIS prévu en phase 2) |

Les points marqués ⏳ sont isolés derrière une interface propre : on les remplace
sans toucher au reste.

---

## Développement hors Docker (optionnel)

**Backend**
```bash
cd backend
pip install -r requirements.txt
# PostgreSQL requis ; variables POSTGRES_* dans l'environnement
python manage.py makemigrations accounts catalog booking
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
VITE_API_PROXY=http://localhost:8000 npm run dev
```

---

## Notes

- Devise **FCFA (XAF)**, fuseau **Africa/Douala**, interface en **français**.
- Les hôtels de démonstration sont **fictifs** (noms inventés) mais situés dans de vrais quartiers de Bafoussam.
- Pour réinitialiser les données : `docker compose down -v` puis `docker compose up --build`.

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { api, fmtFCFA } from "../api";

const PROFILES = [
  { key: "etudiant",   title: "Etudiant",           desc: "Petit budget, pres du campus, en securite." },
  { key: "affaires",   title: "Affaires",            desc: "Wifi fiable, courant garanti, bien place." },
  { key: "famille",    title: "Famille / evenement", desc: "Calme, plusieurs chambres, rassurant." },
  { key: "decouverte", title: "Decouverte",          desc: "Bien situe pour explorer la ville." },
];

const ASSURANCES = [
  { icon: "pin",   title: "Le bon quartier",       text: "On te dit lequel est sur et pratique." },
  { icon: "phone", title: "Paiement Mobile Money", text: "Orange Money, MTN MoMo, ou tu paies a l arrivee." },
  { icon: "hand",  title: "Accueilli, pas livre",  text: "Chaque adresse est verifiee. Tu arrives comme chez un proche." },
];

const CITY_COLORS = {
  bafoussam: { bg: "#1a1a2e", accent: "#e8a045" },
  douala:    { bg: "#0d1b2a", accent: "#4fc3f7" },
  yaounde:   { bg: "#1b2838", accent: "#81c784" },
};

const AMENITY_ICONS = {
  has_wifi:       { icon: "wifi",      label: "Wifi" },
  has_generator:  { icon: "generator", label: "Groupe electrogene" },
  has_ac:         { icon: "ac",        label: "Clim" },
  has_hot_water:  { icon: "hot_water", label: "Eau chaude" },
  has_parking:    { icon: "parking",   label: "Parking" },
  has_restaurant: { icon: "restaurant",label: "Restaurant" },
};

export default function Home() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [citySlug, setCitySlug] = useState("bafoussam");
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [activeCity, setActiveCity] = useState("all");

  useEffect(() => {
    api.cities()
      .then((data) => {
        if (data && data.length > 0) {
          setCities(data);
          const hasBafoussam = data.some((c) => c.slug === "bafoussam");
          if (!hasBafoussam) setCitySlug(data[0].slug);
        }
      })
      .catch(() => {
        setCities([
          { slug: "bafoussam", name: "Bafoussam" },
          { slug: "yaounde",   name: "Yaounde"   },
          { slug: "douala",    name: "Douala"     },
        ]);
      });
  }, []);

  useEffect(() => {
    setLoadingHotels(true);
    api.hotels(activeCity === "all" ? null : activeCity)
      .then(setHotels)
      .catch(() => setHotels([]))
      .finally(() => setLoadingHotels(false));
  }, [activeCity]);

  const cityName = cities.find((c) => c.slug === citySlug)?.name || "Bafoussam";

  function choose(profile) {
    navigate("/recherche?city=" + citySlug + "&profile=" + profile);
  }

  return (
    <div className="page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Se loger en confiance, partout au Cameroun</p>
          <h1>Tu arrives a <span className="city">{cityName}</span>. Et maintenant ?</h1>
          <p className="lead">
            Arriver dans une ville qu on ne connait pas, c est savoir ou dormir
            sans mauvaise surprise. Dis-nous qui tu es, on s occupe du reste.
          </p>
          <div className="city-switch">
            <span style={{ color: "rgba(242,243,240,.7)" }}>Ville</span>
            <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)} aria-label="Choisir la ville">
              {cities.length === 0 ? (
                <option value="bafoussam">Bafoussam</option>
              ) : (
                cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)
              )}
            </select>
            <span style={{ color: "rgba(242,243,240,.45)", fontSize: ".8rem" }}>
              D autres villes seront ajoutees prochainement
            </span>
          </div>
          <div className="profiles-label">
            <span className="eyebrow" style={{ color: "rgba(242,243,240,.78)" }}>Tu es ?</span>
            <span className="rule" />
          </div>
          <div className="profile-grid">
            {PROFILES.map((p) => (
              <button key={p.key} className="profile-card" onClick={() => choose(p.key)}>
                <Icon name={p.key} />
                <h3>{p.title}</h3>
                <span>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOTELS ── */}
      <section style={{ background: "#f8fafc", padding: "4rem 0" }}>
        <div className="container">
          {/* Header section */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontSize: ".8rem", fontWeight: 700, color: "#10b981",
                letterSpacing: ".12em", textTransform: "uppercase", margin: "0 0 .5rem" }}>
                Nos etablissements
              </p>
              <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                Des adresses verifiees,<br />dans chaque ville
              </h2>
            </div>
            <p style={{ color: "#64748b", maxWidth: "35ch", textAlign: "right", fontSize: ".9rem", margin: 0 }}>
              Chaque hotel est inspecte par notre equipe avant d etre publie sur la plateforme.
            </p>
          </div>

          {/* Filtres villes */}
          <div style={{ display: "flex", gap: ".5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveCity("all")} style={{
              padding: ".5rem 1.2rem", borderRadius: 99, border: "2px solid",
              borderColor: activeCity === "all" ? "#0f172a" : "#e2e8f0",
              background: activeCity === "all" ? "#0f172a" : "#fff",
              color: activeCity === "all" ? "#fff" : "#64748b",
              cursor: "pointer", fontSize: ".85rem", fontWeight: 600, transition: "all .2s",
            }}>Toutes les villes</button>
            {cities.map((c) => (
              <button key={c.slug} onClick={() => setActiveCity(c.slug)} style={{
                padding: ".5rem 1.2rem", borderRadius: 99, border: "2px solid",
                borderColor: activeCity === c.slug ? "#0f172a" : "#e2e8f0",
                background: activeCity === c.slug ? "#0f172a" : "#fff",
                color: activeCity === c.slug ? "#fff" : "#64748b",
                cursor: "pointer", fontSize: ".85rem", fontWeight: 600, transition: "all .2s",
              }}>{c.name}</button>
            ))}
          </div>

          {/* Grille hotels */}
          {loadingHotels ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} style={{ height: 360, background: "#e2e8f0", borderRadius: 20,
                  animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem",
              background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0" }}>
              <p style={{ color: "#94a3b8", margin: 0 }}>Aucun hotel disponible pour cette ville.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
              {hotels.map((hotel) => (
                <HotelPremiumCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

          {/* CTA */}
          {hotels.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link to="/recherche?city=bafoussam&profile=decouverte"
                style={{ display: "inline-flex", alignItems: "center", gap: ".5rem",
                  background: "#0f172a", color: "#fff", padding: ".8rem 2rem",
                  borderRadius: 99, textDecoration: "none", fontWeight: 600, fontSize: ".95rem",
                  transition: "background .2s" }}>
                Voir toutes nos adresses →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ASSURANCES ── */}
      <section className="assurance">
        <div className="container assurance-grid">
          {ASSURANCES.map((a) => (
            <div className="item" key={a.title}>
              <Icon name={a.icon} />
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HotelPremiumCard({ hotel }) {
  const amenities = Object.entries(hotel.amenities || {})
    .filter(([, v]) => v)
    .slice(0, 3);

  const stars = Math.round(Number(hotel.rating || 0));

  return (
    <Link to={"/hotels/" + hotel.slug} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#fff", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,.08)",
        transition: "transform .25s, box-shadow .25s",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,.08)";
        }}>

        {/* Image */}
        <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#e2e8f0" }}>
          {hotel.cover_image_url && (
            <img src={hotel.cover_image_url} alt={hotel.name}
              style={{ width: "100%", height: "100%", objectFit: "cover",
                transition: "transform .4s" }} />
          )}
          {/* Badge ville */}
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
            color: "#fff", fontSize: ".72rem", fontWeight: 600,
            padding: ".3rem .7rem", borderRadius: 99, letterSpacing: ".04em",
          }}>{hotel.city}</div>

          {/* Badge verifie */}
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "#10b981", color: "#fff", fontSize: ".7rem", fontWeight: 700,
            padding: ".3rem .65rem", borderRadius: 99, display: "flex", alignItems: "center", gap: ".3rem",
          }}>
            <span style={{ fontSize: ".8rem" }}>✓</span> Verifie
          </div>

          {/* Prix en overlay bas */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 100%)",
            padding: "2rem 1rem .8rem",
          }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
              {fmtFCFA(hotel.price_from)}
              <span style={{ fontWeight: 400, fontSize: ".78rem", opacity: .8 }}> / nuit</span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "1.1rem 1.25rem" }}>
          {/* Note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
              <span style={{ color: "#f59e0b", fontSize: ".9rem" }}>
                {"★".repeat(stars)}{"☆".repeat(5 - stars)}
              </span>
              {hotel.review_count > 0 && (
                <span style={{ color: "#94a3b8", fontSize: ".75rem" }}>
                  {Number(hotel.rating).toFixed(1)} ({hotel.review_count})
                </span>
              )}
            </div>
            {/* Securite */}
            <span style={{
              fontSize: ".7rem", fontWeight: 600, padding: ".2rem .55rem", borderRadius: 99,
              background: hotel.safety_index >= 4 ? "#f0fdf4" : hotel.safety_index >= 3 ? "#fefce8" : "#fef2f2",
              color: hotel.safety_index >= 4 ? "#16a34a" : hotel.safety_index >= 3 ? "#ca8a04" : "#dc2626",
            }}>
              {hotel.safety_index >= 4 ? "Quartier sur" : hotel.safety_index >= 3 ? "Securite correcte" : "Prudence"}
            </span>
          </div>

          {/* Nom et quartier */}
          <h3 style={{ margin: "0 0 .2rem", fontSize: "1rem", fontWeight: 700, color: "#0f172a",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {hotel.name}
          </h3>
          <p style={{ margin: "0 0 .8rem", color: "#94a3b8", fontSize: ".82rem" }}>
            📍 {hotel.quartier}, {hotel.city}
          </p>

          {/* Amenites */}
          {amenities.length > 0 && (
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
              {amenities.map(([key]) => (
                <span key={key} style={{
                  background: "#f8fafc", color: "#475569", fontSize: ".72rem",
                  padding: ".25rem .6rem", borderRadius: 99, border: "1px solid #e2e8f0",
                  fontWeight: 500,
                }}>
                  {key === "has_wifi" ? "Wifi"
                    : key === "has_generator" ? "Groupe elec."
                    : key === "has_ac" ? "Clim"
                    : key === "has_hot_water" ? "Eau chaude"
                    : key === "has_parking" ? "Parking"
                    : "Restaurant"}
                </span>
              ))}
            </div>
          )}

          {/* Bouton */}
          <div style={{ marginTop: "1rem", padding: ".6rem 1rem", background: "#0f172a",
            color: "#fff", borderRadius: 10, textAlign: "center",
            fontSize: ".85rem", fontWeight: 600 }}>
            Voir les details →
          </div>
        </div>
      </div>
    </Link>
  );
}

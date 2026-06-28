import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Icon } from "./Icon";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/connexion");
  }

  return (
    <header className="site-header">
      <div className="container inner">
        <Link to="/" className="brand">mboa<span className="dot" />stay</Link>
        <nav className="nav">
          <div className="links">
            <NavLink to="/" end>Accueil</NavLink>
            <NavLink to="/assistant">Assistant</NavLink>
            {user && <NavLink to="/sejours">Mes sejours</NavLink>}
            {user && !user.is_staff && (
              <NavLink to="/mon-hotel" className="btn "
                style={{ padding: ".35rem .9rem", fontSize: ".88rem" }}>
                + Mon hotel
              </NavLink>
            )}
          </div>
          <div className="nav-cta">
            {user ? (
              <>
                <Link to="/profil" style={{ fontSize: ".9rem", color: "var(--mist)", textDecoration: "none" }}>
                  {user.full_name || user.phone}
                </Link>
                <button className="btn btn-ghost" onClick={handleLogout}>Se deconnecter</button>
              </>
            ) : (
              <>
                <Link to="/mon-hotel" className="btn " style={{ fontSize: ".88rem" }}>
                  Mettre mon hotel en ligne
                </Link>
                <Link to="/connexion" className="btn btn-ghost">Se connecter</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <Link to="/" className="brand">mboa<span className="dot" />stay</Link>
        <span style={{ fontSize: ".88rem" }}>Se loger en confiance, partout au Cameroun</span>
      </div>
    </footer>
  );
}

export function Stars({ rating, count }) {
  const full = Math.round(Number(rating || 0));
  return (
    <span className="stars">
      {"\u2605".repeat(full)}{"\u2606".repeat(5 - full)}
      {count != null && <span className="count">{Number(rating).toFixed(1)} · {count} avis</span>}
    </span>
  );
}

export function SafetyBadge({ index }) {
  const level = index >= 4 ? "s-hi" : index >= 3 ? "s-mid" : "s-low";
  const label = index >= 4 ? "Quartier sur" : index >= 3 ? "Securite correcte" : "Prudence le soir";
  return (
    <span className={`safety ${level}`}>
      <Icon name="shield" className="ico" /> {label}
    </span>
  );
}

const AMENITY_LABELS = {
  has_generator: "Groupe electrogene",
  has_hot_water: "Eau chaude",
  has_ac: "Climatisation",
  has_wifi: "Wifi",
  has_parking: "Parking",
  has_restaurant: "Restauration",
};

export function AmenityChips({ amenities }) {
  const active = Object.entries(amenities || {}).filter(([, v]) => v);
  if (!active.length) return null;
  return (
    <div className="chips">
      {active.map(([key]) => (
        <span className="chip" key={key}>
          <Icon name={key} /> {AMENITY_LABELS[key]}
        </span>
      ))}
    </div>
  );
}

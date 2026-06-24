import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { HotelCard } from "../components/HotelCard";
import { Icon } from "../components/Icon";

const PROFILE_LABELS = {
  etudiant: "Etudiant", affaires: "Affaires", famille: "Famille", decouverte: "Decouverte",
};
const CITY_LABELS = {
  bafoussam: "Bafoussam", douala: "Douala", yaounde: "Yaounde",
};
const AMENITIES = [
  ["has_generator", "Groupe electrogene"],
  ["has_wifi", "Wifi"],
  ["has_ac", "Climatisation"],
  ["has_hot_water", "Eau chaude"],
  ["has_parking", "Parking"],
  ["has_restaurant", "Restauration"],
];
const BUDGETS = [
  ["", "Tous les budgets"],
  ["10000", "Max 10 000 FCFA"],
  ["18000", "Max 18 000 FCFA"],
  ["30000", "Max 30 000 FCFA"],
];

export default function Results() {
  const [params] = useSearchParams();
  const city    = params.get("city") || "bafoussam";
  const profile = params.get("profile") || "decouverte";
  const cityLabel = CITY_LABELS[city] || city;

  const [budget, setBudget] = useState("");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.search({ city, profile, budget_max: budget || null, filters })
      .then((d) => { if (active) setResults(d.results || []); })
      .catch(() => { if (active) setResults([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [city, profile, budget, JSON.stringify(filters)]);

  function toggle(key) {
    setFilters((f) => ({ ...f, [key]: !f[key] }));
  }

  return (
    <div className="page container">
      <div className="results-head">
        <div className="crumb">
          <Link to="/">Accueil</Link>
          <Icon name="arrow" style={{ width: 14, height: 14 }} />
          <span>Profil : {PROFILE_LABELS[profile]}</span>
        </div>
        <h2>A {cityLabel}, voici ce qu on te propose</h2>
      </div>

      <div className="results-layout">
        <aside className="filters">
          <h4>Affiner</h4>
          <div className="group">
            <label style={{ fontSize: ".82rem", color: "var(--mist)" }}>Budget / nuit</label>
            <select className="select" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ marginTop: ".4rem" }}>
              {BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="group">
            <h4>Equipements</h4>
            {AMENITIES.map(([key, label]) => (
              <label className="check" key={key}>
                <input type="checkbox" checked={!!filters[key]} onChange={() => toggle(key)} />
                {label}
              </label>
            ))}
          </div>
        </aside>

        <div className="results-list">
          {loading ? (
            [0,1,2].map((i) => <div key={i} className="skeleton" style={{ height: 230 }} />)
          ) : results.length === 0 ? (
            <div className="empty">
              <h3>Aucune adresse ne colle a ces criteres</h3>
              <p>Elargis ton budget ou retire un equipement.</p>
            </div>
          ) : (
            results.map((h, i) => <HotelCard key={h.id} hotel={h} rank={i + 1} />)
          )}
        </div>
      </div>
    </div>
  );
}

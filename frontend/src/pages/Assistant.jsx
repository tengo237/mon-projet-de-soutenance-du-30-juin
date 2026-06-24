import { useState } from "react";
import { api } from "../api";
import { HotelCard } from "../components/HotelCard";

const EXAMPLES = [
  "Hôtel calme près du campus à moins de 15 000 FCFA",
  "Je viens pour le boulot, il me faut du wifi fiable et un générateur",
  "On arrive en famille pour un mariage, quartier sûr",
  "Petit budget, juste à côté de la gare routière",
];

const PROFILE_LABELS = {
  etudiant: "Étudiant", affaires: "Affaires", famille: "Famille", decouverte: "Découverte",
};

export default function Assistant() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function ask(q) {
    const text = q ?? query;
    if (!text.trim()) return;
    setQuery(text);
    setLoading(true);
    try {
      const res = await api.assistant({ city: "bafoussam", query: text });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page container">
      <div className="assistant-wrap">
        <p className="eyebrow">Assistant d'arrivée</p>
        <h2>Dis-moi ce que tu cherches, en tes mots.</h2>

        <div className="assistant-card">
          <textarea
            className="textarea"
            placeholder="Ex : un hôtel propre et calme près de l'université, pas plus de 15 000 FCFA la nuit…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => ask(ex)}>{ex}</button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => ask()} disabled={loading}>
              {loading ? "Je cherche…" : "Trouver mon hôtel"}
            </button>
          </div>
        </div>

        {data && (
          <>
            <div className="understood">
              <span className="pill">Profil : {PROFILE_LABELS[data.understood.profile]}</span>
              {data.understood.budget_max && (
                <span className="pill">Budget : ≤ {new Intl.NumberFormat("fr-FR").format(data.understood.budget_max)} FCFA</span>
              )}
              {data.understood.located_landmark && <span className="pill">Lieu repéré ✓</span>}
            </div>
            <div className="results-list" style={{ marginTop: 14 }}>
              {data.results.length === 0
                ? <div className="empty"><h3>Je n'ai rien trouvé</h3><p>Reformule en précisant ton budget ou le quartier.</p></div>
                : data.results.map((h, i) => <HotelCard key={h.id} hotel={h} rank={i + 1} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

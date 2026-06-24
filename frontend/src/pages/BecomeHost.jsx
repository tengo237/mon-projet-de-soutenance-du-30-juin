import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

const AMENITIES = [
  { key: "has_wifi",       label: "Wifi" },
  { key: "has_generator",  label: "Groupe electrogene" },
  { key: "has_ac",         label: "Climatisation" },
  { key: "has_hot_water",  label: "Eau chaude" },
  { key: "has_parking",    label: "Parking" },
  { key: "has_restaurant", label: "Restauration" },
];

export default function BecomeHost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", city: "", quartier: "", address: "", description: "",
    price_from: "", cover_image_url: "",
    has_wifi: false, has_generator: false, has_ac: false,
    has_hot_water: false, has_parking: false, has_restaurant: false,
  });

  useEffect(() => {
    if (!user) navigate("/connexion", { state: { from: "/mon-hotel" } });
  }, [user]);

  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.city) {
      api.quartiers(form.city).then(setQuartiers).catch(() => setQuartiers([]));
    } else {
      setQuartiers([]);
    }
  }, [form.city]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function submit() {
    setError("");
    if (!form.name || !form.city || !form.quartier || !form.price_from) {
      setError("Remplis au moins le nom, la ville, le quartier et le prix."); return;
    }
    setBusy(true);
    try {
      await api.createHotel(form);
      setSuccess(true);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (success) {
    return (
      <div className="page container" style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>{"🎉"}</div>
        <h2 style={{ marginTop: "1rem" }}>Hotel soumis avec succes !</h2>
        <p style={{ color: "var(--mist)", maxWidth: "40ch", margin: "1rem auto" }}>
          Ton hotel est en cours de verification. Il sera visible apres validation.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Retour a l accueil</button>
      </div>
    );
  }

  return (
    <div className="page container" style={{ paddingTop: 40, maxWidth: 680 }}>
      <h1 style={{ marginBottom: ".3rem" }}>Mettre mon hotel en ligne</h1>
      <p style={{ color: "var(--mist)", marginBottom: "2rem" }}>
        Notre equipe validera ta fiche avant publication.
      </p>

      <div className="field">
        <label>Nom de l hotel *</label>
        <input className="input" placeholder="Ex : Residence Le Palmier"
          value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="field row2">
        <div>
          <label>Ville *</label>
          <select className="select" value={form.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">-- Choisir --</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label>Quartier *</label>
          <select className="select" value={form.quartier} onChange={(e) => set("quartier", e.target.value)}
            disabled={!form.city || quartiers.length === 0}>
            <option value="">-- Choisir --</option>
            {quartiers.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Adresse</label>
        <input className="input" placeholder="Ex : Rue des Manguiers"
          value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea className="input" rows={4} placeholder="Decris ton etablissement..."
          value={form.description} onChange={(e) => set("description", e.target.value)}
          style={{ resize: "vertical" }} />
      </div>

      <div className="field">
        <label>Prix par nuit (FCFA) *</label>
        <input className="input" type="number" min="1000" step="500" placeholder="Ex : 15000"
          value={form.price_from} onChange={(e) => set("price_from", e.target.value)} />
      </div>

      <div className="field">
        <label>URL de la photo principale</label>
        <input className="input" type="url" placeholder="https://..."
          value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} />
        {form.cover_image_url && (
          <img src={form.cover_image_url} alt="apercu"
            style={{ marginTop: ".6rem", width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
            onError={(e) => e.target.style.display = "none"} />
        )}
      </div>

      <div className="field">
        <label>Equipements</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginTop: ".4rem" }}>
          {AMENITIES.map(({ key, label }) => (
            <label key={key} style={{
              display: "flex", alignItems: "center", gap: ".4rem",
              background: form[key] ? "var(--moss)" : "var(--card)",
              color: form[key] ? "#fff" : "var(--ink)",
              padding: ".4rem .9rem", borderRadius: 20, cursor: "pointer", fontSize: ".88rem",
              border: "1px solid", borderColor: form[key] ? "var(--moss)" : "var(--border)",
            }}>
              <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}
                style={{ display: "none" }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <button className="btn btn-primary btn-block" onClick={submit} disabled={busy} style={{ marginTop: "1rem" }}>
        {busy ? "Envoi en cours..." : "Soumettre mon hotel"}
      </button>
    </div>
  );
}

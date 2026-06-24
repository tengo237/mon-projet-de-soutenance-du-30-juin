import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api, fmtFCFA } from "../api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Building2, Clock, CalendarDays, CalendarCheck2,
  Banknote, Users, Hotel, CheckCircle, XCircle,
  ShieldCheck, LayoutDashboard, LogOut, ArrowLeft,
  Trash2, UserCheck, UserX, BadgeCheck
} from "lucide-react";

const TABS = [
  { key: "stats",        label: "Dashboard",    Icon: LayoutDashboard },
  { key: "hotels",       label: "Hotels",       Icon: Building2 },
  { key: "reservations", label: "Reservations", Icon: CalendarDays },
  { key: "users",        label: "Utilisateurs", Icon: Users },
];

const TREND = [
  { day: "Lun", reservations: 2, revenus: 36000 },
  { day: "Mar", reservations: 5, revenus: 90000 },
  { day: "Mer", reservations: 3, revenus: 54000 },
  { day: "Jeu", reservations: 8, revenus: 144000 },
  { day: "Ven", reservations: 6, revenus: 108000 },
  { day: "Sam", reservations: 12, revenus: 216000 },
  { day: "Dim", reservations: 9, revenus: 162000 },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");

  useEffect(() => {
    if (!user) { navigate("/connexion"); return; }
    if (!user.is_staff) { navigate("/"); return; }
  }, [user]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width: 230, background: "#0f172a", display: "flex",
        flexDirection: "column", padding: "1.5rem 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 1.2rem 1.5rem", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#475569",
            letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".5rem" }}>Administration</div>
          <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: ".95rem" }}>{user?.full_name}</div>
          <div style={{ color: "#64748b", fontSize: ".78rem", marginTop: ".15rem" }}>Super administrateur</div>
        </div>

        <nav style={{ flex: 1, padding: "1rem .75rem", display: "flex", flexDirection: "column", gap: ".2rem" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: ".75rem",
              padding: ".65rem 1rem", borderRadius: 10, border: "none",
              cursor: "pointer", textAlign: "left", fontSize: ".88rem", fontWeight: 500,
              transition: "all .15s",
              background: tab === t.key ? "#1e293b" : "transparent",
              color: tab === t.key ? "#f1f5f9" : "#64748b",
              borderLeft: tab === t.key ? "3px solid #10b981" : "3px solid transparent",
            }}>
              <t.Icon size={16} strokeWidth={1.8} />
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "1rem .75rem", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <button onClick={() => navigate("/")} style={{
            display: "flex", alignItems: "center", gap: ".5rem",
            background: "none", border: "none", color: "#475569",
            fontSize: ".82rem", cursor: "pointer", padding: ".5rem 1rem", borderRadius: 8,
          }}>
            <ArrowLeft size={14} /> Retour au site
          </button>
          <button onClick={() => { logout(); navigate("/connexion"); }} style={{
            display: "flex", alignItems: "center", gap: ".5rem",
            background: "#1e293b", border: "none", color: "#94a3b8",
            fontSize: ".82rem", cursor: "pointer", padding: ".5rem 1rem", borderRadius: 8,
          }}>
            <LogOut size={14} /> Se deconnecter
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        {tab === "stats"        && <StatsPanel />}
        {tab === "hotels"       && <HotelsPanel />}
        {tab === "reservations" && <ReservationsPanel />}
        {tab === "users"        && <UsersPanel />}
      </main>
    </div>
  );
}

// ── STATS ──────────────────────────────────────────────────────────────────
function StatsPanel() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.adminStats().then(setStats).catch(() => {}); }, []);
  if (!stats) return <Skeleton />;

  const kpis = [
    { label: "Hotels actifs",    value: stats.hotels_verified,        color: "#10b981", bg: "#f0fdf4", Icon: Building2 },
    { label: "En attente",       value: stats.hotels_pending,         color: "#f59e0b", bg: "#fffbeb", Icon: Clock },
    { label: "Reservations",     value: stats.reservations_total,     color: "#3b82f6", bg: "#eff6ff", Icon: CalendarDays },
    { label: "Confirmees",       value: stats.reservations_confirmed, color: "#10b981", bg: "#f0fdf4", Icon: CalendarCheck2 },
    { label: "Revenus totaux",   value: fmtFCFA(stats.revenue_total), color: "#8b5cf6", bg: "#faf5ff", Icon: Banknote },
    { label: "Utilisateurs",     value: stats.users_total,            color: "#6b7280", bg: "#f8fafc", Icon: Users },
  ];

  const pieData = [
    { name: "Valides",    value: stats.hotels_verified, color: "#10b981" },
    { name: "En attente", value: stats.hotels_pending,  color: "#f59e0b" },
  ];

  const cityData = (stats.by_city || []).map((c) => ({ name: c.city, hotels: c.count }));

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>Dashboard</h1>
      <p style={{ color: "#94a3b8", margin: ".3rem 0 2rem", fontSize: ".9rem" }}>Vue d ensemble de la plateforme MboaStay</p>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: "1.25rem 1.5rem",
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.05)",
            display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <k.Icon size={22} color={k.color} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: ".78rem", color: "#94a3b8", marginTop: ".2rem" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphes ligne 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Courbe reservations */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem",
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h3 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Reservations — 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Area type="monotone" dataKey="reservations" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#blueGrad)" dot={{ fill: "#3b82f6", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut statut hotels */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem",
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h3 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Statut des hotels
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Legend iconType="circle" iconSize={10}
                formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphes ligne 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Bar chart villes */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem",
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h3 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Hotels par ville
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cityData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="hotels" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Courbe revenus */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem",
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h3 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Revenus — 7 derniers jours (FCFA)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v/1000 + "k"} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(v) => [fmtFCFA(v), "Revenus"]} />
              <Area type="monotone" dataKey="revenus" stroke="#8b5cf6" strokeWidth={2.5}
                fill="url(#purpleGrad)" dot={{ fill: "#8b5cf6", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── HOTELS ─────────────────────────────────────────────────────────────────
function HotelsPanel() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api.adminHotels().then(setHotels).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function verify(id, value) {
    setBusy(id);
    try {
      await api.verifyHotel(id, value);
      setHotels((p) => p.map((h) => h.id === id ? { ...h, is_verified: value } : h));
    } catch (e) { alert(e.message); } finally { setBusy(null); }
  }

  async function del(id) {
    if (!confirm("Supprimer cet hotel ?")) return;
    setBusy(id);
    try {
      await api.deleteHotel(id);
      setHotels((p) => p.filter((h) => h.id !== id));
    } catch (e) { alert(e.message); } finally { setBusy(null); }
  }

  const pending  = hotels.filter((h) => !h.is_verified);
  const verified = hotels.filter((h) => h.is_verified);
  const shown    = filter === "pending" ? pending : verified;

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>Hotels</h1>
          <p style={{ color: "#94a3b8", margin: ".3rem 0 0", fontSize: ".9rem" }}>Validation et gestion</p>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          {[["pending","En attente",pending.length],["verified","Valides",verified.length]].map(([k,l,n]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: ".5rem 1.1rem", borderRadius: 10, border: "1px solid",
              borderColor: filter === k ? "#0f172a" : "#e2e8f0",
              background: filter === k ? "#0f172a" : "#fff",
              color: filter === k ? "#fff" : "#64748b",
              cursor: "pointer", fontSize: ".85rem", fontWeight: 500 }}>
              {l} <span style={{ marginLeft: ".3rem", background: filter === k ? "rgba(255,255,255,.2)" : "#f1f5f9",
                color: filter === k ? "#fff" : "#64748b", borderRadius: 20,
                padding: ".1rem .45rem", fontSize: ".75rem" }}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton /> : shown.length === 0 ? (
        <Empty icon={<Hotel size={40} color="#cbd5e1" />}
          text={filter === "pending" ? "Aucun hotel en attente" : "Aucun hotel valide"} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {shown.map((h) => (
            <div key={h.id} style={{ background: "#fff", borderRadius: 14,
              border: "1px solid " + (!h.is_verified ? "#fde68a" : "#f1f5f9"),
              display: "flex", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
              <div style={{ width: 130, flexShrink: 0, background: "#f8fafc", minHeight: 120 }}>
                {h.cover_image_url
                  ? <img src={h.cover_image_url} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
                      justifyContent: "center" }}><Hotel size={32} color="#cbd5e1" /></div>}
              </div>
              <div style={{ flex: 1, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{h.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: ".82rem", marginTop: ".15rem" }}>{h.quartier} — {h.city}</div>
                    {h.description && <div style={{ color: "#64748b", fontSize: ".82rem", marginTop: ".4rem",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{h.description}</div>}
                  </div>
                  <span style={{ flexShrink: 0, fontSize: ".72rem", fontWeight: 600, padding: ".25rem .7rem", borderRadius: 20,
                    background: h.is_verified ? "#d1fae5" : "#fef3c7",
                    color: h.is_verified ? "#065f46" : "#92400e" }}>
                    {h.is_verified ? "Valide" : "En attente"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: ".75rem" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmtFCFA(h.price_from)}
                    <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: ".85rem" }}> / nuit</span>
                  </span>
                  <div style={{ display: "flex", gap: ".5rem" }}>
                    {!h.is_verified && (
                      <button onClick={() => verify(h.id, true)} disabled={busy === h.id} style={{
                        display: "flex", alignItems: "center", gap: ".35rem",
                        background: "#10b981", color: "#fff", border: "none", borderRadius: 8,
                        padding: ".4rem .9rem", fontSize: ".82rem", cursor: "pointer", fontWeight: 500 }}>
                        <CheckCircle size={14} /> {busy === h.id ? "..." : "Valider"}
                      </button>
                    )}
                    {h.is_verified && (
                      <button onClick={() => verify(h.id, false)} disabled={busy === h.id} style={{
                        display: "flex", alignItems: "center", gap: ".35rem",
                        background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8,
                        padding: ".4rem .9rem", fontSize: ".82rem", cursor: "pointer" }}>
                        <XCircle size={14} /> {busy === h.id ? "..." : "Retirer"}
                      </button>
                    )}
                    <button onClick={() => del(h.id)} disabled={busy === h.id} style={{
                      display: "flex", alignItems: "center", gap: ".35rem",
                      background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                      borderRadius: 8, padding: ".4rem .9rem", fontSize: ".82rem", cursor: "pointer" }}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RESERVATIONS ───────────────────────────────────────────────────────────
function ReservationsPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api.adminReservations().then(setReservations).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function cancel(id) {
    if (!confirm("Annuler cette reservation ?")) return;
    setBusy(id);
    try {
      await api.cancelReservation(id);
      setReservations((p) => p.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
    } catch (e) { alert(e.message); } finally { setBusy(null); }
  }

  const STATUS = {
    pending:   { label: "En attente", bg: "#fef3c7", color: "#92400e" },
    confirmed: { label: "Confirmee",  bg: "#d1fae5", color: "#065f46" },
    cancelled: { label: "Annulee",    bg: "#fee2e2", color: "#991b1b" },
  };

  const shown = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>Reservations</h1>
          <p style={{ color: "#94a3b8", margin: ".3rem 0 0", fontSize: ".9rem" }}>{reservations.length} reservation(s)</p>
        </div>
        <div style={{ display: "flex", gap: ".4rem" }}>
          {[["all","Toutes"],["pending","En attente"],["confirmed","Confirmees"],["cancelled","Annulees"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: ".4rem .9rem", borderRadius: 8, border: "1px solid",
              borderColor: filter === k ? "#0f172a" : "#e2e8f0",
              background: filter === k ? "#0f172a" : "#fff",
              color: filter === k ? "#fff" : "#64748b",
              cursor: "pointer", fontSize: ".82rem", fontWeight: 500 }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton /> : shown.length === 0 ? (
        <Empty icon={<CalendarDays size={40} color="#cbd5e1" />} text="Aucune reservation" />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
          overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Code","Hotel","Client","Dates","Montant","Statut",""].map((h,i) => (
                  <th key={i} style={{ padding: ".75rem 1rem", textAlign: "left", color: "#94a3b8",
                    fontSize: ".72rem", fontWeight: 600, textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < shown.length-1 ? "1px solid #f8fafc" : "none" }}>
                  <td style={{ padding: ".75rem 1rem", fontFamily: "monospace", fontSize: ".78rem", color: "#64748b" }}>{r.code}</td>
                  <td style={{ padding: ".75rem 1rem", fontWeight: 500, color: "#0f172a", maxWidth: 120,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.hotel_name}</td>
                  <td style={{ padding: ".75rem 1rem", color: "#64748b" }}>{r.user_name}</td>
                  <td style={{ padding: ".75rem 1rem", color: "#94a3b8", fontSize: ".78rem" }}>{r.checkin} → {r.checkout}</td>
                  <td style={{ padding: ".75rem 1rem", fontWeight: 600, color: "#0f172a" }}>{fmtFCFA(r.amount)}</td>
                  <td style={{ padding: ".75rem 1rem" }}>
                    <span style={{ padding: ".2rem .6rem", borderRadius: 20, fontSize: ".72rem", fontWeight: 600,
                      background: STATUS[r.status]?.bg, color: STATUS[r.status]?.color }}>
                      {STATUS[r.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: ".75rem 1rem" }}>
                    {r.status !== "cancelled" && (
                      <button onClick={() => cancel(r.id)} disabled={busy === r.id} style={{
                        display: "flex", alignItems: "center", gap: ".3rem",
                        background: "none", border: "none", color: "#ef4444",
                        fontSize: ".8rem", cursor: "pointer", fontWeight: 500, padding: 0 }}>
                        <XCircle size={13} /> {busy === r.id ? "..." : "Annuler"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── USERS ──────────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => { api.adminUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false)); }, []);

  async function toggleStaff(id, cur) {
    setBusy(id);
    try {
      await api.updateUser(id, { is_staff: !cur });
      setUsers((p) => p.map((u) => u.id === id ? { ...u, is_staff: !cur } : u));
    } catch (e) { alert(e.message); } finally { setBusy(null); }
  }

  async function toggleBlock(id, cur) {
    setBusy(id);
    try {
      await api.updateUser(id, { is_active: !cur });
      setUsers((p) => p.map((u) => u.id === id ? { ...u, is_active: !cur } : u));
    } catch (e) { alert(e.message); } finally { setBusy(null); }
  }

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>Utilisateurs</h1>
        <p style={{ color: "#94a3b8", margin: ".3rem 0 0", fontSize: ".9rem" }}>{users.length} compte(s)</p>
      </div>

      {loading ? <Skeleton /> : users.length === 0 ? (
        <Empty icon={<Users size={40} color="#cbd5e1" />} text="Aucun utilisateur" />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
          overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Nom","Contact","Role","Statut","Actions"].map((h) => (
                  <th key={h} style={{ padding: ".75rem 1rem", textAlign: "left", color: "#94a3b8",
                    fontSize: ".72rem", fontWeight: 600, textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length-1 ? "1px solid #f8fafc" : "none" }}>
                  <td style={{ padding: ".75rem 1rem", fontWeight: 500, color: "#0f172a" }}>{u.full_name || "—"}</td>
                  <td style={{ padding: ".75rem 1rem", color: "#64748b" }}>{u.phone}</td>
                  <td style={{ padding: ".75rem 1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: ".3rem",
                      padding: ".2rem .6rem", borderRadius: 20, fontSize: ".72rem", fontWeight: 600,
                      background: u.is_staff ? "#ede9fe" : "#f1f5f9",
                      color: u.is_staff ? "#6d28d9" : "#64748b" }}>
                      {u.is_staff ? <ShieldCheck size={11} /> : <Users size={11} />}
                      {u.is_staff ? "Admin" : "Utilisateur"}
                    </span>
                  </td>
                  <td style={{ padding: ".75rem 1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: ".3rem",
                      padding: ".2rem .6rem", borderRadius: 20, fontSize: ".72rem", fontWeight: 600,
                      background: u.is_active !== false ? "#d1fae5" : "#fee2e2",
                      color: u.is_active !== false ? "#065f46" : "#991b1b" }}>
                      {u.is_active !== false ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {u.is_active !== false ? "Actif" : "Bloque"}
                    </span>
                  </td>
                  <td style={{ padding: ".75rem 1rem" }}>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <button onClick={() => toggleStaff(u.id, u.is_staff)} disabled={busy === u.id} style={{
                        display: "flex", alignItems: "center", gap: ".3rem",
                        padding: ".3rem .7rem", borderRadius: 7, border: "1px solid #ede9fe",
                        background: "#faf5ff", color: "#7c3aed", fontSize: ".75rem", cursor: "pointer", fontWeight: 500 }}>
                        <BadgeCheck size={12} /> {u.is_staff ? "Retirer admin" : "Promouvoir"}
                      </button>
                      <button onClick={() => toggleBlock(u.id, u.is_active !== false)} disabled={busy === u.id} style={{
                        display: "flex", alignItems: "center", gap: ".3rem",
                        padding: ".3rem .7rem", borderRadius: 7, border: "1px solid",
                        borderColor: u.is_active !== false ? "#fecaca" : "#bbf7d0",
                        background: u.is_active !== false ? "#fef2f2" : "#f0fdf4",
                        color: u.is_active !== false ? "#ef4444" : "#10b981",
                        fontSize: ".75rem", cursor: "pointer", fontWeight: 500 }}>
                        {u.is_active !== false ? <UserX size={12} /> : <UserCheck size={12} />}
                        {u.is_active !== false ? "Bloquer" : "Debloquer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
      {[0,1,2].map((i) => (
        <div key={i} style={{ height: 80, background: "#f1f5f9", borderRadius: 14,
          animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ margin: "0 2.5rem", textAlign: "center", padding: "4rem",
      background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9" }}>
      <div style={{ marginBottom: ".75rem" }}>{icon}</div>
      <p style={{ color: "#94a3b8", margin: 0 }}>{text}</p>
    </div>
  );
}

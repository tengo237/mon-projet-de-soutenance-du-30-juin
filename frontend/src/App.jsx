import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth";
import { Footer, Header } from "./components/Shared";
import AdminDashboard from "./pages/AdminDashboard";
import Assistant from "./pages/Assistant";
import BecomeHost from "./pages/BecomeHost";
import Home from "./pages/Home";
import Hotel from "./pages/Hotel";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Results from "./pages/Results";
import Trips from "./pages/Trips";
import "./styles/global.css";

function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="app-shell">
      {!isAdmin && <Header />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/recherche"    element={<Results />} />
          <Route path="/hotels/:slug" element={<Hotel />} />
          <Route path="/assistant"    element={<Assistant />} />
          <Route path="/connexion"    element={<Login />} />
          <Route path="/sejours"      element={<Trips />} />
          <Route path="/mon-hotel"    element={<BecomeHost />} />
          <Route path="/profil"       element={<Profile />} />
          <Route path="/admin"        element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

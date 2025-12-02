import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Providers
import { ToastProvider } from "./components/Toast";
import { AccessibilityProvider } from "./context/AccessibilityContext";

// Components
import Navbar from "./components/Navbar";
import AccessibilityFab from "./components/AccessibilityFab";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Objava from "./pages/Objava";
import ObjavaDetalj from "./pages/ObjavaDetalj";
import Kalendar from "./pages/Kalendar"; // ✅ NOVO
import Kontakt from "./pages/Kontakt";
import Registracija from "./pages/Registracija";
import Login from "./pages/Login";
import Profil from "./pages/Profil";
import UserProfil from "./pages/UserProfil";
import AdminPanel from "./pages/AdminPanel";
import NotFoundOrFallback from "./pages/NotFoundOrFallback";

export default function App() {
  return (
    <AccessibilityProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <AccessibilityFab />

            <main className="flex-grow pt-8 md:pt-12">
              <Routes>
                {/* Javne stranice */}
                <Route path="/" element={<Home />} />
                <Route path="/objave" element={<Objava />} />
                <Route path="/objava/:id" element={<ObjavaDetalj />} />
                <Route path="/kalendar" element={<Kalendar />} /> {/* ✅ NOVO */}
                <Route path="/kontakt" element={<Kontakt />} />

                {/* Auth stranice */}
                <Route path="/login" element={<Login />} />
                <Route path="/registracija" element={<Registracija />} />

                {/* Zaštićene stranice */}
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <Profil />
                    </ProtectedRoute>
                  }
                />

                {/* Javni profili */}
                <Route path="/profil/:id" element={<UserProfil />} />

                {/* Admin panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundOrFallback />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AccessibilityProvider>
  );
}

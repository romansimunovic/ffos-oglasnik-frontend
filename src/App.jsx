// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import AccessibilityFab from "./components/AccessibilityFab.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Objava from "./pages/Objava.jsx";
import ObjavaDetalj from "./pages/ObjavaDetalj.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Registracija from "./pages/Registracija.jsx";
import Profil from "./pages/Profil.jsx";
import UserProfil from "./pages/UserProfil.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFoundOrFallback from "./pages/NotFoundOrFallback.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AccessibilityProvider } from "./context/AccessibilityContext.jsx";

export default function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <AccessibilityFab />

          <main className="flex-grow pt-8 md:pt-12">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Objave */}
              <Route path="/objave" element={<Objava />} />
              <Route path="/objava/:id" element={<ObjavaDetalj />} />

              {/* Kontakt / registracija */}
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/registracija" element={<Registracija />} />

              {/* Moj profil (trenutno prijavljeni korisnik) */}
              <Route path="/profil" element={<Profil />} />

              {/* Javni profil drugog korisnika */}
              <Route path="/profil/:id" element={<UserProfil />} />

              {/* Admin panel (zaštićena ruta) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* 404 / fallback */}
              <Route path="*" element={<NotFoundOrFallback />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AccessibilityProvider>
  );
}

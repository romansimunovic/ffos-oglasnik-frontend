import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AccessibilityFab from "./components/AccessibilityFab.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Objava from "./pages/Objava.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Registracija from "./pages/Registracija.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ObjavaDetalj from "./pages/ObjavaDetalj.jsx";
import Profil from "./pages/Profil.jsx";
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
              <Route path="/objave" element={<Objava />} />
              <Route path="/objava/:id" element={<ObjavaDetalj />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/registracija" element={<Registracija />} />
              <Route path="/profil" element={<Profil />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AccessibilityProvider>
  );
}

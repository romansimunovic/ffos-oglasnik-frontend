import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import Home from "./pages/Home.jsx";
import Objava from "./pages/Objava.jsx";
import NovaObjava from "./pages/NovaObjava.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Registracija from "./pages/Registracija.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ObjavaDetalj from "./pages/ObjavaDetalj.jsx";
import Profil from "./pages/Profil.jsx";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <Breadcrumbs />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/objave" element={<Objava />} />
            <Route path="/objava/:id" element={<ObjavaDetalj />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/registracija" element={<Registracija />} />
            <Route path="/profil" element={<Profil />} />
            <Route
              path="/nova-objava"
              element={
                <ProtectedRoute>
                  <NovaObjava />
                </ProtectedRoute>
              }
            />

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
  );
}

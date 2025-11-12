import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Objava from "./pages/Objava.jsx";
import NovaObjava from "./pages/NovaObjava.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Login from "./pages/Login.jsx";
import Registracija from "./pages/Registracija.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Inbox from "./pages/Inbox.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MojeObjave from "./pages/MojeObjave.jsx";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/objave" element={<Objava />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registracija" element={<Registracija />} />
            <Route path="/moje-objave" element={<MojeObjave />} />

            <Route
              path="/nova-objava"
              element={
                <ProtectedRoute>
                  <NovaObjava />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
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

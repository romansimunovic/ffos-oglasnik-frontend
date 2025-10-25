import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Oglasi from "./pages/Oglasi.jsx";
import Vijesti from "./pages/Vijesti.jsx";
import Kontakt from "./pages/Kontakt.jsx";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oglasi" element={<Oglasi />} />
          <Route path="/vijesti" element={<Vijesti />} />
          <Route path="/kontakt" element={<Kontakt />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

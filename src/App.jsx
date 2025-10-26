import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Objava from "./pages/Objava.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Inbox from "./pages/Inbox.jsx";
import AdminInbox from "./pages/AdminInbox.jsx";
import Login from "./pages/Login.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";


export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/objave" element={<Objava />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/admin" element={<AdminInbox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

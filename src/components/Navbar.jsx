import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/FFOS-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [korisnik, setKorisnik] = useState(null);

  useEffect(() => {
    const storedUser = {
      uloga: localStorage.getItem("uloga"),
      id: localStorage.getItem("korisnikId"),
    };
    if (storedUser.uloga) setKorisnik(storedUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setKorisnik(null);
    navigate("/login");
  };

  const linkStyle = (path) =>
    `hover:text-[#b41f24] transition ${
      location.pathname === path ? "text-[#b41f24] font-semibold" : "text-gray-700"
    }`;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
        {/* Logo i naslov */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="FFOS logo" className="w-10" />
          <span className="text-xl font-semibold text-[#b41f24]">
            FFOS Oglasnik
          </span>
        </div>

        {/* Navigacijski linkovi */}
        <div className="flex gap-6 text-sm font-medium items-center">
          <Link to="/" className={linkStyle("/")}>
            Početna
          </Link>
          <Link to="/objave" className={linkStyle("/objave")}>
            Objave
          </Link>

          {/* Admin vidi dashboard */}
          {korisnik?.uloga === "admin" && (
            <Link to="/admin" className={linkStyle("/admin")}>
              Admin panel
            </Link>
          )}

          {/* Svi prijavljeni vide inbox */}
          {korisnik && (
            <Link to="/inbox" className={linkStyle("/inbox")}>
              Inbox
            </Link>
          )}

          <Link to="/kontakt" className={linkStyle("/kontakt")}>
            Kontakt
          </Link>

          {/* Login / Logout */}
          {!korisnik ? (
            <Link
              to="/login"
              className="bg-[#b41f24] text-white px-3 py-1.5 rounded-md hover:bg-[#96181d] transition"
            >
              Prijava
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-[#b41f24] transition"
            >
              Odjava
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

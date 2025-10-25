import React from "react";
import logo from "../assets/FFOS-logo.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="FFOS logo" className="w-10" />
          <span className="text-xl font-semibold text-[#b41f24]">
            FFOS Oglasnik
          </span>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-[#b41f24] transition">Početna</Link>
          <Link to="/oglasi" className="hover:text-[#b41f24] transition">Oglasi</Link>
          <Link to="/vijesti" className="hover:text-[#b41f24] transition">Vijesti</Link>
          <Link to="/kontakt" className="hover:text-[#b41f24] transition">Kontakt</Link>
        </div>
      </div>
    </nav>
  );
}

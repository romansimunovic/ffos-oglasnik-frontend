import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-[#b41f24] shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo / naslov */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-wide text-white select-none"
        >
          FFOS Oglasnik
        </Link>

        {/* Navigacija */}
        <div className="flex gap-3 items-center">
          <Link
            to="/"
            className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
          >
            Početna
          </Link>
          <Link
            to="/objave"
            className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
          >
            Objave
          </Link>
          <Link
            to="/kontakt"
            className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
          >
            Kontakt
          </Link>

          {user?.uloga === "student" && (
            <Link
              to="/nova-objava"
              className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
            >
              Nova objava
            </Link>
          )}

          {user?.uloga === "admin" && (
            <>
              <Link
                to="/admin"
                className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
              >
                Admin panel
              </Link>
              <Link
                to="/inbox"
                className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
              >
                Inbox
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
            >
              Odjava
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
            >
              Prijava
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

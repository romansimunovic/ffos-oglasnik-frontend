import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FFOSLogo from "../assets/FFOS-logo.png";
import LoginModal from "./LoginModal.jsx";
import { useAccessibility } from "../context/AccessibilityContext";

export default function Navbar({ zahtjeviCount = 0 }) {
  const [loginOpen, setLoginOpen] = useState(false);
   const { dark } = useAccessibility();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };
  const handleProfileClick = () => {
    if (user) navigate("/profil");
    else setLoginOpen(true);
  };
  const onLoginSuccess = (userObj) => {
    setUser(userObj);
    setLoginOpen(false);
    navigate("/profil");
  };

  return (
    <>
      <nav
        className={`shadow-md border-b fixed w-full z-50 ${dark ? "bg-[#181926]" : "bg-[#b41f24]"}`}
        aria-label="Glavni meni"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-2">
          <div className="flex items-center gap-3">
            <img src={FFOSLogo} alt="FFOS logo" className="h-10 w-auto mr-2" />
            <Link
              to="/"
              className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
            >
              Početna
            </Link>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/objave"
              className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
            >
              Objave
            </Link>
            <Link
              to="/kontakt"
              className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
            >
              Kontakt
            </Link>
            {user?.uloga === "student" && (
              <Link
                to="/nova-objava"
                className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
              >
                Nova objava
              </Link>
            )}
            {user?.uloga === "admin" && (
              <div className="relative flex items-center">
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
                >
                  Admin panel
                </Link>
                {zahtjeviCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1">{zahtjeviCount}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleProfileClick}
              className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
            >
              Profil
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}
              >
                Odjava
              </button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={onLoginSuccess} />
    </>
  );
}
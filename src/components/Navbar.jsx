import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal.jsx";

// Prop: broj zahtjeva za admina
export default function Navbar({ zahtjeviCount = 0 }) {
  const [loginOpen, setLoginOpen] = useState(false);
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
    if (user) {
      navigate("/profil");
    } else {
      setLoginOpen(true);
    }
  };

  const onLoginSuccess = (userObj) => {
    setUser(userObj);
    setLoginOpen(false);
    navigate("/profil");
  };

  return (
    <>
      <nav className="bg-[#b41f24] shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
          <Link
            to="/"
            className="text-xl font-semibold tracking-wide text-white select-none"
          >
            FFOS Oglasnik
          </Link>
          <div className="flex gap-3 items-center">
            {/* Standardni linkovi dostupni svima */}
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

            {/* Student link */}
            {user?.uloga === "student" && (
              <Link
                to="/nova-objava"
                className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
              >
                Nova objava
              </Link>
            )}

            {/* Admin panel s badge brojem zahtjeva */}
            {user?.uloga === "admin" && (
              <div className="relative flex items-center">
                <Link
                  to="/admin"
                  className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
                >
                  Admin panel
                </Link>
                {zahtjeviCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1"
                    title={`${zahtjeviCount} zahtjeva za odobrenje`}
                  >
                    {zahtjeviCount}
                  </span>
                )}
              </div>
            )}

            {/* Profil (uvijek vidljiv) */}
            <button
              onClick={handleProfileClick}
              className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
            >
              Profil
            </button>
            {/* Odjava - prikazuje se samo ako je user prijavljen */}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
              >
                Odjava
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Login modal za neautorizirane korisnike */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={onLoginSuccess}
      />
    </>
  );
}

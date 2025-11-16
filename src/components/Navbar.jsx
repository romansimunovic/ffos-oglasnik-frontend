import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal.jsx";

export default function Navbar() {
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
              </>
            )}

            <button
              onClick={handleProfileClick}
              className="bg-white text-[#b41f24] px-4 py-1 rounded-md font-medium border border-[#b41f24]"
            >
              Profil
            </button>

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
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={onLoginSuccess}
      />
    </>
  );
}

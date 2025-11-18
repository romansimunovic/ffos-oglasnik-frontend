import { useAccessibility } from "../context/AccessibilityContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FFOSLogo from "../assets/FFOS-logo.png";
import LoginModal from "./LoginModal.jsx";
import { FaMoon, FaSun, FaBold, FaGlobe } from "react-icons/fa";

export default function Navbar({ zahtjeviCount = 0 }) {
  const { dark, setDark, bold, setBold, lang, setLang, t } = useAccessibility();
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [acOpen, setAcOpen] = useState(false);
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
      <nav className={`shadow-md border-b fixed w-full z-50 ${dark ? "bg-[#181926]" : "bg-[#b41f24]"}`} aria-label="Glavni meni">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-2">
          <div className="flex items-center gap-3">
            <img src={FFOSLogo} alt="FFOS logo" className="h-10 w-auto mr-2" />
            <Link to="/" className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("home")}</Link>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/objave" className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("posts")}</Link>
            <Link to="/kontakt" className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("contact")}</Link>
            {user?.uloga === "student" && (
              <Link to="/nova-objava" className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("newPost")}</Link>
            )}
            {user?.uloga === "admin" && (
              <div className="relative flex items-center">
                <Link to="/admin" className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("adminPanel")}</Link>
                {zahtjeviCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1">{zahtjeviCount}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setAcOpen(v => !v)}
              aria-label={t("accessibility")}
              className={`px-2 py-2 rounded border border-white bg-white text-[#b41f24] font-bold hover:bg-[#ffe5e9] focus:outline-none`}
              tabIndex={0}
            >
              <FaGlobe className="inline mr-2" />
              {t("language")}
            </button>
            {acOpen && (
              <div className="absolute right-5 top-14 bg-white shadow-lg border rounded-md p-4 z-50 min-w-[220px] flex flex-col gap-2">
                <button onClick={() => setDark(d => !d)} className="flex items-center gap-2 px-3 py-2 bg-[#f6f6fa] rounded font-bold border hover:bg-[#fedaee] transition">
                  {dark ? <FaSun/> : <FaMoon/>}
                  {dark ? t("lightMode") : t("darkMode")}
                </button>
                <button onClick={() => setBold(b => !b)} className="flex items-center gap-2 px-3 py-2 bg-[#f6f6fa] rounded font-bold border hover:bg-[#fedaee] transition">
                  <FaBold />
                  {t("boldFont")}
                </button>
                <label className="block mt-1 mb-0 font-bold" htmlFor="lang-select">{t("language")}:</label>
  <select
    value={lang}
    onChange={e => setLang(e.target.value)}
    id="lang-select"
    className="px-2 py-1 rounded border font-bold bg-[#f6f6fa] outline-none"
  >
    <option value="hr">{t("croatian")}</option>
    <option value="en">{t("english")}</option>
  </select>
  <button className="mt-2 px-3 py-1 rounded border font-bold bg-gray-200 hover:bg-red-100" onClick={() => setAcOpen(false)}>{t("close")}</button>
</div>
            )}
            <button onClick={handleProfileClick} className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("profile")}</button>
            {user && (
              <button onClick={handleLogout} className={`px-4 py-2 rounded font-bold border border-white text-lg ${dark ? "bg-gray-700 text-white" : "bg-white text-[#b41f24]"}`}>{t("logout")}</button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={onLoginSuccess} />
    </>
  );
}

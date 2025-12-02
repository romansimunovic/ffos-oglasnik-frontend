import { useAccessibility } from "../context/AccessibilityContext";
import { useState } from "react";
import { FaUniversalAccess, FaMoon, FaSun, FaBold, FaTimes } from "react-icons/fa";

export default function AccessibilityFab() {
  const { dark, setDark, setBold } = useAccessibility();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="access-fab"
        aria-label="Pristupačnost"
        onClick={() => setOpen(o => !o)}
      >
        <FaUniversalAccess size={26} />
      </button>
      {open && (
        <div className="access-panel">
          <button className="close-btn" onClick={() => setOpen(false)}>
            <FaTimes size={18}/>
          </button>
          <h3 className="access-title">Pristupačnost</h3>
          <button
            className="access-option"
            onClick={() => setDark(d => !d)}
          >
            {dark ? <FaSun /> : <FaMoon />}
            {dark ? "Svijetla tema" : "Tamna tema"}
          </button>
          <button
            className="access-option"
            onClick={() => setBold(b => !b)}
          >
            <FaBold /> Podebljaj tekst
          </button>
          <div className="access-desc">
            <strong>Upute:</strong>
            <ul>
              <li>Klikom gore mijenjate kontrast i čitljivost sučelja.</li>
              <li>Bold tekst olakšava za slabovidne.</li>
              <li>Korisno za pristupačnost i noćnu upotrebu.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

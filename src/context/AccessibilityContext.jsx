import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  hr: {
    home: "Početna",
    posts: "Objave",
    contact: "Kontakt",
    profile: "Profil",
    logout: "Odjava",
    adminPanel: "Admin panel",
    newPost: "Nova objava",
    accessibility: "Pristupačnost",
    darkMode: "Tamna tema",
    lightMode: "Svijetla tema",
    boldFont: "Podebljaj tekst",
    language: "Pristupačnost",
    croatian: "Hrvatski",
    english: "Engleski",
    details: "Detalji",
    login: "Prijava",
    registration: "Registracija",
    inbox: "Inbox",
    savePost: "Pohrani objavu",
    noPosts: "Nema dostupnih objava.",
    // filteri
    sve: "Sve",
    radionice: "Radionice",
    kvizovi: "Kvizovi",
    projekti: "Projekti",
    natječaji: "Natječaji",
    ostalo: "Ostalo",
    allDepartments: "Svi odsjeci",
    newest: "Najnovije",
    oldest: "Najstarije",
    send: "Pošalji",
    close: "Zatvori",
  },
  en: {
    home: "Home",
    posts: "Posts",
    contact: "Contact",
    profile: "Profile",
    logout: "Logout",
    adminPanel: "Admin panel",
    newPost: "New post",
    accessibility: "Accessibility",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    boldFont: "Bold text",
    language: "Language",
    details: "Details",
    login: "Login",
    registration: "Registration",
    inbox: "Inbox",
    savePost: "Save post",
    noPosts: "No available posts.",
    croatian: "Croatian",
    english: "English",
    sve: "All",
    radionice: "Workshops",
    kvizovi: "Quizzes",
    projekti: "Projects",
    natječaji: "Competitions",
    ostalo: "Other",
    allDepartments: "All departments",
    newest: "Newest",
    oldest: "Oldest",
    send: "Send",
    close: "Close",
  }
};

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export function AccessibilityProvider({ children }) {
  const [dark, setDark] = useState(
    localStorage.getItem("dark") === "true"
  );
  const [bold, setBold] = useState(
    localStorage.getItem("bold") === "true"
  );
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "hr"
  );

  // persist changes
  useEffect(() => {
    localStorage.setItem("dark", dark);
    localStorage.setItem("bold", bold);
    localStorage.setItem("lang", lang);
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    if (bold) document.body.classList.add("font-bold");
    else document.body.classList.remove("font-bold");
  }, [dark, bold, lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <AccessibilityContext.Provider
      value={{
        dark, setDark,
        bold, setBold,
        lang, setLang,
        t // funkcija za prijevod
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();
export const useAccessibility = () => useContext(AccessibilityContext);

export function AccessibilityProvider({ children }) {
  const [dark, setDark] = useState(localStorage.getItem("dark") === "true");
  const [bold, setBold] = useState(localStorage.getItem("bold") === "true");

  useEffect(() => {
    localStorage.setItem("dark", dark);
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("bold", bold);
    if (bold) document.body.classList.add("font-bold");
    else document.body.classList.remove("font-bold");
  }, [dark, bold]);

  return (
    <AccessibilityContext.Provider value={{ dark, setDark, bold, setBold }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

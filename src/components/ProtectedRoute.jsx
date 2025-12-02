import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Ako nema tokena → Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Ako je adminOnly, a korisnik nije admin → 404
  if (adminOnly && user.uloga !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Sve OK → prikaži children
  return children;
}

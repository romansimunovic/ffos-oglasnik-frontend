import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";

export default function Profil() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [spremljene, setSpremljene] = useState([]);

  if (!user)
    return <p className="text-center my-6 text-red-600">Niste prijavljeni.</p>;

  useEffect(() => {
    if (user.uloga !== "admin") {
      const fetchSpremljene = async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await api.get("/korisnik/spremljene", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSpremljene(data || []);
        } catch {
          setSpremljene([]);
        }
      };
      fetchSpremljene();
      const handler = () => fetchSpremljene();
      window.addEventListener("refreshSpremljene", handler);
      return () => window.removeEventListener("refreshSpremljene", handler);
    }
  }, [user.uloga]);

  return (
    <section className="page-bg">
      <div className="container">
        <div className="card profile-card">
          <h2>Moj Profil</h2>
          <p><span className="font-bold">Ime: </span>{user.ime}</p>
          <p><span className="font-bold">Email: </span>{user.email}</p>
          <p><span className="font-bold">Uloga: </span>{user.uloga}</p>
        </div>
        {user.uloga !== "admin" && (
          <section className="card saved-card">
            <h3>Spremljene objave</h3>
            {spremljene.length === 0 ? (
              <p>Još nemaš spremljenih objava.</p>
            ) : (
              <div className="card-grid">
                {spremljene.map((o) => (
                  <Link key={o._id} to={`/objava/${o._id}`} className="card-link">
                    <div className="card saved-post">
                      <h4>{o.naslov || "Bez naslova"}</h4>
                      <p>{o.sadrzaj?.length > 120 ? o.sadrzaj.slice(0, 120) + "..." : o.sadrzaj || "Nema opisa."}</p>
                      <p className="card-date">{o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}

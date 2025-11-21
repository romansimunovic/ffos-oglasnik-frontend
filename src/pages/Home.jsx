import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [objave, setObjave] = useState([]);

  useEffect(() => {
    fetch("/api/objave")
      .then((res) => res.json())
      .then((data) => setObjave(data));
  }, []);

  return (
    <section className="page-bg">
      <div className="container">
        <div className="text-center mb-12">
          <h1>FFOS Oglasnik</h1>
          <p className="home-subtitle" style={{ marginTop: "-1rem" }}>
            Digitalni prostor Filozofskog fakulteta u Osijeku za dijeljenje studentskih projekata, radionica i akademskih prilika.
          </p>
          <div className="home-underline"></div>
        </div>
        {objave.length === 0 ? (
          <div className="center-msg">
            <p>Nema dostupnih objava.</p>
          </div>
        ) : (
          <div className="card-grid">
            {objave.slice(0, 3).map((o) => (
              <Link to={`/objava/${o._id}`} key={o._id}>
                <div className="card">
                  <h2>{o.naslov}</h2>
                  <p className="card-desc">
                    {o.sadrzaj.length > 120
                      ? o.sadrzaj.slice(0, 120) + "..."
                      : o.sadrzaj}
                  </p>
                  <p className="card-date">
                    {new Date(o.datum).toLocaleDateString("hr-HR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

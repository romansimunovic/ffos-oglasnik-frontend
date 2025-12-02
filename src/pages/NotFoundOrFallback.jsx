import { Link } from "react-router-dom";

export default function NotFoundOrFallback() {
  return (
    <section className="page-bg">
      <div className="container" style={{ textAlign: "center", paddingTop: "6rem" }}>
        <h1 style={{ fontSize: "6rem", margin: 0, color: "var(--ffos-red)" }}>
          404
        </h1>
        <h2 style={{ color: "#666" }}>Stranica nije pronađena</h2>
        <p style={{ marginBottom: "2rem" }}>
          Stranica koju tražite ne postoji ili je premještena.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>
          <button className="form-submit" style={{ maxWidth: 200 }}>
            Povratak na početnu
          </button>
        </Link>
      </div>
    </section>
  );
}

// src/pages/Kontakt.jsx
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function Kontakt() {
  return (
    <section className="page-bg" style={{ backgroundColor: "#f7f7f7", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className="card card-static"
        style={{
          maxWidth: 500,
          width: "90%",
          margin: "2rem auto",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ color: "#a80b1d", marginBottom: "1rem" }}>Kontakt</h1>
        <p
          className="kontakt-text"
          style={{
            fontSize: "1.05rem",
            marginBottom: "1.5rem",
            color: "#333",
            lineHeight: 1.5,
          }}
        >
          Imate upit, prijedlog ili želite suradnju? Javite nam se putem e-mail adrese:
        </p>
        <a
          href="mailto:oglasnik@ffos.hr"
          className="kontakt-email"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#a80b1d",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d4182d"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#a80b1d"}
        >
          <MailOutlineIcon />
          Pošalji mail
        </a>
      </div>
    </section>
  );
}

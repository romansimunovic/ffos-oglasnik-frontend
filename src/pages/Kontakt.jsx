export default function Kontakt() {
  return (
    <section className="page-bg">
      <div
        className="container flex items-center justify-center"
        style={{ minHeight: "55vh" }}
      >
        <div
          className="card card-static"
          style={{
            maxWidth: 470,
            margin: "3rem auto",
            textAlign: "center",
          }}
        >
          <h1>Kontakt</h1>
          <p
            className="kontakt-text"
            style={{
              fontSize: "1.08rem",
              marginBottom: "1.2rem",
              color: "inherit",
            }}
          >
            Za sve upite ili prijedloge za poboljšanja, možete nas kontaktirati
            putem e-mail adrese:
          </p>
          <a
            href="mailto:oglasnik@ffos.hr"
            className="kontakt-email"
            style={{
              fontWeight: 700,
              fontSize: "1.15rem",
              textDecoration: "underline",
            }}
          >
            oglasnik@ffos.hr
          </a>
        </div>
      </div>
    </section>
  );
}

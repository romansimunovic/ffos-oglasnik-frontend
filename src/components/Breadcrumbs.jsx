import { Link, useLocation } from "react-router-dom";

const routeLabelMap = {
  "/": "Početna",
  "/objave": "Objave",
  "/nova-objava": "Nova objava",
  "/kontakt": "Kontakt",
  "/login": "Prijava",
  "/registracija": "Registracija",
  "/inbox": "Inbox",
  "/admin": "Admin panel",
  "/profil": "Profil",
  "/objava": "Objava", // statički naziv
};

// Funkcija za detekciju Mongo ID-a (24 heks znakova)
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-gray-700 px-8 py-3 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        <li>
          <Link to="/" className="hover:underline text-[#b41f24]">
            Početna
          </Link>
        </li>
        {pathnames.map((segment, idx) => {
          const to = "/" + pathnames.slice(0, idx + 1).join("/");
          let label = routeLabelMap[to];

          // Ako je segment ID, prikaži "Detalji" ili slično
          if (!label && isObjectId(segment)) {
            label = "Detalji";
          } else if (!label) {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }

          return (
            <li key={to}>
              <span className="mx-2">/</span>
              {idx === pathnames.length - 1 ? (
                <span className="font-semibold">{label}</span>
              ) : (
                <Link to={to} className="hover:underline text-[#b41f24]">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

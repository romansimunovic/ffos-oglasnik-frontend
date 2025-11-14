import { Link, useLocation } from "react-router-dom";

const routeLabelMap = {
  "/": "Početna",
  "/objave": "Objave",
  "/nova-objava": "Nova objava",
  "/kontakt": "Kontakt",
  "/login": "Prijava",
  "/registracija": "Registracija",
  "/moje-objave": "Moje objave",
  "/inbox": "Inbox",
  "/admin": "Admin panel",
};

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
        {pathnames.map((_, idx) => {
          const to = "/" + pathnames.slice(0, idx + 1).join("/");
          return (
            <li key={to}>
              <span className="mx-2">/</span>
              {idx === pathnames.length - 1 ? (
                <span className="font-semibold">{routeLabelMap[to] || to}</span>
              ) : (
                <Link to={to} className="hover:underline text-[#b41f24]">
                  {routeLabelMap[to] || to}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

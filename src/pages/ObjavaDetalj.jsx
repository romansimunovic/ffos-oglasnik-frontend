import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ODSJECI } from "../constants/odsjeci";
import Linkify from "linkify-react";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/objave/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setObjava(data);
        setLoading(false);
      });
  }, [id]);

  if (loading || !objava)
    return <p className="center-msg">Nema dostupnih objava.</p>;

  // Opcije za linkify-react: podržava automatsko linkanje weba, telefona i e-maila
  const options = {
    nl2br: true,
    defaultProtocol: "https",
    formatHref: {
      tel: (href) => href,
      mailto: (href) => href
    }
  };

  return (
    <section className="page-bg">
      <div className="container">
        <div className="card">
          <h1>{objava.naslov}</h1>
          <p className="card-desc">
            <Linkify options={options}>{objava.sadrzaj}</Linkify>
          </p>
          <div className="meta-info">
            <span>Tip: {objava.tip}</span>
            <span>Odsjek: {ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.naziv || "-"}</span>
            <span>Autor: {objava.autor || "Nepoznato"}</span>
            <span className="card-date">{objava.datum ? new Date(objava.datum).toLocaleDateString("hr-HR") : ""}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

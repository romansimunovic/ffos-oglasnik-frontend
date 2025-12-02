import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ODSJECI } from "../constants/odsjeci";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/objave/${id}`);
        if (mounted) setObjava(res.data);
      } catch (err) {
        console.error("fetch objava detail:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link kopiran!", "success");
  };

  if (loading || !objava)
    return <p className="center-msg">Učitavanje objave...</p>;

  const autor =
    objava.autor && typeof objava.autor === "object" ? objava.autor : null;
  const autorIme = autor?.ime || objava.autor || "Nepoznato";
  const autorId = autor?._id || objava.autorId || null;
  const autorAvatar = autor?.avatar || objava.autorAvatar || null;

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  const avatarSrc = buildAvatarSrc(autorAvatar);

  return (
    <section className="page-bg">
      <div className="container">
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <img
              src={avatarSrc}
              alt={`Avatar ${autorIme}`}
              className="tiny-avatar"
              style={{ cursor: autorId ? "pointer" : "default" }}
              onClick={() => autorId && navigate(`/profil/${autorId}`)}
            />
            <div>
              <h1 style={{ margin: 0 }}>{objava.naslov}</h1>
              <div style={{ color: "#666", fontSize: 14 }}>{autorIme}</div>
            </div>
          </div>

          <p className="card-desc">
            <Linkify options={{ nl2br: true }}>{objava.sadrzaj}</Linkify>
          </p>

          <div className="meta-info">
            <span>Tip: {objava.tip}</span>
            <span>
              Odsjek:{" "}
              {ODSJECI.find(
                (x) => x.id === (objava.odsjek?._id || objava.odsjek)
              )?.naziv || "-"}
            </span>
            <span className="card-date">
              {objava.datum
                ? new Date(objava.datum).toLocaleDateString("hr-HR")
                : ""}
            </span>
            <span title="Broj spremanja">★ {objava.saves || 0}</span>
            <span title="Broj pregleda">👁 {objava.views || 0}</span>
          </div>

          <Button
            variant="outlined"
            color="primary"
            onClick={copyLink}
            style={{ marginTop: "1rem" }}
            startIcon={<span></span>}
          >
            Podijeli objavu
          </Button>
        </div>
      </div>
    </section>
  );
}

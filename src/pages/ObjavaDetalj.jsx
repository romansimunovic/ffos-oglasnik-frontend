import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ODSJECI } from "../constants/odsjeci";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast("Link kopiran!", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
      toast("Ne mogu kopirati link.", "error");
    }
  };

  if (loading || !objava)
    return <p className="center-msg">Učitavanje objave...</p>;
  const shareText = objava?.naslov || "Pogledaj ovu objavu";

  const facebookUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(currentUrl);

  const twitterUrl =
    "https://twitter.com/intent/tweet?url=" +
    encodeURIComponent(currentUrl) +
    "&text=" +
    encodeURIComponent(shareText);

  const whatsappUrl =
    "https://wa.me/?text=" + encodeURIComponent(shareText + " " + currentUrl);

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
            onClick={() => setShareOpen(true)}
            style={{ marginTop: "1rem" }}
          >
            Podijeli objavu
          </Button>
        </div>
        {/* ⬇️ OVDJE IDE DIJALOG */}
        <Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
          <DialogTitle>Podijeli objavu</DialogTitle>
          <DialogContent dividers>
            <p>Odaberi način dijeljenja:</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.5rem",
                minWidth: "260px",
              }}
            >
              <Button
                variant="contained"
                onClick={() => window.open(facebookUrl, "_blank", "noopener")}
                startIcon={<FacebookIcon />}
              >
                Facebook
              </Button>

              <Button
                variant="contained"
                onClick={() => window.open(whatsappUrl, "_blank", "noopener")}
                startIcon={<WhatsAppIcon />}
              >
                WhatsApp
              </Button>

              <Button
                variant="contained"
                onClick={() => window.open(twitterUrl, "_blank", "noopener")}
                startIcon={<TwitterIcon />}
              >
                Twitter
              </Button>

              <Button
                variant="outlined"
                onClick={copyLink}
                startIcon={<InstagramIcon />}
              >
                {copied ? "Link kopiran" : "Kopiraj link"}
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareOpen(false)}>Zatvori</Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}

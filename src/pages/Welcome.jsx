import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ako nije logiran, vrati ga na login
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleContinue = () => {
    // jednostavno: svi dalje na objave (možeš promijeniti po ulozi)
    navigate("/objave");
  };

  return (
    <section className="page-bg">
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box
          className="card card-static"
          sx={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 18px rgba(40,30,50,0.16)",
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "var(--ffos-red)", fontWeight: 700 }}
          >
            Dobrodošli, {user.ime}!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#555" }}>
            Uspješno ste se prijavili na FFOS Oglasnik. Možete pregledavati i
            objavljivati oglase.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
            sx={{
              backgroundColor: "var(--ffos-red)",
              "&:hover": { backgroundColor: "#8a1519" },
              px: 4,
            }}
          >
            Nastavi na objave
          </Button>
        </Box>
      </Box>
    </section>
  );
}

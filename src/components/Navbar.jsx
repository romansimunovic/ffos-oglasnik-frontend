import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import FFOSLogo from "../assets/FFOS-logo.png";
import api from "../api/axiosInstance";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout: authLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [zahtjeviCount, setZahtjeviCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  // Broj zahtjeva za admina
  useEffect(() => {
    if (user?.uloga === "admin") fetchZahtjeviCount();
  }, [user, location.pathname]);

  const fetchZahtjeviCount = async () => {
    try {
      const { data } = await api.get("/objave/admin/sve");
      setZahtjeviCount(data.filter((o) => o.status === "na čekanju").length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    authLogout();
    toast("Uspješno ste odjavljeni.", "success");
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate(user ? "/profil" : "/login");
  };

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  // build avatar src; fallback na public/default-avatar.png
  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http")) return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL?.replace(/\/api\/?$/i, "") || "";
    return `${base}${avatarPath}?t=${Date.now()}`;
  };

  const avatarSrc = buildAvatarSrc(user?.avatar);

  const navLinks = [
    { name: "Početna", href: "/" },
    { name: "Objave", href: "/objave" },
    { name: "Kalendar", href: "/kalendar" },
    { name: "Kontakt", href: "/kontakt" },
  ];

  // DESKTOP NAV
  const DesktopNav = (
    <Box className="navbar-inner" sx={{ width: "100%", display: "flex", alignItems: "center" }}>
      {/* Lijevi dio – logo skroz lijevo */}
      <Box className="navbar-section navbar-section-left" sx={{ display: "flex", alignItems: "center" }}>
        <Box className="navbar-logo-group" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
          <img src={FFOSLogo} alt="FFOS" className="navbar-logo" />
        </Box>
      </Box>

      {/* Srednji dio – linkovi u sredini */}
      <Box className="navbar-section navbar-section-center" sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
        <Box className="navbar-links">
          {navLinks.map((link) => (
            <Button
              key={link.name}
              component={Link}
              to={link.href}
              className={location.pathname === link.href ? "navbar-link navbar-link-active" : "navbar-link"}
            >
              {link.name}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Desni dio – admin, prijava/odjava i avatar skroz desno */}
      <Box className="navbar-section navbar-section-right" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {user?.uloga === "admin" && (
          <Button component={Link} to="/admin" className="navbar-chip">
            Admin panel
            {zahtjeviCount > 0 && <span className="navbar-chip-badge">{zahtjeviCount}</span>}
          </Button>
        )}

        {user ? (
          <>
            {/* Odjava */}
            <Button onClick={handleLogout} startIcon={<LogoutIcon />} className="navbar-logout">
              Odjava
            </Button>

            {/* Avatar (koristi default-avatar.png ako nema user.avatar) */}
            <IconButton onClick={handleProfileClick} className="navbar-avatar-btn" sx={{ p: 0 }}>
              <Avatar
                src={avatarSrc}
                alt={user.ime || "Profil"}
                className="navbar-avatar"
                sx={{ width: 36, height: 36, border: "2px solid rgba(255,255,255,0.12)" }}
              />
            </IconButton>
          </>
        ) : (
          <>
            {/* Prijava + default avatar */}
            <Button component={Link} to="/login" className="navbar-logout">
              Prijava
            </Button>
            <IconButton onClick={handleProfileClick} className="navbar-avatar-btn" sx={{ p: 0 }}>
              <Avatar
                src="/default-avatar.png"
                alt="Prijava"
                className="navbar-avatar"
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );

  // MOBILNI DRAWER ostaje isto
  const MobileDrawer = (
    <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer}>
      <List className="navbar-drawer" sx={{ width: 250 }}>
        <ListItem>
          <ListItemButton onClick={toggleDrawer}>Zatvori</ListItemButton>
        </ListItem>

        {navLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton component={Link} to={link.href} onClick={toggleDrawer}>
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}

        {user ? (
          <>
            <Divider sx={{ bgcolor: "var(--ffos-light-card)" }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleDrawer();
                  handleProfileClick();
                }}
              >
                <ListItemText primary="Profil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleDrawer();
                  handleLogout();
                }}
              >
                <ListItemText primary="Odjava" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login" onClick={toggleDrawer}>
              <ListItemText primary="Prijava" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar position="static" className="navbar" sx={{ zIndex: 2000 }}>
      {isMobile ? (
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
          {/* LOGO LJEVO */}
          <Box className="navbar-logo-group" sx={{ display: "flex", alignItems: "center", cursor: "pointer", flexGrow: 1 }} onClick={() => navigate("/")}>
            <img src={FFOSLogo} alt="FFOS" className="navbar-logo" />
          </Box>

          {/* BURGER DESNO */}
          <IconButton color="inherit" onClick={toggleDrawer} sx={{ marginLeft: "auto" }}>
            <MenuIcon />
          </IconButton>

          {MobileDrawer}
        </Toolbar>
      ) : (
        <Toolbar>{DesktopNav}</Toolbar>
      )}
    </AppBar>
  );
}

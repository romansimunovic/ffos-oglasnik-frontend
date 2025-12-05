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

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return null;
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
    <Box className="navbar-inner">
      {/* Lijevi dio – logo skroz lijevo */}
      <Box className="navbar-section navbar-section-left">
        <Box className="navbar-logo-group" onClick={() => navigate("/")}>
          <img src={FFOSLogo} alt="FFOS" className="navbar-logo" />
          <span className="navbar-title">FFOS Oglasnik</span>
        </Box>
      </Box>

      {/* Srednji dio – linkovi u sredini */}
      <Box className="navbar-section navbar-section-center">
        <Box className="navbar-links">
          {navLinks.map((link) => (
            <Button
              key={link.name}
              component={Link}
              to={link.href}
              className={
                location.pathname === link.href
                  ? "navbar-link navbar-link-active"
                  : "navbar-link"
              }
            >
              {link.name}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Desni dio – admin, prijava/odjava i avatar skroz desno */}
      <Box className="navbar-section navbar-section-right">
        {user?.uloga === "admin" && (
          <Button component={Link} to="/admin" className="navbar-chip">
            Admin panel
            {zahtjeviCount > 0 && (
              <span className="navbar-chip-badge">{zahtjeviCount}</span>
            )}
          </Button>
        )}

        {user ? (
          <>
            {/* Prvo gumb Odjava */}
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              className="navbar-logout"
            >
              Odjava
            </Button>

            {/* Pa desno od njega avatar */}
            <IconButton
              onClick={handleProfileClick}
              className="navbar-avatar-btn"
            >
              {avatarSrc ? (
                <Avatar
                  src={avatarSrc}
                  alt={user.ime}
                  className="navbar-avatar"
                />
              ) : (
                <Avatar className="navbar-avatar">
                  {user.ime?.charAt(0) || "U"}
                </Avatar>
              )}
            </IconButton>
          </>
        ) : (
          <>
            {/* Za neprijavljenog: Prijava + generički avatar desno */}
            <Button component={Link} to="/login" className="navbar-logout">
              Prijava
            </Button>
            <IconButton
              onClick={handleProfileClick}
              className="navbar-avatar-btn"
            >
              <Avatar className="navbar-avatar">?</Avatar>
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );

  // MOBILNI DRAWER ostaje isto
  const MobileDrawer = (
    <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer}>
      <List className="navbar-drawer">
        <ListItem>
          <ListItemButton onClick={toggleDrawer}>Zatvori</ListItemButton>
        </ListItem>

        {navLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton
              component={Link}
              to={link.href}
              onClick={toggleDrawer}
            >
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
    <AppBar position="static" className="navbar">
      {isMobile ? (
        <Toolbar>
          <IconButton color="inherit" onClick={toggleDrawer}>
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

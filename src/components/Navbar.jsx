import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Badge,
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

  const DesktopNav = (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Link to="/">
        <img
          src={FFOSLogo}
          alt="FFOS"
          style={{ height: 48, cursor: "pointer" }}
        />
      </Link>

      <Box sx={{ display: "flex", gap: 2, ml: 4 }}>
        {navLinks.map((link) => (
          <Button
            key={link.name}
            component={Link}
            to={link.href}
            sx={{
              color: "#fff",
              fontWeight: location.pathname === link.href ? "bold" : "normal",
              borderBottom:
                location.pathname === link.href ? "2px solid #fff" : "none",
              borderRadius: 0,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            {link.name}
          </Button>
        ))}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {user?.uloga === "admin" && (
        <Badge badgeContent={zahtjeviCount} color="error" sx={{ mr: 2 }}>
          <Button
            component={Link}
            to="/admin"
            variant="contained"
            sx={{
              backgroundColor: "#fff",
              color: "#b41f24",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            Admin panel
          </Button>
        </Badge>
      )}

      {user ? (
        <>
          <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
            {avatarSrc ? (
              <Avatar src={avatarSrc} alt={user.ime} />
            ) : (
              <Avatar sx={{ bgcolor: "#fff", color: "#b41f24" }}>
                {user.ime?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </IconButton>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              ml: 1,
              color: "#fff",
              textTransform: "none",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Odjava
          </Button>
        </>
      ) : (
        <Button
          component={Link}
          to="/login"
          variant="contained"
          sx={{
            backgroundColor: "#fff",
            color: "#b41f24",
            fontWeight: "bold",
            ml: 2,
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          Prijava
        </Button>
      )}
    </Box>
  );

  const MobileDrawer = (
    <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer}>
      <List sx={{ width: 250, bgcolor: "#b41f24", color: "#fff" }}>
        <ListItem>
          <ListItemButton onClick={toggleDrawer}>
            Zatvori
          </ListItemButton>
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
        {user && (
          <>
            <Divider sx={{ bgcolor: "#fff" }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => { toggleDrawer(); handleProfileClick(); }}>
                <ListItemText primary="Profil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { toggleDrawer(); handleLogout(); }}>
                <ListItemText primary="Odjava" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!user && (
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
  <Toolbar className="navbar-inner">
    {isMobile ? (
      <>
        <IconButton color="inherit" onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>
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
                <Divider sx={{ bgcolor: "#fff" }} />
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
                <ListItemButton
                  component={Link}
                  to="/login"
                  onClick={toggleDrawer}
                >
                  <ListItemText primary="Prijava" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Drawer>
      </>
    ) : (
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Link to="/">
          <img
            src={FFOSLogo}
            alt="FFOS"
            style={{ height: 48, cursor: "pointer" }}
          />
        </Link>

        <Box sx={{ display: "flex", gap: 2, ml: 4 }}>
          {navLinks.map((link) => (
            <Button
              key={link.name}
              component={Link}
              to={link.href}
              className="navbar-btn"
            >
              {link.name}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user?.uloga === "admin" && (
          <Badge badgeContent={zahtjeviCount} color="error" className="zahtjev-badge">
            <Button component={Link} to="/admin" className="navbar-btn">
              Admin panel
            </Button>
          </Badge>
        )}

        {user ? (
          <>
            <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
              {avatarSrc ? (
                <Avatar src={avatarSrc} alt={user.ime} />
              ) : (
                <Avatar className="navbar-btn">{user.ime?.charAt(0)}</Avatar>
              )}
            </IconButton>
            <Button onClick={handleLogout} startIcon={<LogoutIcon />} className="navbar-btn">
              Odjava
            </Button>
          </>
        ) : (
          <Button component={Link} to="/login" className="navbar-btn">
            Prijava
          </Button>
        )}
      </Box>
    )}
  </Toolbar>
</AppBar>

  );
}

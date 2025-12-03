import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
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
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import FFOSLogo from "../assets/FFOS-logo.png";
import api from "../api/axiosInstance";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext"; // ✅ NOVO

export default function Navbar() {
  const { user, logout: authLogout } = useAuth(); // ✅ KORISTI CONTEXT
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [zahtjeviCount, setZahtjeviCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  // Dohvati broj objava na čekanju za admina
  useEffect(() => {
    if (user?.uloga === "admin") {
      fetchZahtjeviCount();
    }
  }, [user, location.pathname]);

  const fetchZahtjeviCount = async () => {
    try {
      const { data } = await api.get("/objave/admin/sve");
      const pending = data.filter((o) => o.status === "na čekanju");
      setZahtjeviCount(pending.length);
    } catch (err) {
      console.error("fetch zahtjevi count:", err);
    }
  };

  const handleLogout = () => {
    authLogout(); // ✅ KORISTI CONTEXT LOGOUT
    handleMenuClose();
    toast("Uspješno ste odjavljeni.", "success");
    navigate("/");
  };

  const handleProfileClick = () => {
    if (user) {
      navigate("/profil");
    } else {
      navigate("/login");
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  const avatarSrc = user?.avatar ? buildAvatarSrc(user.avatar) : null;

  const navLinks = [
    { name: "Početna", href: "/" },
    { name: "Objave", href: "/objave" },
    { name: "Kalendar", href: "/kalendar" },
    { name: "Kontakt", href: "/kontakt" },
  ];

  const DesktopNav = (
    <>
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <img
          src={FFOSLogo}
          alt="FFOS logo"
          style={{
            height: "48px",
            width: "auto",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
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
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
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
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            Admin panel
          </Button>
        </Badge>
      )}

      {user ? (
        <>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            {avatarSrc ? (
              <Avatar src={avatarSrc} alt={user.ime} />
            ) : (
              <Avatar sx={{ bgcolor: "#fff", color: "#b41f24" }}>
                {user.ime?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleProfileClick}>
              <PersonIcon sx={{ mr: 1 }} /> Moj profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Odjava
            </MenuItem>
          </Menu>
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
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          Prijava
        </Button>
      )}
    </>
  );

  const MobileDrawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      sx={{
        "& .MuiDrawer-paper": {
          width: 250,
          backgroundColor: "#b41f24",
          color: "#fff",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {navLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton
              component={Link}
              to={link.href}
              onClick={handleDrawerToggle}
              sx={{
                color: "#fff",
                backgroundColor:
                  location.pathname === link.href
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
              }}
            >
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

        {user?.uloga === "admin" && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/admin"
              onClick={handleDrawerToggle}
              sx={{ color: "#fff" }}
            >
              <Badge badgeContent={zahtjeviCount} color="error" sx={{ mr: 2 }}>
                <ListItemText primary="Admin panel" />
              </Badge>
            </ListItemButton>
          </ListItem>
        )}

        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleProfileClick} sx={{ color: "#fff" }}>
                <PersonIcon sx={{ mr: 1 }} />
                <ListItemText primary="Moj profil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: "#fff" }}>
                <LogoutIcon sx={{ mr: 1 }} />
                <ListItemText primary="Odjava" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ color: "#fff" }}
            >
              <ListItemText primary="Prijava" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#b41f24",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
          {isMobile ? (
            <>
              <Link to="/">
                <img
                  src={FFOSLogo}
                  alt="FFOS logo"
                  style={{ height: "40px", width: "auto" }}
                />
              </Link>

              <Box sx={{ flexGrow: 1 }} />

              <IconButton
                onClick={handleDrawerToggle}
                sx={{ color: "#fff" }}
                aria-label="Otvori meni"
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            DesktopNav
          )}
        </Toolbar>
      </AppBar>

      <Toolbar />

      {isMobile && MobileDrawer}
    </>
  );
}

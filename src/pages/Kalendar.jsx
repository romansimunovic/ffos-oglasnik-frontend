import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Chip, Avatar, Button, Box, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PushPinIcon from "@mui/icons-material/PushPin";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { ODSJECI } from "../constants/odsjeci";

const ACCENT = "#b41f24";

export default function Kalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [objave, setObjave] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchObjave();
  }, [currentDate]); // eslint-disable-line

  const fetchObjave = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const res = await api.get("/objave");
      const filteredObjave = (res.data || []).filter((o) => {
        const d = new Date(o.datum);
        return o.status === "odobreno" && d >= startOfMonth && d <= endOfMonth;
      });
      setObjave(filteredObjave);
    } catch (err) {
      console.error(err);
      toast("Greška pri dohvaćanju objava.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = Array(firstDay.getDay()).fill(null)
      .concat(Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)));
    return days;
  };

  const getObjaveForDate = (date) =>
    date ? objave.filter(o => {
      const d = new Date(o.datum);
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear();
    }) : [];

  const handlePrevMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setSelectedDate(null); };
  const handleDateClick = (date) => setSelectedDate(date);

  const days = getDaysInMonth(currentDate);
  const selectedObjave = selectedDate ? getObjaveForDate(selectedDate) : [];
  const today = new Date();
  const isToday = (date) => date && date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  const monthName = currentDate.toLocaleString("hr-HR", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <section className="page-bg" style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1>Kalendar objava</h1>

        {/* HEADER NAV */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 3 }}>
          <IconButton onClick={handlePrevMonth}><ChevronLeftIcon /></IconButton>
          <Typography variant="h5" sx={{ textTransform: "capitalize" }}>{monthName} {year}</Typography>
          <IconButton onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
        </Box>

        {/* KALENDAR GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, width: "100%" }}>
          {["Ned","Pon","Uto","Sri","Čet","Pet","Sub"].map(day => (
            <Typography key={day} align="center" fontWeight={700}>{day}</Typography>
          ))}

          {days.map((date, idx) => {
            const dayObjave = date ? getObjaveForDate(date) : [];
            const selected = selectedDate && date && selectedDate.getTime() === date.getTime();
            return (
              <Box
                key={idx}
                onClick={() => date && handleDateClick(date)}
                sx={{
                  height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRadius: 1, cursor: date ? "pointer" : "default",
                  bgcolor: selected ? "#f5f5f5" : isToday(date) ? "#e0f7fa" : "transparent",
                  border: "1px solid #ddd"
                }}
              >
                {date && <>
                  <Typography fontWeight={500}>{date.getDate()}</Typography>
                  {dayObjave.length > 0 && <Chip label={`${dayObjave.length} objava`} size="small" sx={{ mt: 0.5 }} />}
                </>}
              </Box>
            );
          })}
        </div>

        {/* OBJAVE ZA ODABRANI DAN */}
        {selectedDate && (
          <Box sx={{ mt: 4, width: "100%" }}>
            {loading ? (
              <Typography align="center">Učitavanje...</Typography>
            ) : selectedObjave.length === 0 ? (
              <Typography align="center">Nema objava za ovaj dan.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {selectedObjave.map(obj => (
                  <Box key={obj._id} className="card" sx={{ p: 2, cursor: "pointer" }} onClick={() => navigate(`/objava/${obj._id}`)}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                      {obj.pinned && <Chip icon={<PushPinIcon />} label="Prikvačeno" size="small" color="primary" />}
                      {obj.urgentno && <Chip icon={<NewReleasesIcon />} label="Hitno" size="small" color="error" />}
                    </Box>
                    <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 700 }}>{obj.naslov}</Typography>
                    <Typography sx={{ color: "#555", mb: 1, whiteSpace: "pre-wrap" }}>{obj.sadrzaj}</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <Chip icon={<EventIcon />} label={new Date(obj.datum).toLocaleDateString("hr-HR")} size="small" />
                      <Chip label={ODSJECI.find(o => o.id === obj.odsjek)?.naziv || "-"} size="small" />
                      <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <VisibilityIcon fontSize="small" /> {obj.views || 0}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <BookmarkIcon fontSize="small" /> {obj.saves || 0}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </div>
    </section>
  );
}

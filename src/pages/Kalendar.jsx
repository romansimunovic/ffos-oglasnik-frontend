import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Chip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PushPinIcon from "@mui/icons-material/PushPin";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useToast } from "../components/Toast";

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
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const res = await api.get("/objave");
      const filteredObjave = (res.data || []).filter((o) => {
        const objavaDate = new Date(o.datum);
        return (
          o.status === "odobreno" &&
          objavaDate >= startOfMonth &&
          objavaDate <= endOfMonth
        );
      });

      setObjave(filteredObjave);
    } catch (err) {
      console.error("fetch kalendar objave:", err);
      toast("Greška pri dohvaćanju objava.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getObjaveForDate = (date) => {
    if (!date) return [];
    return objave.filter((o) => {
      const objavaDate = new Date(o.datum);
      return (
        objavaDate.getDate() === date.getDate() &&
        objavaDate.getMonth() === date.getMonth() &&
        objavaDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const days = getDaysInMonth(currentDate);
  const selectedObjave = selectedDate ? getObjaveForDate(selectedDate) : [];

  const monthName = currentDate.toLocaleString("hr-HR", { month: "long" });
  const year = currentDate.getFullYear();

  const today = new Date();
  const isToday = (date) =>
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <section
  className="page-bg"
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "2rem 1rem",
    minHeight: "100vh",
    boxSizing: "border-box",
  }}
>
  <div
    style={{
      maxWidth: 960,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
      Kalendar objava
    </h1>

    {/* HEADER SA NAVIGACIJOM */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}
    >
      <IconButton onClick={handlePrevMonth}>
        <ChevronLeftIcon />
      </IconButton>
      <h2
        style={{
          margin: 0,
          textTransform: "capitalize",
          fontSize: "1.5rem",
          fontWeight: 500,
        }}
      >
        {monthName} {year}
      </h2>
      <IconButton onClick={handleNextMonth}>
        <ChevronRightIcon />
      </IconButton>
    </div>

    {/* KALENDAR WRAPPER */}
    <div
      className="calendar-wrapper"
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "1rem",
      }}
    >
      {/* KALENDAR GRID */}
      <div
        className="calendar-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
        }}
      >
        {/* Dani u tjednu */}
        {["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"].map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontWeight: 600,
              color: "#555",
              paddingBottom: 6,
            }}
          >
            {day}
          </div>
        ))}

        {/* Dani mjeseca */}
        {days.map((date, idx) => {
          const dayObjave = date ? getObjaveForDate(date) : [];
          const isSelected =
            selectedDate &&
            date &&
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear();

          return (
            <div
              key={idx}
              onClick={() => date && handleDateClick(date)}
              style={{
                minHeight: 60,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: isSelected
                  ? "#1976d2"
                  : isToday(date)
                  ? "#e3f2fd"
                  : "#f9f9f9",
                color: isSelected ? "#fff" : "#333",
                borderRadius: 8,
                cursor: date ? "pointer" : "default",
                transition: "all 0.2s",
              }}
              className={date ? "calendar-day" : "calendar-day empty"}
            >
              {date && (
                <>
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {date.getDate()}
                  </div>
                  {dayObjave.length > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: isSelected ? "#bbdefb" : "#1976d2",
                        fontWeight: 500,
                      }}
                    >
                      {dayObjave.length} objava
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* ODABRANE OBJAVE */}
    {selectedDate && (
      <div style={{ marginTop: "2rem", width: "100%" }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          📅{" "}
          {selectedDate.toLocaleDateString("hr-HR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {loading ? (
          <p className="center-msg" style={{ textAlign: "center" }}>
            Učitavanje...
          </p>
        ) : selectedObjave.length === 0 ? (
          <p className="center-msg" style={{ textAlign: "center" }}>
            Nema objava za ovaj dan.
          </p>
        ) : (
          <div
            className="card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {selectedObjave.map((obj) => (
              <div
                key={obj._id}
                className="card"
                onClick={() => navigate(`/objava/${obj._id}`)}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0px)")
                }
              >
                <div style={{ position: "relative", height: 20, marginBottom: 8 }}>
                  {obj.pinned && (
                    <Chip
                      icon={<PushPinIcon />}
                      label="Prikvačeno"
                      size="small"
                      color="primary"
                      style={{ position: "absolute", left: 0 }}
                    />
                  )}
                  {obj.urgentno && (
                    <Chip
                      icon={<NewReleasesIcon />}
                      label="Hitno"
                      size="small"
                      color="error"
                      style={{ position: "absolute", right: 0 }}
                    />
                  )}
                </div>

                <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>{obj.naslov}</h2>
                <p style={{ flex: 1, fontSize: 14, color: "#555" }}>
                  {obj.sadrzaj}
                </p>

                <div
                  className="meta-info"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#777",
                    marginTop: "0.5rem",
                  }}
                >
                  <span>
                    Tip: <i>{obj.tip}</i>
                  </span>
                  <span>
                    Odsjek:{" "}
                    {ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv || "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
</section>

  );
}

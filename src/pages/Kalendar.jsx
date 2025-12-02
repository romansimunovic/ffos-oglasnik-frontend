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
    <section className="page-bg">
      <div className="container">
        <h1>Kalendar objava</h1>

        {/* HEADER SA NAVIGACIJOM */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            marginTop: "2rem",
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
            }}
          >
            {monthName} {year}
          </h2>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </div>

        {/* KALENDAR WRAPPER */}
        <div className="calendar-wrapper">
          {/* KALENDAR GRID */}
          <div className="calendar-grid">
            {/* Dani u tjednu */}
            {["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"].map((day) => (
              <div key={day} className="calendar-day-header">
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
                  className={`calendar-day ${date ? "" : "empty"} ${
                    isSelected ? "selected" : ""
                  } ${isToday(date) ? "today" : ""}`}
                  onClick={() => date && handleDateClick(date)}
                >
                  {date && (
                    <>
                      <div className="calendar-day-number">
                        {date.getDate()}
                      </div>
                      {dayObjave.length > 0 && (
                        <div className="calendar-day-count">
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
          <div style={{ marginTop: "2.5rem" }}>
            <h3>
              📅{" "}
              {selectedDate.toLocaleDateString("hr-HR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {loading ? (
              <p className="center-msg">Učitavanje...</p>
            ) : selectedObjave.length === 0 ? (
              <p className="center-msg">Nema objava za ovaj dan.</p>
            ) : (
              <div className="card-grid">
                {selectedObjave.map((obj) => (
                  <div
                    key={obj._id}
                    className="card"
                    onClick={() => navigate(`/objava/${obj._id}`)}
                  >
                    {/* BADGES */}
                    <div
                      style={{
                        position: "relative",
                        height: "20px",
                        marginBottom: "8px",
                      }}
                    >
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

                    <h2 style={{ marginTop: 0 }}>{obj.naslov}</h2>
                    <p className="card-desc">{obj.sadrzaj}</p>

                    <div className="meta-info">
                      <span>
                        Tip: <i>{obj.tip}</i>
                      </span>
                      <span>
                        Odsjek:{" "}
                        {ODSJECI.find((ods) => ods.id === obj.odsjek)
                          ?.naziv || "-"}
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

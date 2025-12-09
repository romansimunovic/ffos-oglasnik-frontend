// src/utils/uiHelpers.js
import ArticleIcon from "@mui/icons-material/Article";
import HandymanIcon from "@mui/icons-material/Handyman";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import ApartmentIcon from "@mui/icons-material/Apartment";
import ComputerIcon from "@mui/icons-material/Computer";
import PsychologyIcon from "@mui/icons-material/Psychology";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WorkIcon from "@mui/icons-material/Work";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import BrushIcon from "@mui/icons-material/Brush";
import GroupIcon from "@mui/icons-material/Group";

/**
 * Boje odabrane da imaju dobar kontrast protiv bijelog teksta
 * (provjerene ručno — ako želiš, možemo dodati WCAG provjeru)
 */
export const TYPE_MAP = {
  radionice: { Icon: HandymanIcon, label: "Radionica", color: "#059669" }, // teal
  radionica: { Icon: HandymanIcon, label: "Radionica", color: "#059669" },
  kvizovi: { Icon: AssignmentIcon, label: "Kviz", color: "#7c3aed" }, // purple
  kviz: { Icon: AssignmentIcon, label: "Kviz", color: "#7c3aed" },
  projekti: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" }, // blue
  projekt: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" },
  natječaji: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" }, // amber
  natječaj: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" },
  ostalo: { Icon: ArticleIcon, label: "Ostalo", color: "#6b7280" },
};

export const DEPT_MAP_BY_ID = {
  "hrv-jez": { Icon: LocalLibraryIcon, color: "#ef4444" },
  povijest: { Icon: LocalLibraryIcon, color: "#ef4444" },
  "inf-znanost": { Icon: ComputerIcon, color: "#0ea5a4" },
  "eng-jez": { Icon: LocalLibraryIcon, color: "#1d4ed8" },
  "njem-jez": { Icon: LocalLibraryIcon, color: "#1d4ed8" },
  pedagogija: { Icon: GroupIcon, color: "#0ea5a4" },
  filozofija: { Icon: ApartmentIcon, color: "#4b5563" },
  psihologija: { Icon: PsychologyIcon, color: "#a78bfa" },
  madarski: { Icon: LocalLibraryIcon, color: "#7c3aed" },
  zajednicki: { Icon: ApartmentIcon, color: "#6b7280" },
  sociologija: { Icon: WorkIcon, color: "#3b82f6" },
  umjetnost: { Icon: BrushIcon, color: "#ef4444" },
  cjelozivotno: { Icon: LocalLibraryIcon, color: "#059669" },
  "studentski-zbor": { Icon: GroupIcon, color: "#2563eb" },
};

/**
 * Dohvati detalje po tipu (fallback na 'ostalo')
 */
export function getTypeDetails(type) {
  if (!type) return TYPE_MAP.ostalo;
  const key = type.toString().toLowerCase();
  return TYPE_MAP[key] || TYPE_MAP.ostalo;
}

/**
 * Dohvati vizual za odsjek. Prima ili id ili pun naziv.
 * Ako prima pun naziv, pokušavamo pogoditi po substringu.
 */
export function getDeptDetails(odsjek) {
  if (!odsjek) return { Icon: ApartmentIcon, color: "#6b7280", label: "-" };

  // ako je id iz ODSJECI (npr. 'inf-znanost')
  if (DEPT_MAP_BY_ID[odsjek]) {
    const { Icon, color } = DEPT_MAP_BY_ID[odsjek];
    return { Icon, color, label: odsjek };
  }

  // pokušaj po substringu naziva
  const n = odsjek.toString().toLowerCase();
  if (n.includes("informat") || n.includes("račun") || n.includes("info")) return { Icon: ComputerIcon, color: "#0ea5a4", label: odsjek };
  if (n.includes("psih")) return { Icon: PsychologyIcon, color: "#a78bfa", label: odsjek };
  if (n.includes("ekon") || n.includes("financ") || n.includes("menad")) return { Icon: MonetizationOnIcon, color: "#16a34a", label: odsjek };
  if (n.includes("umjet") || n.includes("glazb") || n.includes("povijest umjetnosti")) return { Icon: BrushIcon, color: "#ef4444", label: odsjek };
  if (n.includes("student") || n.includes("zbor")) return { Icon: GroupIcon, color: "#2563eb", label: odsjek };

  // fallback
  return { Icon: ApartmentIcon, color: "#6b7280", label: odsjek };
}

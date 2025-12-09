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

import FlagIcon from "@mui/icons-material/Flag";
import LanguageIcon from "@mui/icons-material/Language";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PublicIcon from "@mui/icons-material/Public";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

/**
 * Helper: vrati '#000' ili '#fff' ovisno o kontrastu boje (simple luminance check)
 */
export function getContrastText(hexColor) {
  if (!hexColor) return "#000";
  // normalize hex
  const c = hexColor.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  // sRGB luminance
  const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
              0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
              0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  // threshold ~ WCAG-ish: returns white for dark backgrounds
  return lum > 0.5 ? "#000" : "#fff";
}

/**
 * Koherentna paleta (dobar kontrast za bijeli tekst):
 * - emerald / green: #059669
 * - teal / cyan:    #0891b2
 * - indigo / dark:  #3730a3
 * - blue:           #2563eb
 * - slate / neutral:#334155
 * - amber / warm:   #d97706
 * - crimson / red:  #b91c1c
 * - gray / soft:    #6b7280
 * - coral / accent: #f97316
 */

/**
 * TYPE_MAP: tip objave -> ikona, label, boja
 * boje su iz koherentne palete i dovoljno tamne za bijeli text
 */
export const TYPE_MAP = {
  radionice: { Icon: HandymanIcon, label: "Radionica", color: "#059669" }, // emerald
  radionica: { Icon: HandymanIcon, label: "Radionica", color: "#059669" },
  kvizovi: { Icon: AssignmentIcon, label: "Kviz", color: "#3730a3" }, // indigo
  kviz: { Icon: AssignmentIcon, label: "Kviz", color: "#3730a3" },
  projekti: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" }, // blue
  projekt: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" },
  natječaji: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" }, // amber
  natječaj: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" },
  ostalo: { Icon: ArticleIcon, label: "Ostalo", color: "#6b7280" }, // neutral gray
};

/**
 * DEPT_MAP_BY_ID: mapiranje odsjekId -> ikona + boja
 * boje pažljivo odabrane da budu različite, ali skladne
 */
export const DEPT_MAP_BY_ID = {
  // jezici
  "hrv-jez": { Icon: FlagIcon, color: "#b91c1c" }, // warm crimson — hrvatski
  "eng-jez": { Icon: LanguageIcon, color: "#1e40af" }, // classic navy blue — engleski
  "njem-jez": { Icon: LanguageIcon, color: "#0f172a" }, // nearly black for kontrast — njemački
  // povijest i srodno
  povijest: { Icon: HistoryEduIcon, color: "#92400e" }, // warm brown/amber
  // informatika i znanost
  "inf-znanost": { Icon: ComputerIcon, color: "#0891b2" }, // teal-cyan
  // pedagogija / rad s ljudima
  pedagogija: { Icon: GroupIcon, color: "#059669" }, // emerald
  // filozofija -> knjige / čitanje
  filozofija: { Icon: MenuBookIcon, color: "#334155" }, // slate dark
  // psihologija
  psihologija: { Icon: PsychologyIcon, color: "#2563eb" }, // plava (jasna)
  // madarski - koristimo biblioteku ikonu
  madarski: { Icon: LocalLibraryIcon, color: "#6b7280" },
  // zajednički sadržaji -> zajednica / group-work
  zajednicki: { Icon: GroupWorkIcon, color: "#f97316" }, // coral / accent
  // sociologija -> društvo / globe
  sociologija: { Icon: PublicIcon, color: "#0891b2" }, // teal-cyan (vidljiv)
  // umjetnost -> brush
  umjetnost: { Icon: BrushIcon, color: "#b91c1c" }, // crimson for strong accent
  // cjeloživotno učenje -> school / lifelong learning
  cjelozivotno: { Icon: SchoolIcon, color: "#059669" }, // emerald
  // studentski zbor -> zajednica / volunteering
  "studentski-zbor": { Icon: VolunteerActivismIcon, color: "#2563eb" }, // plava / community
};

/**
 * getTypeDetails(type)
 * vrati { Icon, label, color, contrastText } za tip objave
 */
export function getTypeDetails(type) {
  if (!type) return { ...TYPE_MAP.ostalo, contrastText: getContrastText(TYPE_MAP.ostalo.color) };
  const key = type.toString().toLowerCase();
  const base = TYPE_MAP[key] || TYPE_MAP.ostalo;
  return { ...base, contrastText: getContrastText(base.color) };
}

/**
 * getDeptDetails(odsjek)
 * - prima id iz ODSJECI (npr. 'inf-znanost') ili puni tekstualni naziv
 * - vraća { Icon, color, label, contrastText }
 */
export function getDeptDetails(odsjek) {
  if (!odsjek) return { Icon: ApartmentIcon, color: "#6b7280", label: "-", contrastText: getContrastText("#6b7280") };

  // ako je odsjek id koji postoji u mapi
  if (DEPT_MAP_BY_ID[odsjek]) {
    const { Icon, color } = DEPT_MAP_BY_ID[odsjek];
    return { Icon, color, label: odsjek, contrastText: getContrastText(color) };
  }

  // fallback: prepoznaj po nazivu (slobodno proširi)
  const n = odsjek.toString().toLowerCase();
  let fallback = { Icon: ApartmentIcon, color: "#6b7280", label: odsjek };
  if (n.includes("hrv") || n.includes("hrvats")) fallback = { Icon: FlagIcon, color: "#b91c1c", label: odsjek };
  else if (n.includes("eng") || n.includes("engl")) fallback = { Icon: LanguageIcon, color: "#1e40af", label: odsjek };
  else if (n.includes("njem") || n.includes("njema")) fallback = { Icon: LanguageIcon, color: "#0f172a", label: odsjek };
  else if (n.includes("povijest") || n.includes("history")) fallback = { Icon: HistoryEduIcon, color: "#92400e", label: odsjek };
  else if (n.includes("info") || n.includes("informat") || n.includes("račun")) fallback = { Icon: ComputerIcon, color: "#0891b2", label: odsjek };
  else if (n.includes("psih")) fallback = { Icon: PsychologyIcon, color: "#2563eb", label: odsjek };
  else if (n.includes("umjet") || n.includes("art")) fallback = { Icon: BrushIcon, color: "#b91c1c", label: odsjek };
  else if (n.includes("student") || n.includes("zbor") || n.includes("zajed")) fallback = { Icon: VolunteerActivismIcon, color: "#2563eb", label: odsjek };
  else if (n.includes("soci") || n.includes("društ")) fallback = { Icon: PublicIcon, color: "#0891b2", label: odsjek };
  else if (n.includes("filoz") || n.includes("filo")) fallback = { Icon: MenuBookIcon, color: "#334155", label: odsjek };
  else if (n.includes("pedago") || n.includes("pedago")) fallback = { Icon: GroupIcon, color: "#059669", label: odsjek };
  else if (n.includes("cjelo") || n.includes("cijelo") || n.includes("lifelong")) fallback = { Icon: SchoolIcon, color: "#059669", label: odsjek };

  return { ...fallback, contrastText: getContrastText(fallback.color) };
}

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
  if (!hexColor) return "#fff";
  const c = hexColor.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
              0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
              0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  return lum > 0.179 ? "#000" : "#fff";
}

/**
 * TYPE_MAP: tip objave -> ikona, label, boja
 * boje su iz koherentne palete i dovoljno tamne za bijeli text
 */
export const TYPE_MAP = {
  radionice: { Icon: HandymanIcon, label: "Radionica", color: "#059669" },
  radionica: { Icon: HandymanIcon, label: "Radionica", color: "#059669" },
  kvizovi: { Icon: AssignmentIcon, label: "Kviz", color: "#3730a3" },
  kviz: { Icon: AssignmentIcon, label: "Kviz", color: "#3730a3" },
  projekti: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" },
  projekt: { Icon: SchoolIcon, label: "Projekt", color: "#2563eb" },
  natječaji: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" },
  natječaj: { Icon: EmojiEventsIcon, label: "Natječaj", color: "#d97706" },
  ostalo: { Icon: ArticleIcon, label: "Ostalo", color: "#6b7280" },
};

/**
 * DEPT_MAP_BY_ID: mapiranje odsjekId -> ikona + boja
 */
export const DEPT_MAP_BY_ID = {
  "hrv-jez": { Icon: FlagIcon, color: "#b91c1c" },
  "eng-jez": { Icon: LanguageIcon, color: "#1e40af" },
  "njem-jez": { Icon: LanguageIcon, color: "#0f172a" },
  povijest: { Icon: HistoryEduIcon, color: "#92400e" },
  "inf-znanost": { Icon: ComputerIcon, color: "#0891b2" },
  pedagogija: { Icon: GroupIcon, color: "#059669" },
  filozofija: { Icon: MenuBookIcon, color: "#334155" },
  psihologija: { Icon: PsychologyIcon, color: "#2563eb" },
  madarski: { Icon: LocalLibraryIcon, color: "#6b7280" },
  zajednicki: { Icon: GroupWorkIcon, color: "#f97316" },
  sociologija: { Icon: PublicIcon, color: "#0891b2" },
  umjetnost: { Icon: BrushIcon, color: "#b91c1c" },
  cjelozivotno: { Icon: SchoolIcon, color: "#059669" },
  "studentski-zbor": { Icon: VolunteerActivismIcon, color: "#2563eb" },
};

/**
 * getTypeDetails(type)
 * vrati { Icon, label, color, contrastText, iconSx } za tip objave
 */
export function getTypeDetails(type) {
  if (!type) {
    const contrastText = getContrastText(TYPE_MAP.ostalo.color);
    return { 
      ...TYPE_MAP.ostalo, 
      contrastText,
      iconSx: { color: `${contrastText} !important`, fontWeight: 700 }
    };
  }
  const key = type.toString().toLowerCase();
  const base = TYPE_MAP[key] || TYPE_MAP.ostalo;
  const contrastText = getContrastText(base.color);
  return { 
    ...base, 
    contrastText,
    iconSx: { color: `${contrastText} !important`, fontWeight: 700 }
  };
}

/**
 * getDeptDetails(odsjek)
 * - prima id iz ODSJECI (npr. 'inf-znanost') ili puni tekstualni naziv
 * - vraća { Icon, color, label, contrastText, iconSx }
 */
export function getDeptDetails(odsjek) {
  const defaultContrast = getContrastText("#6b7280");
  if (!odsjek) {
    return { 
      Icon: ApartmentIcon, 
      color: "#6b7280", 
      label: "-", 
      contrastText: defaultContrast,
      iconSx: { color: `${defaultContrast} !important`, fontWeight: 700 }
    };
  }

  if (DEPT_MAP_BY_ID[odsjek]) {
    const { Icon, color } = DEPT_MAP_BY_ID[odsjek];
    const contrastText = getContrastText(color);
    return { 
      Icon, 
      color, 
      label: odsjek, 
      contrastText,
      iconSx: { color: `${contrastText} !important`, fontWeight: 700 }
    };
  }

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
  else if (n.includes("pedago")) fallback = { Icon: GroupIcon, color: "#059669", label: odsjek };
  else if (n.includes("cjelo") || n.includes("cijelo") || n.includes("lifelong")) fallback = { Icon: SchoolIcon, color: "#059669", label: odsjek };

  const contrastText = getContrastText(fallback.color);
  return { 
    ...fallback, 
    contrastText,
    iconSx: { color: `${contrastText} !important`, fontWeight: 700 }
  };
}

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

// new / specific icons for departments
import FlagIcon from "@mui/icons-material/Flag"; // za hrvatski (jednostavna zastava)
import LanguageIcon from "@mui/icons-material/Language"; // za engleski / njemački
import MenuBookIcon from "@mui/icons-material/MenuBook"; // knjige / filozofija
import PublicIcon from "@mui/icons-material/Public"; // društvo / sociologija
import GroupWorkIcon from "@mui/icons-material/GroupWork"; // zajednički sadržaji / zajednica
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"; // povijest
import SchoolTwoToneIcon from "@mui/icons-material/School"; // cjeloživotno (school)
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism"; // studentski zbor / zajednica

/**
 * TYPE_MAP: tip objave -> ikona, label, boja (boje imaju dobar kontrast za bijeli tekst)
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

/**
 * DEPT_MAP_BY_ID: mapiranje odsjekId -> ikona + boja
 * boje su odabrane da imaju dobar kontrast bijelog teksta
 */
export const DEPT_MAP_BY_ID = {
  // jezici
  "hrv-jez": { Icon: FlagIcon, color: "#ef4444" }, // crvena zastava — hrvatski
  "eng-jez": { Icon: LanguageIcon, color: "#1e40af" }, // tamnoplava — engleski
  "njem-jez": { Icon: LanguageIcon, color: "#0f172a" }, // gotovo crna / tamna — njemački
  // povijest i srodno
  povijest: { Icon: HistoryEduIcon, color: "#92400e" }, // tamno-amber / povijest
  // informatika i znanost
  "inf-znanost": { Icon: ComputerIcon, color: "#0ea5a4" }, // teal-cyan
  // pedagogija / rad s ljudima
  pedagogija: { Icon: GroupIcon, color: "#0ea5a4" }, // teal-ish
  // filozofija -> knjige / čitanje
  filozofija: { Icon: MenuBookIcon, color: "#374151" }, // tamnosiva — knjige
  // psihologija
  psihologija: { Icon: PsychologyIcon, color: "#7c3aed" }, // ljubičasta
  // madarski - koristimo biblioteku ikonu
  madarski: { Icon: LocalLibraryIcon, color: "#7c3aed" },
  // zajednički sadržaji -> zajednica / group-work
  zajednicki: { Icon: GroupWorkIcon, color: "#6b7280" }, // neutralno-siva
  // sociologija -> društvo / globe
  sociologija: { Icon: PublicIcon, color: "#0ea5a4" }, // cyan/teal for visibility
  // umjetnost -> brush
  umjetnost: { Icon: BrushIcon, color: "#ef4444" }, // crvena / art
  // cjeloživotno učenje -> school / lifelong learning
  cjelozivotno: { Icon: SchoolIcon, color: "#059669" }, // zelena / learning
  // studentski zbor -> zajednica / volunteering
  "studentski-zbor": { Icon: VolunteerActivismIcon, color: "#2563eb" }, // plava / community
};

/**
 * getTypeDetails(type)
 * vrati { Icon, label, color } za tip objave
 */
export function getTypeDetails(type) {
  if (!type) return TYPE_MAP.ostalo;
  const key = type.toString().toLowerCase();
  return TYPE_MAP[key] || TYPE_MAP.ostalo;
}

/**
 * getDeptDetails(odsjek)
 * - prima id iz ODSJECI (npr. 'inf-znanost') ili puni tekstualni naziv
 * - vraća { Icon, color, label }
 *
 * Napomena: komponenta koja poziva često već ima puni naziv iz ODSJECI (naziv),
 * pa za labelu koristimo originalni argument — u komponenti je zgodno prvo
 * pokušati naći odsjek po id-u (kako trenutno radiš).
 */
export function getDeptDetails(odsjek) {
  if (!odsjek) return { Icon: ApartmentIcon, color: "#6b7280", label: "-" };

  // prvi pokušaj: ako je odsjek id koji postoji u mapi
  if (DEPT_MAP_BY_ID[odsjek]) {
    const { Icon, color } = DEPT_MAP_BY_ID[odsjek];
    return { Icon, color, label: odsjek };
  }

  // fallback: prepoznaj po nazivu (slobodno proširi)
  const n = odsjek.toString().toLowerCase();
  if (n.includes("hrv") || n.includes("hrvats")) return { Icon: FlagIcon, color: "#ef4444", label: odsjek };
  if (n.includes("eng") || n.includes("engl")) return { Icon: LanguageIcon, color: "#1e40af", label: odsjek };
  if (n.includes("njem") || n.includes("njema")) return { Icon: LanguageIcon, color: "#0f172a", label: odsjek };
  if (n.includes("povijest") || n.includes("history")) return { Icon: HistoryEduIcon, color: "#92400e", label: odsjek };
  if (n.includes("info") || n.includes("informat") || n.includes("račun")) return { Icon: ComputerIcon, color: "#0ea5a4", label: odsjek };
  if (n.includes("psih")) return { Icon: PsychologyIcon, color: "#7c3aed", label: odsjek };
  if (n.includes("umjet") || n.includes("art")) return { Icon: BrushIcon, color: "#ef4444", label: odsjek };
  if (n.includes("student") || n.includes("zbor") || n.includes("zajed")) return { Icon: VolunteerActivismIcon, color: "#2563eb", label: odsjek };
  if (n.includes("soci") || n.includes("društ")) return { Icon: PublicIcon, color: "#0ea5a4", label: odsjek };
  if (n.includes("filoz") || n.includes("filo")) return { Icon: MenuBookIcon, color: "#374151", label: odsjek };
  if (n.includes("pedago") || n.includes("pedago")) return { Icon: GroupIcon, color: "#0ea5a4", label: odsjek };
  if (n.includes("cjelo") || n.includes("cijelo") || n.includes("lifelong")) return { Icon: SchoolIcon, color: "#059669", label: odsjek };

  // default fallback
  return { Icon: ApartmentIcon, color: "#6b7280", label: odsjek };
}

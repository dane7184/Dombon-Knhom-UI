import {
  Sparkles,
  Dumbbell,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Globe2,
  Music2,
  Mountain,
  UtensilsCrossed,
  Shapes,
  Cpu,
  Users,
  Briefcase,
  Palette,
  Theater,
  HeartHandshake,
  Lightbulb,
  Shirt,
  Camera,
  Wine,
  Gamepad2,
  Film,
  Landmark,
  Handshake,
  BadgeCheck,
  Languages,
} from "lucide-react";
import {AppBaseCategoryType, AppContentType, AppStatus, Role} from "@/types/common.type";

interface CategoryConfig {
  icon: React.ElementType;
  color: string;
  bg: string;
}

export const CATEGORY_CONFIG: Record<AppBaseCategoryType, CategoryConfig> = {
  Traditional: {
    icon: Sparkles,
    color: "#C0841A",
    bg: "#FFF8E7", // Soft cream/gold
  },

  Sport: {
    icon: Dumbbell,
    color: "#F97316",
    bg: "#FFF7ED", // Soft orange
  },

  Entertainment: {
    icon: Clapperboard,
    color: "#EC4899",
    bg: "#FDF2F8", // Soft pink
  },

  Education: {
    icon: GraduationCap,
    color: "#3B82F6",
    bg: "#EFF6FF", // Soft blue
  },

  Health: {
    icon: HeartPulse,
    color: "#10B981",
    bg: "#ECFDF5", // Soft emerald mint
  },

  International: {
    icon: Globe2,
    color: "#06B6D4",
    bg: "#ECFEFF", // Soft cyan
  },

  Music: {
    icon: Music2,
    color: "#8B5CF6",
    bg: "#F5F3FF", // Soft lavender
  },

  Adventure: {
    icon: Mountain,
    color: "#14B8A6",
    bg: "#F0FDFA", // Soft teal
  },

  Food: {
    icon: UtensilsCrossed,
    color: "#F59E0B",
    bg: "#FFFBEB", // Soft amber/yellow
  },

  Technology: {
    icon: Cpu,
    color: "#2563EB",
    bg: "#EFF6FF", // Soft tech blue
  },

  Community: {
    icon: Users,
    color: "#16A34A",
    bg: "#F0FDF4", // Soft green
  },

  Business: {
    icon: Briefcase,
    color: "#D97706",
    bg: "#FFFBEB", // Soft brown/amber
  },

  Art: {
    icon: Palette,
    color: "#DB2777",
    bg: "#FDF2F8", // Soft rose
  },

  // ==========================================
  // FUTURE BACKEND EXTENSIONS (PRE-CONFIGURED)
  // ==========================================
  Exhibition: {
    icon: Theater,
    color: "#7C3AED",
    bg: "#F5F3FF", // Soft deep purple
  },

  Charity: {
    icon: HeartHandshake,
    color: "#EF4444",
    bg: "#FEF2F2", // Soft red
  },

  Workshop: {
    icon: Lightbulb,
    color: "#EAB308",
    bg: "#FEFCE8", // Soft yellow
  },

  Fashion: {
    icon: Shirt,
    color: "#6366F1",
    bg: "#EEF2FF", // Soft indigo
  },

  Photography: {
    icon: Camera,
    color: "#0F172A",
    bg: "#F8FAFC", // Soft slate grey
  },

  Nightlife: {
    icon: Wine,
    color: "#A855F7",
    bg: "#FAF5FF", // Soft neon purple
  },

  Cultural: {
    icon: Languages,
    color: "#0891B2",
    bg: "#ECFEFF",
  },

  Career: {
    icon: BadgeCheck,
    color: "#2563EB",
    bg: "#EFF6FF",
  },

  Networking: {
    icon: Handshake,
    color: "#0F766E",
    bg: "#F0FDFA",
  },

  Gaming: {
    icon: Gamepad2,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },

  Movie: {
    icon: Film,
    color: "#DC2626",
    bg: "#FEF2F2",
  },

  Religious: {
    icon: Landmark,
    color: "#C0841A",
    bg: "#FFF8E7",
  },

  Other: {
    icon: Shapes,
    color: "#64748B",
    bg: "#F8FAFC", // Soft grey fallback
  },
};

const CATEGORY_ALIASES: Record<string, AppBaseCategoryType> = {
  // Traditional
  traditional: "Traditional",
  festival: "Traditional",
  event: "Traditional",

  // Cultural
  cultural: "Cultural",
  culture: "Cultural",

  // Religious
  religious: "Religious",
  religion: "Religious",
  temple: "Religious",
  buddhist: "Religious",

  // Sport
  sport: "Sport",
  sports: "Sport",

  // Entertainment
  entertainment: "Entertainment",

  // Education
  education: "Education",

  // Health
  health: "Health",

  // International
  international: "International",
  tourism: "International",

  // Music
  music: "Music",

  // Food
  food: "Food",

  // Adventure
  adventure: "Adventure",

  // Technology
  technology: "Technology",
  tech: "Technology",

  // Community
  community: "Community",

  // Business
  business: "Business",

  // Career
  career: "Career",
  job: "Career",
  jobs: "Career",
  hiring: "Career",
  recruitment: "Career",

  // Networking
  networking: "Networking",
  meetup: "Networking",
  meetups: "Networking",

  // Art
  art: "Art",

  // Exhibition
  exhibition: "Exhibition",
  expo: "Exhibition",
  museum: "Exhibition",

  // Charity
  charity: "Charity",
  donation: "Charity",
  volunteer: "Charity",

  // Workshop
  workshop: "Workshop",
  seminar: "Workshop",
  training: "Workshop",

  // Fashion
  fashion: "Fashion",
  clothing: "Fashion",

  // Photography
  photography: "Photography",
  photo: "Photography",

  // Gaming
  gaming: "Gaming",
  game: "Gaming",
  esport: "Gaming",
  esports: "Gaming",

  // Movie
  movie: "Movie",
  movies: "Movie",
  film: "Movie",
  cinema: "Movie",

  // Nightlife
  nightlife: "Nightlife",
  party: "Nightlife",
  bar: "Nightlife",

  // Fallback
  other: "Other",
};

function normalizeCategory(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function resolveCategoryKey(category: string): AppBaseCategoryType {
  const normalized = normalizeCategory(category);

  return (
    CATEGORY_ALIASES[normalized] ??
    (Object.keys(CATEGORY_CONFIG).find(
      (key) => normalizeCategory(key) === normalized,
    ) as AppBaseCategoryType | undefined) ??
    "Other"
  );
}

export function getCategoryConfig(category: string) {
  const key = resolveCategoryKey(category);

  return {
    key,
    config: CATEGORY_CONFIG[key],
  };
}

export const statusStyles: Record<AppStatus, string> = {
  Approved: "border-emerald-300 bg-emerald-50 text-emerald-600",
  Pending: "border-yellow-300 bg-yellow-50 text-yellow-600",
  Rejected: "border-red-300 bg-red-50 text-red-600",
};

export const contentTypeStyles: Record<AppContentType, string> = {
  Event: "border-0 bg-pink-100 text-pink-600",
  Activity: "border-0 bg-blue-100 text-blue-600",
};

export const RoleStyle: Record<Role, string> = {
  User: "border-0 bg-green-100 text-green-400",
  Organizer: "border-0 bg-sky-100 text-sky-400",
  Moderator: "border-0 bg-orange-100 text-orange-400",
  Admin: "border-0 bg-green-200 text-green-500",
}
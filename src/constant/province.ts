export const Province: Record<string, string> = {
  "Banteay Meanchey": "Banteay_Meanchey",
  Battambang: "Battambang",
  "Kampong Cham": "Kampong_Cham",
  "Kampong Chhnang": "Kampong_Chhnang",
  "Kampong Speu": "Kampong_Speu",
  "Kampong Thom": "Kampong_Thom",
  Kampot: "Kampot",
  Kandal: "Kandal",
  Kep: "Kep",
  "Koh Kong": "Koh_Kong",
  Kratie: "Kratie",
  "Mondul Kiri": "Mondulkiri",
  "Phnom Penh": "Phnom_Penh",
  "Preah Vihear": "Preah_Vihear",
  "Prey Veng": "Prey_Veng",
  Pursat: "Pursat",
  "Ratanak Kiri": "Ratanakiri",
  "Siem Reap": "Siem_Reap",
  "Preah Sihanouk": "Preah_Sihanouk",
  "Stung Treng": "Stung_Treng",
  "Svay Rieng": "Svay_Rieng",
  Takeo: "Takeo",
  "Oddar Meanchey": "Oddar_Meanchey",
  Pailin: "Pailin",
  "Tboung Khmum": "Tboung_Khmum",
};

export interface ProvinceOption {
  value: string;
  label: string;
}

export const CAMBODIA_PROVINCES: ProvinceOption[] = [
  { value: "Banteay_Meanchey", label: "Banteay Meanchey" },
  { value: "Battambang", label: "Battambang" },
  { value: "Kampong_Cham", label: "Kampong Cham" },
  { value: "Kampong_Chhnang", label: "Kampong Chhnang" },
  { value: "Kampong_Speu", label: "Kampong Speu" },
  { value: "Kampong_Thom", label: "Kampong Thom" },
  { value: "Kampot", label: "Kampot" },
  { value: "Kandal", label: "Kandal" },
  { value: "Kep", label: "Kep" },
  { value: "Koh_Kong", label: "Koh Kong" },
  { value: "Kratie", label: "Kratie" },
  { value: "Mondulkiri", label: "Mondul Kiri" },
  { value: "Oddar_Meanchey", label: "Oddar Meanchey" },
  { value: "Pailin", label: "Pailin" },
  { value: "Phnom_Penh", label: "Phnom Penh" },
  { value: "Preah_Sihanouk", label: "Preah Sihanouk" },
  { value: "Preah_Vihear", label: "Preah Vihear" },
  { value: "Prey_Veng", label: "Prey Veng" },
  { value: "Pursat", label: "Pursat" },
  { value: "Ratanakiri", label: "Ratanak Kiri" },
  { value: "Siem_Reap", label: "Siem Reap" },
  { value: "Stung_Treng", label: "Stung Treng" },
  { value: "Svay_Rieng", label: "Svay Rieng" },
  { value: "Takeo", label: "Takeo" },
  { value: "Tboung_Khmum", label: "Tboung Khmum" },
];

// Reverse lookup: backend value (e.g. "Phnom_Penh") → display label ("Phnom Penh")
const PROVINCE_VALUE_TO_LABEL: Record<string, string> = Object.fromEntries(
  CAMBODIA_PROVINCES.map((p) => [p.value, p.label]),
);

export function getProvinceLabel(value?: string | null): string {
  if (!value) return "—";
  return PROVINCE_VALUE_TO_LABEL[value] ?? value.replace(/_/g, " ");
}

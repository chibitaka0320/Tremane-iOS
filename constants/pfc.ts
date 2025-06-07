export const PFC_LABELS = [
  { key: "protein", label: "P" },
  { key: "fat", label: "F" },
  { key: "carb", label: "C" },
] as const;

export type PfcKey = (typeof PFC_LABELS)[number]["key"];

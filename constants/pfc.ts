export const PFC_LABELS = [
  { key: "protein", label: "P" },
  { key: "fat", label: "F" },
  { key: "carbo", label: "C" },
] as const;

export type PfcKey = (typeof PFC_LABELS)[number]["key"];

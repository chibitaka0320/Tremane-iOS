export type PfcPlanDetail = {
  description: string;
  ratio: string;
  compactRatio: string;
};

export const pfcPlanDetails: Record<string, PfcPlanDetail> = {
  "0": {
    description:
      "バランスの良い食事で、健康的に体を整えたい方向けのプランです。",
    ratio: "P 40% / F 20% / C 40%",
    compactRatio: "P40% / F20% / C40%",
  },
  "1": {
    description:
      "たんぱく質と糖質をしっかり摂り、筋肉量を増やしたい方向けのプランです。",
    ratio: "P 30% / F 20% / C 50%",
    compactRatio: "P30% / F20% / C50%",
  },
  "2": {
    description: "糖質を抑えてすっきりした体を目指したい方向けのプランです。",
    ratio: "P 55% / F 25% / C 20%",
    compactRatio: "P55% / F25% / C20%",
  },
};

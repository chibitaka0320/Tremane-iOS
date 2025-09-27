// トレーニング分析情報
export type TrainingAnalysis = {
  labels: string[];
  datasets: [
    {
      data: number[];
    }
  ];
  name: string;
};

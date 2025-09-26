// トレーニング情報詳細
export type TrainingWithExercise = {
  trainingId: number;
  date: Date;
  partsId: number;
  exerciseId: string;
  weight: number;
  reps: number;
  createdAt: string;
};

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

export type SetType = {
  trainingId: string;
  weight: number;
  reps: number;
};

export type ExerciseType = {
  exerciseId: number;
  name: string;
  sets: SetType[];
};

export type TrainingByDate = {
  partsId: number;
  name: string;
  exercises: ExerciseType[];
};

// トレーニング情報詳細
export type TrainingWithExercise = {
  trainingId: number;
  date: Date;
  partsId: number;
  exerciseId: number;
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

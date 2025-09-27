// 1日のトレーニング情報(行データ)
export type DailyTrainingRow = {
  trainingId: string;
  partsId: number;
  partsName: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
};

// トレーニング
export type Training = {
  trainingId: string;
  weight: number;
  reps: number;
};

// トレーニング種目
export type Exercise = {
  exerciseId: string;
  name: string;
  trainings: Training[];
};

// トレーニング部位
// bodyPartDtoのBodyPartを使用するか検討
export type BodyPart = {
  bodyPartId: number;
  name: string;
  exercises: Exercise[];
};

// 日別トレーニング情報
export type DailyTraining = {
  date: string;
  bodyParts: BodyPart[];
};

// トレーニング詳細
export type TrainingDetail = {
  trainingId: string;
  date: string;
  bodyPartId: number;
  exerciseId: string;
  weight: number;
  reps: number;
};

// トレーニング分析グラフ用（行データ）
export type TrainingAnalysisRow = {
  bodyPartId: number;
  exerciseId: string;
  exerciseName: string;
  date: string;
  weight: number;
};

// トレーニング分析グラフ用
export type TrainingAnalysisChart = {
  labels: string[];
  datasets: [
    {
      data: number[];
    }
  ];
  name: string;
};

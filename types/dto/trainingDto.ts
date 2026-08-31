// 1日のトレーニング情報(行データ)
export type DailyTrainingRow = {
  date: string;
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

// 最近使った種目（種目ごとの直近1件）
export type RecentExercise = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  createdAt: string;
};

// 種目の前回の記録
export type LastTraining = {
  weight: number;
  reps: number;
  date: string;
};

// 種目の過去の記録（日付ごとのセット一覧）
export type PastTraining = {
  date: string;
  sets: {
    weight: number;
    reps: number;
  }[];
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

// 今月のサマリー（分析画面・全体タブ用）
export type MonthlySummary = {
  trainingDays: number;
  weeklyAverage: number;
  totalVolume: number;
  totalSets: number;
};

// 週別総負荷量の推移（分析画面・全体タブ用）
export type WeeklyVolume = {
  weekLabel: string;
  volume: number;
};

// 部位別トレーニングバランス（分析画面・全体タブ用、セット数ベース）
export type BodyPartSetShare = {
  bodyPartId: number;
  bodyPartName: string;
  setCount: number;
  percentage: number;
};

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

// 種目別分析の指標（分析画面・部位別タブ用）
export type ExerciseAnalysisMetric = "maxWeight" | "totalVolume" | "totalReps";

// 種目別分析の期間（分析画面・部位別タブ用）
export type ExerciseAnalysisPeriod = "1M" | "3M" | "6M" | "1Y";

// 種目別・日別の指標行データ（分析画面・部位別タブ用）
export type ExerciseMetricRow = {
  exerciseId: string;
  exerciseName: string;
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
};

// 種目別の指標推移（分析画面・部位別タブ用）
export type ExerciseMetricTrend = {
  exerciseId: string;
  exerciseName: string;
  dates: string[];
  values: number[];
  currentValue: number;
  changeValue: number;
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

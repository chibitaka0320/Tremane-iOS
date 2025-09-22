// ユーザーテーブル
export type UserEntity = {
  user_id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
};

// ユーザープロフィールテーブル
export type UserProfileEntity = {
  user_id: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  active_level: number;
  is_synced: number;
  created_at: string;
  updated_at: string;
};

// ユーザー目標テーブル
export type UserGoalEntity = {
  user_id: string;
  weight: number;
  goal_weight: number;
  start: string;
  finish: string;
  pfc: number;
  is_synced: number;
  created_at: string;
  updated_at: string;
};

// トレーニングテーブル
export type TrainingEntity = {
  training_id: string;
  date: string;
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  is_synced: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

// 食事テーブル
export type EatingEntity = {
  eating_id: string;
  date: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
  is_synced: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

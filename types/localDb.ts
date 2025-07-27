// ユーザーテーブル
export type User = {
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// ユーザープロフィールテーブル
export type UserProfile = {
  userId: string;
  nickname: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  activeLevel: number;
  createdAt: string;
  updatedAt: string;
};

// ユーザー目標テーブル
export type UserGoal = {
  userId: string;
  weight: number;
  goalWeight: number;
  start: string;
  finish: string;
  pfc: number;
  createdAt: string;
  updatedAt: string;
};

// 部位テーブル
export type BodyPart = {
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 種目テーブル
export type Exercise = {
  exerciseId: number;
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// トレーニングテーブル
export type Training = {
  trainingId: string;
  date: string;
  userId: string;
  exerciseId: number;
  weight: number;
  reps: number;
  createdAt: string;
  updatedAt: string;
};

// 食事テーブル
export type Eating = {
  eatingId: string;
  date: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
  createdAt: string;
  updatedAt: string;
};

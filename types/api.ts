import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

// ==== レスポンス ====
// ユーザー情報取得API
export type UserResponse = {
  userId: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
};

// ユーザープロフィール情報取得API
export type UserProfileResponse = {
  userId: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  activeLevel: number;
  createdAt: string;
  updatedAt: string;
};

// ユーザー目標情報取得API
export type UserGoalResponse = {
  userId: string;
  weight: number;
  goalWeight: number;
  start: string;
  finish: string;
  pfc: number;
  createdAt: string;
  updatedAt: string;
};

// トレーニング情報取得API
export type TrainingResponse = {
  trainingId: string;
  date: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  createdAt: string;
  updatedAt: string;
};

// 食事情報取得API
export type EatingResponse = {
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

// トレーニング種目取得API
export type ExerciseResponse = {
  exerciseId: string;
  ownerUserId: string;
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 部位データ取得API
export type BodyPartResponse = {
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// ==== リクエスト ====
// ユーザープロフィール情報追加更新API
export type UserProfileRequest = {
  userId: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  activeLevel: number;
  createdAt: string;
  updatedAt: string;
};

// ユーザー目標情報追加更新API
export type UserGoalRequest = {
  userId: string;
  weight: number;
  goalWeight: number;
  start: string;
  finish: string;
  pfc: number;
  createdAt: string;
  updatedAt: string;
};

// トレーニング情報追加更新API
export type TrainingRequest = {
  trainingId: string;
  date: string;
  exerciseId: string;
  weight: number;
  reps: number;
  createdAt: string;
  updatedAt: string;
};

// 食事情報追加更新API
export type EatingRequest = {
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

// トレーニング種目追加更新API
export type ExerciseRequest = {
  exerciseId: string;
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// ユーザーアカウント情報API
export type UserAccountInfoResponse = {
  userId: string;
  email: string;
  nickname: string;
  status: string;
  requestId: string;
};

// トレーニングランキングAPI
export type TrainingRankingResponse = {
  userId: string;
  nickname: string;
  trainingCounts: number;
};

// タイムラインAPI
export type TimelineTrainingResponse = {
  userId: string;
  nickname: string;
  date: Date;
  bodyParts: bodyParts[];
};

type bodyParts = {
  partsId: number;
  bodyPartsName: string;
};

export type NotificationResponse = {
  notificationId: string;
  userId: string;
  notificationSource: string;
  type: string;
  message: string;
  relatedId: string;
  createdAt: Timestamp;
  status: string | null;
};

export type ErrorType = {
  error: string;
  code?: number;
};

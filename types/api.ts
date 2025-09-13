import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

// 部位・種目取得API
export type BodyPartExerciseResponse = {
  partsId: number;
  name: string;
  exercises: ExerciseResponse[];
};

type ExerciseResponse = {
  exerciseId: string;
  name: string;
};

// ユーザー情報API
export type UserInfoResponse = {
  height: number;
  weight: number;
  birthday: Date;
  age: number;
  gender: number;
  activeLevel: number;
  bmr: number;
  totalCalorie: number;
};

// ユーザー目標API
export type UserGoalResponse = {
  weight: number;
  goalWeight: number;
  goalCalorie: number;
  start: Date;
  finish: Date;
  pfc: number;
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

import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

// 部位・種目取得API
export type BodyPartExerciseResponse = {
  partsId: number;
  name: string;
  exercises: ExerciseResponse[];
};

type ExerciseResponse = {
  exerciseId: number;
  name: string;
};

// ユーザー情報API
export type UserInfoResponse = {
  nickname: string;
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

// トレーニング個別情報API
export type TrainingResponse = {
  trainingId: number;
  date: Date;
  partsId: number;
  exerciseId: number;
  weight: number;
  reps: number;
};

// 部位テーブル
export type BodyPart = {
  partsId: number;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// 種目テーブル
export type Exercise = {
  exerciseId: number;
  partsId: number;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ErrorType = {
  error: string;
  code?: number;
};

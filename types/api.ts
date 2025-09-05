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
};

export type ErrorType = {
  error: string;
  code?: number;
};

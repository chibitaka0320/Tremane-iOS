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

export type ErrorType = {
  error: string;
  code?: number;
};

// ユーザー目標DTO
export type UserGoal = {
  weight: number;
  goalWeight: number;
  goalCalorie: number;
  start: string;
  finish: string;
  pfc: number;
};

// ユーザープロフィールDTO
export type UserProfile = {
  height: number;
  weight: number;
  birthday: string;
  age: number;
  gender: number;
  activeLevel: number;
  bmr: number;
  totalCalorie: number;
};

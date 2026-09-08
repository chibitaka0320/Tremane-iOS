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
  height: number | null;
  weight: number | null;
  birthday: string | null;
  age: number | null;
  gender: number | null;
  activeLevel: number | null;
  bmr: number | null;
  totalCalorie: number | null;
};

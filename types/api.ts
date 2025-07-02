// 新規登録API
export type SignUpResponse = {
  accessToken: string;
  refreshToken: string;
};

// ログインAPI
export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
};

// トークン再発行API
export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

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

export type ErrorType = {
  error: string;
  code?: number;
};

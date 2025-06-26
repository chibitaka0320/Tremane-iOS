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

export type ErrorType = {
  error: string;
  code?: number;
};

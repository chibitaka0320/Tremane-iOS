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

// ユーザーメールアドレス検索API
export type UserSearchResponse = {
  userId: string;
  email: string;
  nickname: string;
  status: string;
  requestId: string;
};

// トレーニング日数ランキング取得
export type TrainingDateRankingResponse = {
  userId: string;
  nickname: string;
  trainingCounts: number;
};

// トレーニングタイムライン取得
export type TimelineTrainingResponse = {
  userId: string;
  nickname: string;
  date: string;
  bodyParts: {
    partsId: number;
    bodyPartsName: string;
  }[];
};

// トレーニングランキング取得API
export type TrainingRankingResponse = {
  userId: string;
  nickname: string;
  trainingCounts: number;
};

// 通知一覧取得API
export type NotificationResponse = {
  notificationId: string;
  userId: string;
  notificationSource: string;
  type: string;
  message: string;
  relatedId: string;
  createdAt: string;
  status: string | null;
};

// 友達申請API
export type FriendRequestResponse = {
  requestId: string;
  status: string;
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

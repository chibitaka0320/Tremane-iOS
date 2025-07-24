// ユーザーテーブル
export type User = {
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// ユーザープロフィールテーブル
export type UserProfile = {
  userId: string;
  nickname: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  activeLevel: number;
  createdAt: string;
  updatedAt: string;
};

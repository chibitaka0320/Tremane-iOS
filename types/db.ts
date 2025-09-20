// ユーザーテーブル
export type UserEntity = {
  user_id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
};

// ユーザープロフィールテーブル
export type UserProfileEntity = {
  user_id: string;
  height: number;
  weight: number;
  birthday: string;
  gender: number;
  active_level: number;
  is_synced: number;
  createdAt: string;
  updatedAt: string;
};

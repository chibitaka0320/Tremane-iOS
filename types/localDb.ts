// 種目テーブル
export type Exercise = {
  exerciseId: string;
  ownerUserId?: string;
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 食事テーブル
export type Eating = {
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

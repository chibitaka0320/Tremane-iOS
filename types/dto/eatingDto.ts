// 栄養素セット
export type Nutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
};

// 1食分食事記録
export type MealRecord = Nutrition & {
  eatingId: string;
  date: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 1日分食事集計
export type DailyEating = {
  date: string;
  total: Nutrition;
  goal: Nutrition;
  rate: Nutrition;
  meals: MealRecord[];
};

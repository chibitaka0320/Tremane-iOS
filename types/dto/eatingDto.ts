// 栄養素セット
export type Nutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
};

// 1件分の食品記録
export type FoodRecord = Nutrition & {
  eatingId: string;
  date: string;
  name: string;
  mealId: string | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
};

// 食事記録（複数の食品記録をまとめる親レコード）
export type Meal = {
  mealId: string;
  date: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 食事記録詳細（内包する食品一覧・合計栄養素付き）
export type MealDetail = Meal & {
  foods: FoodRecord[];
  total: Nutrition;
};

// 1日分食事集計
export type DailyEating = {
  date: string;
  total: Nutrition;
  goal: Nutrition | null;
  rate: Nutrition;
  meals: FoodRecord[];
};

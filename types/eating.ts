interface Total {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

interface Goal {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

interface EatType {
  date: string;
  total: Total;
  goal: Goal;
  meals: Meal[];
}

export type { EatType, Meal, Goal, Total };

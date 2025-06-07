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

interface Rate {
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
  rate: Rate;
  meals: Meal[];
}

export type { EatType, Meal, Goal, Rate, Total };

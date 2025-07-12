interface Total {
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface Goal {
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface Rate {
  protein: number;
  fat: number;
  carbo: number;
}

interface Meal {
  eatingId: number;
  date: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface EatType {
  date: string;
  total: Total;
  goal: Goal;
  rate: Rate;
  meals: Meal[];
}

export type { EatType, Meal, Goal, Rate, Total };

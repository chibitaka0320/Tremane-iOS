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
  eatingId: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface EatingByDate {
  date: string;
  total: Total;
  goal: Goal;
  rate: Rate;
  meals: Meal[];
}

export type { EatingByDate, Meal, Goal, Rate, Total };

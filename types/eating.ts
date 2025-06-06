interface Total {
  kcal: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface Goal {
  kcal: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface Meal {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbo: number;
}

interface EatType {
  date: string;
  total: Total;
  goal: Goal;
  meals: Meal[];
}

export type { EatType };

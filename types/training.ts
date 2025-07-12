interface SetType {
  trainingId: number;
  weight: number;
  reps: number;
}

interface ExerciseType {
  name: string;
  sets: SetType[];
}

interface BodyPartType {
  name: string;
  exercises: ExerciseType[];
}

export type { BodyPartType, ExerciseType };

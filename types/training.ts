interface SetType {
  trainingId: number;
  weight: number;
  reps: number;
}

interface ExerciseType {
  exerciseId: number;
  name: string;
  sets: SetType[];
}

interface BodyPartType {
  partsId: number;
  name: string;
  exercises: ExerciseType[];
}

export type { BodyPartType, ExerciseType };

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

interface TrainingRequest {
  date: string;
  exerciseId: string;
  weight: number;
  reps: number;
}

export type { BodyPartType, ExerciseType, TrainingRequest };

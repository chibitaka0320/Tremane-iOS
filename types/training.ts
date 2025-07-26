export type SetType = {
  trainingId: string;
  weight: number;
  reps: number;
};

export type ExerciseType = {
  exerciseId: number;
  name: string;
  sets: SetType[];
};

export type TrainingByDate = {
  partsId: number;
  name: string;
  exercises: ExerciseType[];
};

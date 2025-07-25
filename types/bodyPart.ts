export type BodypartWithExercise = {
  partsId: number;
  name: string;
  exercises: Exercise[];
};

type Exercise = {
  exerciseId: number;
  name: string;
};

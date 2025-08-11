export type BodypartWithExercise = {
  partsId: number;
  name: string;
  exercises: Exercise[];
};

type Exercise = {
  exerciseId: string;
  name: string;
  myFlg?: boolean;
};

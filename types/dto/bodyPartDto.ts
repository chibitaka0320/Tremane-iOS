// 種目付き部位DTO
export type BodyPartWithExercise = {
  partsId: number;
  partName: string;
  exerciseId: string;
  ownerUserId: string;
  exerciseName: string;
};

// ネスト後部位DTO
// TODO：exerciseDtoのExerciseを使用するか検討
export type BodyPart = {
  partsId: number;
  partName: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    ownerUserId: string;
    myExerciseFlg: boolean;
  }[];
};

// 種目付き部位DTO
export type BodyPartWithExerciseDto = {
  partsId: number;
  partName: string;
  exerciseId: string;
  ownerUserId: string;
  exerciseName: string;
};

// ネスト後部位DTO
export type BodyPartDto = {
  partsId: number;
  partName: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    ownerUserId: string;
    myExerciseFlg: boolean;
  }[];
};

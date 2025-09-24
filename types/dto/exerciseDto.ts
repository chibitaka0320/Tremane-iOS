// トレーニング種目DTO
export type Exercise = {
  exerciseId: string;
  ownerUserId?: string;
  partsId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

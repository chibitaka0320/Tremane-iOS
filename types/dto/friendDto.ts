// 友達申請DTO
export type FriendRequest = {
  requestId: string | null;
  status: string | null;
};

// トレーニングランキング用DTO
export type TrainingRanking = {
  userId: string;
  nickname: string;
  count: number;
};

// トレーニングタイムライン用DTO
export type TrainingTimeline = {
  userId: string;
  nickname: string;
  date: string;
  bodyParts: {
    partsId: number;
    bodyPartsName: string;
  }[];
};

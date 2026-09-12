// 友達申請DTO
export type FriendRequest = {
  requestId: string | null;
  status: string | null;
};

// トレーニングランキング用DTO
export type TrainingRanking = {
  userId: string;
  nickname: string;
  iconUrl: string | null;
  count: number;
};

// トレーニングタイムライン用DTO
export type TrainingTimeline = {
  userId: string;
  nickname: string;
  iconUrl: string | null;
  date: string;
  bodyParts: {
    partsId: number;
    bodyPartsName: string;
  }[];
  exerciseCount: number;
  totalVolume: number;
  estimatedCalories: number | null;
  lastActivityAt: string;
};

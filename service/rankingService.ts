import * as friendApi from "@/api/friendApi";
import { TrainingRanking } from "@/types/dto/rankingDto";

// 月間トレーニング回数ランキング取得
export async function getTrainingRankingMonthly(): Promise<TrainingRanking[]> {
  const trainingRankingsRes = await friendApi.getRankingMonthly();

  let rankings: TrainingRanking[] = [];

  if (trainingRankingsRes) {
    for (const rankingRes of trainingRankingsRes) {
      const ranking: TrainingRanking = {
        userId: rankingRes.userId,
        nickname: rankingRes.nickname,
        count: rankingRes.trainingCounts,
      };
      rankings.push(ranking);
    }
  }

  return rankings;
}

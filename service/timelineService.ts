import * as friendApi from "@/api/friendApi";
import { TrainingTimeline } from "@/types/dto/friendDto";

export async function getTrainingTimeline(): Promise<TrainingTimeline[]> {
  const timelinesRes = await friendApi.getTimeline();
  let timelines: TrainingTimeline[] = [];

  if (timelinesRes) {
    for (const timelineRes of timelinesRes) {
      const timeline: TrainingTimeline = {
        userId: timelineRes.userId,
        nickname: timelineRes.nickname,
        date: timelineRes.date,
        bodyParts: timelineRes.bodyParts,
      };
      timelines.push(timeline);
    }
  }

  return timelines;
}

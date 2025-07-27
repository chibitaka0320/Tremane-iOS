import { apiRequest } from "@/lib/apiClient";
import { BodyPart, Exercise } from "@/types/localDb";
import { format } from "date-fns";
import { getLatestBodyPart, insertBodyPartDao } from "./dao/bodyPartDao";
import { getLatestExercise, insertExerciseDao } from "./dao/exerciseDao";

export const initMaster = async () => {
  try {
    // 部位テーブル初期化
    const latestBodyPart = await getLatestBodyPart();

    const bodyPartRes = await apiRequest(
      "/bodyparts?updatedAt=" +
        format(latestBodyPart, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      "GET",
      null
    );

    if (bodyPartRes?.ok) {
      const bodyPart: BodyPart[] = await bodyPartRes.json();
      await insertBodyPartDao(bodyPart);
    }

    // 種目テーブル初期化
    const latestExercise = await getLatestExercise();

    const exerciseRes = await apiRequest(
      "/exercise?updatedAt=" +
        format(latestExercise, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      "GET",
      null
    );

    if (exerciseRes?.ok) {
      const exercise: Exercise[] = await exerciseRes.json();
      await insertExerciseDao(exercise);
    }

    console.log("マスタデータダウンロード完了");
  } catch (error) {
    console.error(error);
  }
};

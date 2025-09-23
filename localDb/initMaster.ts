import { apiRequest } from "@/lib/apiClient";
import { Exercise } from "@/types/localDb";
import { format } from "date-fns";
import { getLatestExercise, insertExerciseDao } from "./dao/exerciseDao";
import * as bodyPartRepository from "@/localDb/repository/bodyPartRepository";

// リモードDBからマスタデータを同期する
export const initMaster = async () => {
  console.log("========== マスタデータ同期開始 ==========");
  try {
    // 部位テーブル初期化
    await bodyPartRepository.syncBodyPartsFromRemte();
    console.log("部位データ同期完了");

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
  } finally {
    console.log("========== マスタデータダウンロード終了 ==========");
  }
};

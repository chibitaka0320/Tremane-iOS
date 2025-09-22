import { apiRequestWithRefresh } from "@/lib/apiClient";
import { Exercise } from "@/types/localDb";
import { format } from "date-fns";
import { getLatestMyExercise, updateMyExerciseDao } from "./dao/myExerciseDao";
import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import { ApiError } from "@/lib/error";

export const initUser = async () => {
  console.log("========== データ同期開始（Remote → Local） ==========");
  try {
    // ユーザーテーブル初期化
    await userRepository.syncUsersFromRemote();

    // ユーザープロフィールテーブル初期化
    await userProfileRepository.syncUserProfilesFromRemote();

    // ユーザー目標テーブル初期化
    await userGoalRepository.syncUserGoalsFromRemote();

    // トレーニングテーブル初期化
    await trainingRepository.syncTrainingsFromRemote();

    // 食事テーブル初期化
    await eatingRepository.syncEatingsFromRemote();

    // マイ種目テーブル初期化
    const latestExercise = await getLatestMyExercise();

    const myExerciseRes = await apiRequestWithRefresh(
      "/exercise/myself?updatedAt=" +
        format(latestExercise, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      "GET",
      null
    );

    if (myExerciseRes?.ok) {
      const exercise: Exercise[] = await myExerciseRes.json();
      await updateMyExerciseDao(exercise, 1, 0);
    }

    console.log("データダウンロード完了");
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("APIエラー：(" + error.status + ")" + error.message);
    } else {
      console.error(
        "ユーザー情報同期エラー（リモート → ローカル）：" +
          (error as Error).message
      );
    }
  } finally {
    console.log("========== データ同期終了（Remote → Local） ==========");
  }
};

import { Exercise, UserGoal } from "@/types/localDb";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { getUnsyncedUserGoal, setUserGoalSynced } from "../dao/userGoalDao";
import {
  getUnsyncedMyExercise,
  setMyExercisesSynced,
  updateMyExerciseDao,
} from "../dao/myExerciseDao";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import { ApiError } from "@/lib/error";

// ローカルDBのデータをリモートDBに同期する。
export const syncLocalDb = async () => {
  console.log("========== データ同期開始（Local → Remote） ==========");
  try {
    // ユーザーテーブルの非同期データ送信
    // TODO: ユーザーテーブルの同期を作成

    // ユーザープロフィールの非同期データ送信
    await userProfileRepository.syncUserProfilesFromLocal();

    // ユーザー目標の非同期データ送信
    const userGoal: UserGoal | null = await getUnsyncedUserGoal();

    if (userGoal) {
      try {
        const res = await apiRequestWithRefresh(
          "/users/goal",
          "POST",
          userGoal
        );
        if (res?.ok) {
          await setUserGoalSynced();
        }
      } catch (e) {
        console.error(e);
      }
    }

    // トレーニングデータの非同期データ送信
    await trainingRepository.syncTrainingsFromLocal();

    // 食事データの非同期データ送信
    await eatingRepository.syncEatingsFromLocal();

    // マイ種別データ（追加）
    const myExerciseAdd: Exercise[] = await getUnsyncedMyExercise(0);
    if (myExerciseAdd.length > 0) {
      try {
        const res = await apiRequestWithRefresh(
          `/exercise/myself`,
          "POST",
          myExerciseAdd
        );
        if (res?.ok) {
          await updateMyExerciseDao(myExerciseAdd, 1, 0);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // マイ種別データ（削除）
    const myExerciseDelete: Exercise[] = await getUnsyncedMyExercise(1);
    if (myExerciseDelete.length > 0) {
      for (const exercise of myExerciseDelete) {
        try {
          const res = await apiRequestWithRefresh(
            `/exercise/myself/` + exercise.exerciseId,
            "DELETE",
            null
          );
          if (res?.ok) {
            await setMyExercisesSynced(exercise.exerciseId);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    console.log("データアップロード完了");
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("APIエラー：(" + error.status + ")" + error.message);
    } else {
      console.error(
        "ユーザー情報同期エラー（ローカル → リモート）：" +
          (error as Error).message
      );
    }
  } finally {
    console.log("========== データ同期終了（Local → Remote） ==========");
  }
};

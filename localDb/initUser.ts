import { apiRequestWithRefresh } from "@/lib/apiClient";
import { Eating, Exercise, Training, UserGoal } from "@/types/localDb";
import { format } from "date-fns";
import { getLatestTraining, upsertTrainingDao } from "./dao/trainingDao";
import { getLatestEating, upsertEatingDao } from "./dao/eatingDao";
import { getLatestUserGoal, insertUserGoalDao } from "./dao/userGoalDao";
import { getLatestMyExercise, updateMyExerciseDao } from "./dao/myExerciseDao";
import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import { ApiError } from "@/lib/error";

export const initUser = async () => {
  try {
    // ユーザーテーブル初期化
    await userRepository.syncUsersFromRemote();

    // ユーザープロフィールテーブル初期化
    await userProfileRepository.syncUserProfilesFromRemote();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("APIエラー：(" + error.status + ")" + error.message);
    } else {
      console.error(
        "ユーザー情報同期エラー（リモート → ローカル）：" +
          (error as Error).message
      );
    }
  }

  // ユーザー目標テーブル初期化
  const latestUserGoal = await getLatestUserGoal();

  const userGoalRes = await apiRequestWithRefresh(
    "/users/goal?updatedAt=" +
      format(latestUserGoal, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    "GET",
    null
  );

  if (userGoalRes?.ok) {
    const userGoalInfo: UserGoal = await userGoalRes.json();
    await insertUserGoalDao(userGoalInfo, 1);
  }

  // トレーニングテーブル初期化
  const latestTraining = await getLatestTraining();

  const trainingRes = await apiRequestWithRefresh(
    "/training?updatedAt=" +
      format(latestTraining, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    "GET",
    null
  );

  if (trainingRes?.ok) {
    const training: Training[] = await trainingRes.json();
    await upsertTrainingDao(training, 1, 0);
  }

  // 食事テーブル初期化
  const latestEating = await getLatestEating();

  const eatingRes = await apiRequestWithRefresh(
    "/eating?updatedAt=" + format(latestEating, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    "GET",
    null
  );

  if (eatingRes?.ok) {
    const eating: Eating[] = await eatingRes.json();
    await upsertEatingDao(eating, 1, 0);
  }

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
};

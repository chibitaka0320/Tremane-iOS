import { apiRequestWithRefreshNew } from "@/lib/apiClient";
import { db } from "@/lib/localDbConfig";
import { Eating, Training, User, UserProfile } from "@/types/localDb";
import {
  getLatestUserProfile,
  insertUserProfileDao,
} from "./dao/userProfileDao";
import { insertUserDao } from "./dao/userDao";
import { format } from "date-fns";
import { getLatestTraining, upsertTrainingDao } from "./dao/trainingDao";
import { getLatestEating, upsertEatingDao } from "./dao/eatingDao";

export const initUser = async () => {
  // ユーザーテーブル初期化
  const userRes = await apiRequestWithRefreshNew("/users", "GET", null);

  if (userRes?.ok) {
    const userInfo: User = await userRes.json();
    await insertUserDao(userInfo);
  }

  // ユーザープロフィールテーブル初期化
  const latestUserProfile = await getLatestUserProfile();

  const userProfileRes = await apiRequestWithRefreshNew(
    "/users/profile?updatedAt=" +
      format(latestUserProfile, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    "GET",
    null
  );

  if (userProfileRes?.ok) {
    const userProfileInfo: UserProfile = await userProfileRes.json();
    await insertUserProfileDao(userProfileInfo, 1);
  }

  // トレーニングテーブル初期化
  const latestTraining = await getLatestTraining();

  const trainingRes = await apiRequestWithRefreshNew(
    "/training/sync?updatedAt=" +
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

  const eatingRes = await apiRequestWithRefreshNew(
    "/eating/sync?updatedAt=" +
      format(latestEating, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    "GET",
    null
  );

  if (eatingRes?.ok) {
    const eating: Eating[] = await eatingRes.json();
    await upsertEatingDao(eating, 1, 0);
  }

  console.log("データダウンロード完了");
};

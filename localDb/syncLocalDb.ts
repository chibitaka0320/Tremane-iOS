import { Eating, Training, UserProfile } from "@/types/localDb";
import {
  getUnsyncedUserProfile,
  setUserProfileSynced,
} from "./dao/userProfileDao";
import { apiRequestWithRefreshNew } from "@/lib/apiClient";
import {
  getUnsyncedTraining,
  setTrainingSynced,
  upsertTrainingDao,
} from "./dao/trainingDao";
import {
  getUnsyncedEating,
  setEatingSynced,
  upsertEatingDao,
} from "./dao/eatingDao";

export const syncLocalDb = async () => {
  try {
    // ユーザープロフィールの非同期データ送信
    const userProfile: UserProfile | null = await getUnsyncedUserProfile();

    if (userProfile) {
      try {
        const res = await apiRequestWithRefreshNew(
          "/users/profile",
          "POST",
          userProfile
        );
        if (res?.ok) {
          await setUserProfileSynced();
        }
      } catch (e) {
        console.error(e);
      }
    }

    // トレーニングデータの非同期データ送信（追加）
    const trainingAdd: Training[] = await getUnsyncedTraining(0);
    if (trainingAdd.length > 0) {
      try {
        const res = await apiRequestWithRefreshNew(
          `/training`,
          "POST",
          trainingAdd
        );
        if (res?.ok) {
          await upsertTrainingDao(trainingAdd, 1, 0);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // トレーニングデータの非同期データ送信（削除）
    const trainingDelete: Training[] = await getUnsyncedTraining(1);
    if (trainingDelete.length > 0) {
      for (const training of trainingDelete) {
        try {
          const res = await apiRequestWithRefreshNew(
            `/training/` + training.trainingId,
            "DELETE",
            null
          );
          if (res?.ok) {
            await setTrainingSynced(training.trainingId);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 食事データの非同期データ送信（追加）
    const eatingAdd: Eating[] = await getUnsyncedEating(0);
    if (eatingAdd.length > 0) {
      try {
        const res = await apiRequestWithRefreshNew(
          `/eating`,
          "POST",
          eatingAdd
        );
        if (res?.ok) {
          await upsertEatingDao(eatingAdd, 1, 0);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 食事データの非同期データ送信（削除）
    const eatingDelete: Eating[] = await getUnsyncedEating(1);
    if (eatingDelete.length > 0) {
      for (const eating of eatingDelete) {
        try {
          const res = await apiRequestWithRefreshNew(
            `/eating/` + eating.eatingId,
            "DELETE",
            null
          );
          if (res?.ok) {
            await setEatingSynced(eating.eatingId);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    console.log("データアップロード完了");
  } catch (error) {
    console.error(error);
  }
};

import {
  Eating,
  Exercise,
  Training,
  UserGoal,
  UserProfile,
} from "@/types/localDb";
import {
  getUnsyncedUserProfile,
  setUserProfileSynced,
} from "./dao/userProfileDao";
import { apiRequestWithRefresh } from "@/lib/apiClient";
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
import { getUnsyncedUserGoal, setUserGoalSynced } from "./dao/userGoalDao";
import {
  getUnsyncedMyExercise,
  setMyExercisesSynced,
  updateMyExerciseDao,
} from "./dao/myExerciseDao";

export const syncLocalDb = async () => {
  try {
    // ユーザープロフィールの非同期データ送信
    const userProfile: UserProfile | null = await getUnsyncedUserProfile();

    if (userProfile) {
      try {
        const res = await apiRequestWithRefresh(
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

    // トレーニングデータの非同期データ送信（追加）
    const trainingAdd: Training[] = await getUnsyncedTraining(0);
    if (trainingAdd.length > 0) {
      try {
        const res = await apiRequestWithRefresh(
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
          const res = await apiRequestWithRefresh(
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
        const res = await apiRequestWithRefresh(`/eating`, "POST", eatingAdd);
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
          const res = await apiRequestWithRefresh(
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
    console.error(error);
  }
};

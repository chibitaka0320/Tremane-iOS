import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import * as exerciseRepository from "@/localDb/repository/exerciseRepository";
import { ApiError } from "@/lib/error";

// ローカルDBのデータをリモートDBに同期する。
export const syncLocalDb = async () => {
  console.log("========== データ同期開始（Local → Remote） ==========");
  try {
    // ユーザーテーブルの非同期データ送信
    // TODO: ユーザーテーブルの同期を作成

    // ユーザープロフィールの非同期データ送信
    await userProfileRepository.syncUserProfilesFromLocal();
    console.log("ユーザープロフィールデータ同期完了");

    // ユーザー目標の非同期データ送信
    await userGoalRepository.syncUserGoalsFromLocal();
    console.log("ユーザー目標データ同期完了");

    // トレーニングの非同期データ送信
    await trainingRepository.syncTrainingsFromLocal();
    console.log("トレーニングデータ同期完了");

    // 食事の非同期データ送信
    await eatingRepository.syncEatingsFromLocal();
    console.log("食事データ同期完了");

    // マイトレーニング種目の非同期データ送信
    await exerciseRepository.syncMyExercisesFromLocal();
    console.log("マイトレーニング種目データ同期完了");
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

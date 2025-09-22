import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import * as exerciseRepository from "@/localDb/repository/exerciseRepository";
import { ApiError } from "@/lib/error";

// リモートDBからローカルDBにユーザーデータを同期する。
export const initUser = async () => {
  console.log("========== データ同期開始（Remote → Local） ==========");
  try {
    // ユーザーテーブル初期化
    await userRepository.syncUsersFromRemote();
    console.log("ユーザーデータ同期完了");

    // ユーザープロフィールテーブル初期化
    await userProfileRepository.syncUserProfilesFromRemote();
    console.log("ユーザープロフィールデータ同期完了");

    // ユーザー目標テーブル初期化
    await userGoalRepository.syncUserGoalsFromRemote();
    console.log("ユーザー目標データ同期完了");

    // トレーニングテーブル初期化
    await trainingRepository.syncTrainingsFromRemote();
    console.log("トレーニングデータ同期完了");

    // 食事テーブル初期化
    await eatingRepository.syncEatingsFromRemote();
    console.log("食事データ同期完了");

    // マイ種目テーブル初期化
    await exerciseRepository.syncMyExercisesFromRemote();
    console.log("マイトレーニング種目データ同期完了");
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

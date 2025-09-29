import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import * as exerciseRepository from "@/localDb/repository/exerciseRepository";

// ローカルDB（ユーザーに紐づく情報）の削除
export const clearLocalDb = async () => {
  console.log(
    "========== ローカルDBデータクリア処理開始（マスタは除く） =========="
  );
  try {
    // ユーザー情報削除
    await userRepository.deleteUser();
    console.log("ユーザーデータクリア完了");

    // ユーザープロフィール情報削除
    await userProfileRepository.deleteUserProfile();
    console.log("ユーザープロフィールデータクリア完了");

    // ユーザー目標情報削除
    await userGoalRepository.deleteUserGoal();
    console.log("ユーザー目標データクリア完了");

    // トレーニング情報削除
    await trainingRepository.deleteTrainings();
    console.log("トレーニングデータクリア完了");

    // 食事情報削除
    await eatingRepository.deleteEatings();
    console.log("食事データクリア完了");

    // マイトレーニング種目削除
    await exerciseRepository.deleteMyExercises();
    console.log("マイトレーニング種目クリア完了");
  } catch (error) {
    console.error("ローカルDBデータクリアエラー：" + error);
  } finally {
    console.log(
      "========== ローカルDBデータクリア処理終了（マスタは除く） =========="
    );
  }
};

import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import { deleteMyExercises } from "./dao/myExerciseDao";

// ローカルDB（ユーザーに紐づく情報）の削除
export const clearLocalDb = async () => {
  console.log(
    "========== ローカルDBデータクリア開始（マスタは除く） =========="
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
  } catch (error) {}
  await deleteMyExercises();
};

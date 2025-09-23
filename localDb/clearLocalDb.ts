import * as userRepository from "@/localDb/repository/userRepository";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import { deleteEatings } from "./dao/eatingDao";
import { deleteMyExercises } from "./dao/myExerciseDao";
import { deleteTrainings } from "./dao/trainingDao";
import { deleteUserGoalDao } from "./dao/userGoalDao";

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
  } catch (error) {}
  await deleteUserGoalDao();
  await deleteEatings();
  await deleteTrainings();
  await deleteMyExercises();
};

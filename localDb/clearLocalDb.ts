import * as userRepository from "@/localDb/repository/userRepository";
import { deleteEatings } from "./dao/eatingDao";
import { deleteMyExercises } from "./dao/myExerciseDao";
import { deleteTrainings } from "./dao/trainingDao";
import { deleteUserGoalDao } from "./dao/userGoalDao";
import { deleteUserProfileDao } from "./dao/userProfileDao";

// ローカルDB（ユーザーに紐づく情報）の削除
export const clearLocalDb = async () => {
  console.log(
    "========== ローカルDBデータクリア開始（マスタは除く） =========="
  );
  try {
    // ユーザー情報削除
    await userRepository.deleteUser();
    console.log("ユーザーデータクリア完了");
  } catch (error) {}
  await deleteUserProfileDao();
  await deleteUserGoalDao();
  await deleteEatings();
  await deleteTrainings();
  await deleteMyExercises();
};

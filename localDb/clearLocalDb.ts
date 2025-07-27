import { deleteTrainingDao } from "./dao/trainingDao";
import { deleteUserDao } from "./dao/userDao";
import { deleteUserGoalDao } from "./dao/userGoalDao";
import { deleteUserProfileDao } from "./dao/userProfileDao";

// ローカルDB（ユーザーに紐づく情報）の削除
export const clearLocalDb = async () => {
  await deleteUserDao();
  await deleteUserProfileDao();
  await deleteUserGoalDao();
};

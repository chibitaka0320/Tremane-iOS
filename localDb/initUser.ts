import { apiRequestWithRefreshNew } from "@/lib/apiClient";
import { db } from "@/lib/localDbConfig";
import { User, UserProfile } from "@/types/localDb";
import {
  getLatestUserProfile,
  insertUserProfileDao,
} from "./dao/userProfileDao";
import { insertUserDao } from "./dao/userDao";
import { format } from "date-fns";

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

  console.log("データダウンロード完了");
};

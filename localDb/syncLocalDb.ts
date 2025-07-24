import { UserProfile } from "@/types/localDb";
import {
  getUnsyncedUserProfile,
  setUserProfileSynced,
} from "./dao/userProfileDao";
import { apiRequestWithRefreshNew } from "@/lib/apiClient";

export const syncLocalDb = async () => {
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

  console.log("データアップロード完了");
};

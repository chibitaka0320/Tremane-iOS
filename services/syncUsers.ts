import { apiRequestWithRefresh } from "@/lib/apiClient";
import { upsertUsers } from "@/lib/localDb/dao/userDao";
import { User } from "@/types/api";

export const syncUsers = async () => {
  try {
    const updates = await apiRequestWithRefresh<User>(`/users`, "GET");

    if (updates != null) {
      await upsertUsers(updates);
      console.log(`✅ ${updates}`);
    } else {
      console.log("✅ 差分なし");
    }
  } catch (e) {
    console.log(e);
  }
};

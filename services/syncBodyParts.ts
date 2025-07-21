import { apiRequest } from "@/lib/apiClient";
import {
  getLatestBodyPartUpdatedAt,
  upsertBodyParts,
} from "@/lib/localDb/dao/bodyPartDao";
import { BodyPart } from "@/types/api";

export const syncBodyParts = async () => {
  try {
    const latest = await getLatestBodyPartUpdatedAt();
    const updates = await apiRequest<BodyPart[]>(
      `/bodyparts/sync?updatedAt=${latest}`,
      "GET"
    );
    if (updates != null && updates.length > 0) {
      await upsertBodyParts(updates);
      console.log(`✅ ${updates.length} 件同期完了`);
    } else {
      console.log("✅ 差分なし");
    }
  } catch (e) {
    console.log(e);
  }
};

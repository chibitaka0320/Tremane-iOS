import { apiRequestWithRefresh } from "@/lib/apiClient";
import { getLatestTrainingUpdatedAt, upsertTrainings } from "@/dao/trainingDao";
import { Training } from "@/types/api";

export const syncTrainings = async () => {
  try {
    const latest = await getLatestTrainingUpdatedAt();
    const updates = await apiRequestWithRefresh<Training[]>(
      `/training/sync?updatedAt=${latest}`,
      "GET"
    );
    if (updates != null && updates.length > 0) {
      await upsertTrainings(updates);
      console.log(`✅ ${updates.length} 件同期完了`);
    } else {
      console.log("✅ 差分なし");
    }
  } catch (e) {
    console.log(e);
  }
};

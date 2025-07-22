import { apiRequest } from "@/lib/apiClient";
import { getLatestExerciseUpdatedAt, upsertExercises } from "@/dao/exerciseDao";
import { Exercise } from "@/types/api";

export const syncExercises = async () => {
  try {
    const latest = await getLatestExerciseUpdatedAt();
    const updates = await apiRequest<Exercise[]>(
      `/exercise?updatedAt=${latest}`,
      "GET"
    );
    if (updates != null && updates.length > 0) {
      await upsertExercises(updates);
      console.log(`✅ ${updates.length} 件同期完了`);
    } else {
      console.log("✅ 差分なし");
    }
  } catch (e) {
    console.log(e);
  }
};

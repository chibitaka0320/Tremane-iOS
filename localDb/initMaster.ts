import { apiRequestNew } from "@/lib/apiClient";
import { BodyPart } from "@/types/localDb";
import { format } from "date-fns";
import { getLatestBodyPart, insertBodyPartDao } from "./dao/bodyPartDao";

export const initMaster = async () => {
  try {
    // 部位テーブル初期化
    const latestBodyPart = await getLatestBodyPart();

    const bodyPartRes = await apiRequestNew(
      "/bodyparts/sync?updatedAt=" +
        format(latestBodyPart, "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"),
      "GET",
      null
    );

    if (bodyPartRes?.ok) {
      const bodyPart: BodyPart[] = await bodyPartRes.json();
      await insertBodyPartDao(bodyPart);
    }

    console.log("マスタデータダウンロード完了");
  } catch (error) {
    console.error(error);
  }
};

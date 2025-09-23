import * as bodyPartRepository from "@/localDb/repository/bodyPartRepository";
import * as exerciseRepository from "@/localDb/repository/exerciseRepository";
import { ApiError } from "@/lib/error";

// リモードDBからマスタデータを同期する
export const masterSyncFromRemote = async () => {
  console.log("========== マスタデータ同期開始 ==========");
  try {
    // 部位テーブル初期化
    await bodyPartRepository.syncBodyPartsFromRemte();
    console.log("部位データ同期完了");

    // 種目テーブル初期化
    await exerciseRepository.syncExercisesFromRemote();
    console.log("トレーニング種目データ同期完了");
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("APIエラー：(" + error.status + ")" + error.message);
    } else {
      console.error("マスタデータ同期エラー：" + (error as Error).message);
    }
  } finally {
    console.log("========== マスタデータ同期終了 ==========");
  }
};

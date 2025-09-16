import { migrate } from "./migration/migrate";

// ローカルDBのテーブル初期化
export async function initLocalDb() {
  await migrate();
}

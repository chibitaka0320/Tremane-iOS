import { migrate } from "./migrate";

// ローカルDBのテーブル初期化
export async function initLocalDb() {
  await migrate();
}

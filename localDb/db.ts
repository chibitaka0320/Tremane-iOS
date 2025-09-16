import { openDatabaseSync } from "expo-sqlite";

export function getDb() {
  return openDatabaseSync("tremane.db");
}

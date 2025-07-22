import { db } from "@/lib/dbConfig";

export const deleteUser = async (): Promise<void> => {
  try {
    console.log("hello");
    await db.runAsync(`DELETE FROM users`);
  } catch (e) {
    console.log(e);
  }
};

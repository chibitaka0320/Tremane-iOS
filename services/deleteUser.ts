import { db } from "@/lib/localDb/db";

export const deleteUser = async (): Promise<void> => {
  try {
    console.log("hello");
    await db.runAsync(`DELETE FROM users`);
  } catch (e) {
    console.log(e);
  }
};

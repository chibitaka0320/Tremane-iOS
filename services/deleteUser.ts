import { deleteUser } from "@/dao/userDao";

export const logoutUser = async (): Promise<void> => {
  try {
    await deleteUser();
  } catch (e) {
    console.log(e);
  }
};

import { UserProfile } from "@/types/localDb";
import { getUserProfileDao } from "../dao/userProfileDao";
import { UserInfoResponse } from "@/types/api";
import { calcAge, calcBmr, calcTotalCalorie } from "@/lib/calc";

// ユーザープロフィール画面の情報作成
export const getUserProfile = async () => {
  const data = await getUserProfileDao();
  if (data) {
    const birthday = new Date(data.birthday);
    const age = calcAge(birthday);
    const bmr = calcBmr(data.gender, data.height, data.weight, age);
    const totalCalorie = calcTotalCalorie(bmr, data.activeLevel);

    const userProfile: UserInfoResponse = {
      nickname: data.nickname,
      height: data.height,
      weight: data.weight,
      birthday,
      age,
      gender: data.gender,
      activeLevel: data.activeLevel,
      bmr,
      totalCalorie,
    };

    return userProfile;
  } else {
    return null;
  }
};

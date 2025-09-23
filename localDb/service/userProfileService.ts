import { UserInfoResponse } from "@/types/api";
import { calcAge, calcBmr, calcTotalCalorie } from "@/lib/calc";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";

// ユーザープロフィール画面の情報作成
export const getUserProfile = async () => {
  const data = await userProfileRepository.getUserProfile();
  if (data) {
    const birthday = new Date(data.birthday);
    const age = calcAge(birthday);
    const bmr = calcBmr(data.gender, data.height, data.weight, age);
    const totalCalorie = calcTotalCalorie(bmr, data.active_level);

    const userProfile: UserInfoResponse = {
      height: data.height,
      weight: data.weight,
      birthday,
      age,
      gender: data.gender,
      activeLevel: data.active_level,
      bmr,
      totalCalorie,
    };

    return userProfile;
  } else {
    return null;
  }
};

import { UserProfileEntity } from "@/types/db";
import { UserGoal } from "@/types/localDb";

// 年齢計算
export const calcAge = (birthday: Date) => {
  const year = birthday.getFullYear();
  const month = birthday.getMonth() + 1;
  const day = birthday.getDate();
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }
  return age;
};

// 基礎代謝計算
export const calcBmr = (
  gender: number,
  height: number,
  weight: number,
  age: number
) => {
  let bmr;

  if (gender === 0) {
    bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
  } else if (gender === 1) {
    bmr = 9.247 * weight + 3.098 * height - 4.33 * age + 447.593;
  } else {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }

  return Math.round(bmr);
};

// 摂取カロリー計算（１回）
export const calcKcal = (protein: number, fat: number, carbo: number) => {
  const calorie = Math.round(protein * 4 + fat * 9 + carbo * 4);
  return calorie;
};

// 総消費カロリー計算
export const calcTotalCalorie = (bmr: number, activeLevel: number) => {
  let totalCalorie;

  if (activeLevel == 0) {
    totalCalorie = bmr * 1.2;
  } else if (activeLevel == 1) {
    totalCalorie = bmr * 1.5;
  } else if (activeLevel == 2) {
    totalCalorie = bmr * 1.9;
  } else {
    totalCalorie = bmr;
  }
  return Math.round(totalCalorie);
};

// 日数計算
export const calcDiffDays = (date1: Date, date2: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  // UTCで計算することで日付またぎの誤差を防ぐ
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.abs(Math.floor((utc2 - utc1) / msPerDay));
};

// 目標摂取カロリー算出
export const calcGoalKcal = (prof: UserProfileEntity, goal: UserGoal) => {
  const age = calcAge(new Date(prof.birthday));
  const bmr = calcBmr(prof.gender, prof.height, prof.weight, age);
  const totalCalorie = calcTotalCalorie(bmr, prof.active_level);

  const lossWeight = goal.weight - goal.goalWeight;
  const diffDays = calcDiffDays(new Date(goal.start), new Date(goal.finish));
  const lossCalorie = (lossWeight * 7200) / diffDays;

  const calories = Math.round(totalCalorie - lossCalorie);

  return calories;
};

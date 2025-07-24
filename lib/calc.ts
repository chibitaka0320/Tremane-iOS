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

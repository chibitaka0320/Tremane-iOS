// メールアドレス
export function validateEmail(email: string): boolean {
  const regex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// パスワード
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// ニックネーム
export function validateNickname(nickname: string): boolean {
  return nickname.length <= 20 && nickname != "";
}

// 身長
export function validateHeight(height: string): boolean {
  return height != "" && !isNaN(parseFloat(height));
}

// 体重
export function validateWeight(weight: string): boolean {
  return weight != "" && !isNaN(parseFloat(weight));
}

// 回数
export function validateReps(reps: string): boolean {
  return reps != "" && isNaN(parseInt(reps));
}

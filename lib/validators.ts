export function validateEmail(email: string): boolean {
  const regex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// メールアドレス変更フロー専用の一時的なパスワード受け渡し。
// メールアドレス変更（Admin SDKのupdateUser）はFirebase側で発行済みトークンを
// 全て失効させるため、認証コード確認後は新しいメールアドレスで再サインインが必要になる。
// そのために画面2で入力したパスワードを、router paramsに乗せず一時的にここへ保持する。
let pendingPassword: string | null = null;

export function setPendingEmailChangePassword(password: string) {
  pendingPassword = password;
}

export function consumePendingEmailChangePassword(): string | null {
  const password = pendingPassword;
  pendingPassword = null;
  return password;
}

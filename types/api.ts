export type SignUpResponse = {
  accessToken: string;
  refreshToken: string;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ErrorType = {
  error: string;
  code?: number;
};

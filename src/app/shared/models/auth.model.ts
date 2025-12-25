export const phoneNumberRegex: RegExp = /^01[0125][0-9]{8}$/;
export const passwordRegex: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export type LoginUserRequest = {
  userNameOrEmail: string;
  password: string;
};

export type RegisterUserRequest = {
  userName: string;
  email: string;
  phone: string;
  password: string;
};

export type AuthResponse = {
  userInfo: BasicUserInfo;
  token: string;
  expiresOn: Date;
};

export type BasicUserInfo = {
  userName: string;
  displayName: string;
  email: string;
  roles: string[];
};

// Extended JWT Payload
export interface JwtPayload {
  displayName: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
}

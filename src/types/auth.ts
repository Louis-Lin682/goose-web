export type UserRole = "CUSTOMER" | "ADMIN";

export type RegisterPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
  remember: boolean;
};

export type ForgotPasswordPayload = {
  identifier: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  role: UserRole;
  isAdmin: boolean;
};

export type RegisterResponse = {
  message?: string;
  token?: string;
  user?: AuthUser;
};

export type LoginResponse = {
  message?: string;
  user?: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser | null;
};

export type LogoutResponse = {
  message?: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
  resetLink?: string;
  expiresAt?: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type AdminUserEntry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  lineUserId?: string | null;
  linePictureUrl?: string | null;
  isLineLinked?: boolean;
  role: UserRole;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersResponse = {
  users: AdminUserEntry[];
};

export type UpdateUserRolePayload = {
  role: UserRole;
};

export type UpdateUserRoleResponse = {
  message: string;
  userId: string;
  role: UserRole;
};

export type UpdateAdminUserPayload = {
  name: string;
  phone: string;
  email: string;
  address?: string | null;
};

export type UpdateAdminUserResponse = {
  message: string;
  user: AdminUserEntry;
};

export type DeleteAdminUserResponse = {
  message: string;
  userId: string;
};

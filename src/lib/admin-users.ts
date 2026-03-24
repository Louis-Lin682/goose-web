import { apiRequest } from "./api";
import type {
  DeleteAdminUserResponse,
  AdminUsersResponse,
  UpdateAdminUserPayload,
  UpdateAdminUserResponse,
  UpdateUserRolePayload,
  UpdateUserRoleResponse,
} from "../types/auth";

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  return apiRequest<AdminUsersResponse>("/admin/users");
};

export const updateUserRole = async (
  userId: string,
  payload: UpdateUserRolePayload,
): Promise<UpdateUserRoleResponse> => {
  return apiRequest<UpdateUserRoleResponse>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updateAdminUser = async (
  userId: string,
  payload: UpdateAdminUserPayload,
): Promise<UpdateAdminUserResponse> => {
  return apiRequest<UpdateAdminUserResponse>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteAdminUser = async (
  userId: string,
): Promise<DeleteAdminUserResponse> => {
  return apiRequest<DeleteAdminUserResponse>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
};

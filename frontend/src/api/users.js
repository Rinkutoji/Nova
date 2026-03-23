// src/api/users.js
import api from "./client";

export const usersApi = {
  updateProfile: (data) => api.patch("/api/users/profile", data),
  changePassword:(data) => api.patch("/api/users/password", data),
  deleteAccount: ()     => api.delete("/api/users/account"),
};

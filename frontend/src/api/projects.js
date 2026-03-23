// src/api/projects.js
import api from "./client";

export const projectsApi = {
  list:         ()           => api.get("/api/projects"),
  create:       (data)       => api.post("/api/projects", data),
  update:       (id, data)   => api.put(`/api/projects/${id}`, data),
  patchStatus:  (id, status) => api.patch(`/api/projects/${id}/status`, { status }),
  remove:       (id)         => api.delete(`/api/projects/${id}`),
};

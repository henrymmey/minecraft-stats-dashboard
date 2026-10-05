import { apiFetch } from "./client";
import type { AdminMe } from "./types";

export const authApi = {
  me: () => apiFetch<AdminMe>("/api/v1/admin/me"),
};

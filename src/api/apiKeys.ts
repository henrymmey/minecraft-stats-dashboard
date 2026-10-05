import { apiFetch } from "./client";
import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from "./types";

export const apiKeysApi = {
  list: async () => {
    const response = await apiFetch<{ data: ApiKey[] }>("/api/v1/admin/api-keys");
    return response.data;
  },

  create: (payload: CreateApiKeyRequest) =>
    apiFetch<CreateApiKeyResponse>("/api/v1/admin/api-keys", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: CreateApiKeyRequest) =>
    apiFetch<{ data: ApiKey }>("/api/v1/admin/api-keys/" + id, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  revoke: (id: string) =>
    apiFetch<null>("/api/v1/admin/api-keys/" + id + "/revoke", { method: "POST" }),

  rotate: (id: string) =>
    apiFetch<CreateApiKeyResponse>("/api/v1/admin/api-keys/" + id + "/rotate", { method: "POST" }),
};

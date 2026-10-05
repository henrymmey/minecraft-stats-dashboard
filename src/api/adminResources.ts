import { apiFetch } from "./client";

export type AdminPlayer = {
  id: string;
  minecraft_uuid: string;
  current_username: string;
  public: boolean;
  last_seen_at: string;
};

export type AdminServer = {
  id: string;
  name: string;
  hostname: string;
  port: number;
  display_name: string;
  enabled: boolean;
};

export type AdminSeason = {
  id: string;
  name: string;
  slug: string;
  started_at: string | null;
  ended_at: string | null;
  active: boolean;
};

export type CreateServerRequest = {
  name: string;
  display_name: string;
  hostname: string;
  port: number;
  enabled?: boolean;
};

export type CreateSeasonRequest = {
  name: string;
  slug: string;
  started_at?: string | null;
  ended_at?: string | null;
  active?: boolean;
};

export const adminResourcesApi = {
  players: async () =>
    (await apiFetch<{ data: AdminPlayer[] }>("/api/v1/admin/players")).data,

  servers: async () =>
    (await apiFetch<{ data: AdminServer[] }>("/api/v1/admin/servers")).data,

  createServer: (payload: CreateServerRequest) =>
    apiFetch<{ data: AdminServer }>("/api/v1/admin/servers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateServer: (id: string, payload: CreateServerRequest) =>
    apiFetch<{ data: AdminServer }>("/api/v1/admin/servers/" + id, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  seasons: async () =>
    (await apiFetch<{ data: AdminSeason[] }>("/api/v1/admin/seasons")).data,

  createSeason: (payload: CreateSeasonRequest) =>
    apiFetch<{ data: AdminSeason }>("/api/v1/admin/seasons", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  activateSeason: (id: string) =>
    apiFetch<{ data: AdminSeason }>("/api/v1/admin/seasons/" + id + "/activate", {
      method: "POST",
    }),
};

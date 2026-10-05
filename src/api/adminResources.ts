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

export const adminResourcesApi = {
  players: async () => (await apiFetch<{ data: AdminPlayer[] }>("/api/v1/admin/players")).data,
  servers: async () => (await apiFetch<{ data: AdminServer[] }>("/api/v1/admin/servers")).data,
  seasons: async () => (await apiFetch<{ data: AdminSeason[] }>("/api/v1/admin/seasons")).data,
};

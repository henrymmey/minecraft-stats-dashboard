export type ApiKeyType = "client" | "website" | "integration";

export type ApiKey = {
  id: string;
  name: string;
  type: ApiKeyType;
  prefix: string;
  description: string | null;
  enabled: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
  scopes: string[];
  uuid_restrictions: string[];
  server_restrictions: string[];
  season_restrictions: string[];
};

export type CreateApiKeyRequest = {
  name: string;
  type: ApiKeyType;
  description?: string | null;
  scopes: string[];
  uuid_restrictions?: string[];
  server_restrictions?: string[];
  season_restrictions?: string[];
  expires_at?: string | null;
};

export type CreateApiKeyResponse = {
  data: ApiKey;
  secret: string;
};

export type AdminMe = {
  id: string;
  display_name: string;
  email: string | null;
  workspace_id: string;
  role: "owner" | "admin";
};

import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "../api/apiKeys";
import { ApiError } from "../api/client";
import { adminResourcesApi } from "../api/adminResources";
import type { ApiKey, ApiKeyType } from "../api/types";

const scopes = [
  "ingest:write",
  "players:read",
  "stats:read",
  "events:read",
  "sessions:read",
  "leaderboards:read",
  "presence:read",
];

const defaultScopes: Record<ApiKeyType, string[]> = {
  client: ["ingest:write"],
  website: ["players:read", "stats:read", "leaderboards:read", "presence:read"],
  integration: ["players:read", "stats:read"],
};

export function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ApiKey | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<ApiKeyType>("client");
  const [selectedScopes, setSelectedScopes] = useState(defaultScopes.client);
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidText, setUuidText] = useState("");
  const [servers, setServers] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keys = useQuery({ queryKey: ["api-keys"], queryFn: apiKeysApi.list });
  const playerQuery = useQuery({ queryKey: ["admin-players"], queryFn: adminResourcesApi.players });
  const serverQuery = useQuery({ queryKey: ["admin-servers"], queryFn: adminResourcesApi.servers });
  const seasonQuery = useQuery({ queryKey: ["admin-seasons"], queryFn: adminResourcesApi.seasons });

  const create = useMutation({
    mutationFn: () => apiKeysApi.create({
      name: name.trim(),
      type,
      scopes: selectedScopes,
      uuid_restrictions: mergeUuids(),
      server_restrictions: servers,
      season_restrictions: seasons,
    }),
    onSuccess: (result) => {
      setSecret(result.secret);
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: showError,
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No API key selected.");
      return apiKeysApi.update(editing.id, {
        name: name.trim(),
        type: editing.type,
        scopes: selectedScopes,
        uuid_restrictions: mergeUuids(),
        server_restrictions: servers,
        season_restrictions: seasons,
      });
    },
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: showError,
  });

  const rotate = useMutation({
    mutationFn: apiKeysApi.rotate,
    onSuccess: (result) => {
      setSecret(result.secret);
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: showError,
  });

  const revoke = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  function beginEdit(key: ApiKey) {
    setEditing(key);
    setName(key.name);
    setType(key.type);
    setSelectedScopes(key.scopes);
    setUuids(key.uuid_restrictions);
    setUuidText(key.uuid_restrictions.join("\n"));
    setServers(key.server_restrictions);
    setSeasons(key.season_restrictions);
    setError(null);
  }

  function showError(cause: unknown) {
    setError(
      cause instanceof ApiError
        ? cause.message + (cause.requestId ? " (request " + cause.requestId + ")" : "")
        : "The API key operation failed.",
    );
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setType("client");
    setSelectedScopes(defaultScopes.client);
    setUuids([]);
    setUuidText("");
    setServers([]);
    setSeasons([]);
    setError(null);
  }

  function setKeyType(next: ApiKeyType) {
    setType(next);
    setSelectedScopes(defaultScopes[next]);
  }

  function toggle(values: string[], value: string, setter: (next: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function mergeUuids(): string[] {
    const manual = uuidText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    return [...new Set([...uuids, ...manual])];
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("A name is required.");
      return;
    }

    if (selectedScopes.length === 0) {
      setError("Select at least one scope.");
      return;
    }

    if (editing) update.mutate();
    else create.mutate();
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Administration</p>
        <h1>API Keys</h1>
      </header>

      {secret && (
        <section className="secret-card">
          <strong>API key secret — save it now</strong>
          <p>This secret will not be shown again.</p>
          <code>{secret}</code>
          <div className="actions">
            <button type="button" onClick={() => void navigator.clipboard.writeText(secret)}>Copy</button>
            <button type="button" onClick={() => setSecret(null)}>Close</button>
          </div>
        </section>
      )}

      <section className="page-card">
        <form className="key-form" onSubmit={submit}>
          <div className="form-heading">
            <strong>{editing ? "Edit API key" : "Create API key"}</strong>
            {editing && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>

          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="HMT Minecraft Clients" />
          </label>

          <label>
            Type
            <select value={type} disabled={Boolean(editing)} onChange={(event) => setKeyType(event.target.value as ApiKeyType)}>
              <option value="client">Client</option>
              <option value="website">Website</option>
              <option value="integration">Integration</option>
            </select>
          </label>

          <fieldset>
            <legend>Scopes</legend>
            <div className="checkbox-grid">
              {scopes.map((scope) => (
                <label className="checkbox-row" key={scope}>
                  <input type="checkbox" checked={selectedScopes.includes(scope)} onChange={() => toggle(selectedScopes, scope, setSelectedScopes)} />
                  <span>{scope}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Minecraft UUID restrictions</legend>
            <p className="scope-preview">Empty means every player. UUIDs can be entered before the player has ever connected.</p>
            <label>
              UUIDs (one per line)
              <textarea
                rows={5}
                value={uuidText}
                onChange={(event) => setUuidText(event.target.value)}
                placeholder={"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee\nffffffff-1111-2222-3333-444444444444"}
              />
            </label>
            {playerQuery.data && playerQuery.data.length > 0 && (
              <div className="checkbox-grid">
                {playerQuery.data.map((player) => (
                  <label className="checkbox-row" key={player.id}>
                    <input
                      type="checkbox"
                      checked={uuids.includes(player.minecraft_uuid)}
                      onChange={() => toggle(uuids, player.minecraft_uuid, setUuids)}
                    />
                    <span>{player.current_username} <small>{player.minecraft_uuid}</small></span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Server restrictions</legend>
            <p className="scope-preview">Empty means every registered server.</p>
            <div className="checkbox-grid">
              {serverQuery.data?.map((server) => (
                <label className="checkbox-row" key={server.id}>
                  <input type="checkbox" checked={servers.includes(server.id)} onChange={() => toggle(servers, server.id, setServers)} />
                  <span>{server.display_name} <small>{server.hostname}:{server.port}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Season restrictions</legend>
            <p className="scope-preview">Empty means every season.</p>
            <div className="checkbox-grid">
              {seasonQuery.data?.map((season) => (
                <label className="checkbox-row" key={season.id}>
                  <input type="checkbox" checked={seasons.includes(season.id)} onChange={() => toggle(seasons, season.id, setSeasons)} />
                  <span>{season.name} <small>{season.slug}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <button disabled={create.isPending || update.isPending} type="submit">
            {editing ? (update.isPending ? "Saving…" : "Save changes") : (create.isPending ? "Creating…" : "Create API key")}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="page-card">
        {keys.isPending ? <p>Loading keys…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Restrictions</th><th>Last used</th><th /></tr></thead>
              <tbody>
                {keys.data?.map((key) => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td>{key.type}</td>
                    <td>{key.revoked_at ? "Revoked" : key.enabled ? "Active" : "Disabled"}</td>
                    <td>{key.uuid_restrictions.length} UUID · {key.server_restrictions.length} server · {key.season_restrictions.length} season</td>
                    <td>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}</td>
                    <td>
                      {!key.revoked_at && (
                        <div className="actions">
                          <button type="button" onClick={() => beginEdit(key)}>Edit</button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Rotate " + key.name + "? The current key will be revoked.")) {
                                rotate.mutate(key.id);
                              }
                            }}
                          >
                            Rotate
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Revoke " + key.name + "?")) revoke.mutate(key.id);
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

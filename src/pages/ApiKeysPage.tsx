import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "../api/apiKeys";
import { ApiError } from "../api/client";
import { adminResourcesApi } from "../api/adminResources";
import type { ApiKeyType } from "../api/types";

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
  const [name, setName] = useState("");
  const [type, setType] = useState<ApiKeyType>("client");
  const [selectedScopes, setSelectedScopes] = useState(defaultScopes.client);
  const [players, setPlayers] = useState<string[]>([]);
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
      player_restrictions: players,
      server_restrictions: servers,
      season_restrictions: seasons,
    }),
    onSuccess: (result) => {
      setSecret(result.secret);
      setName("");
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (cause) => {
      setError(
        cause instanceof ApiError
          ? cause.message + (cause.requestId ? " (request " + cause.requestId + ")" : "")
          : "Unable to create the API key.",
      );
    },
  });

  const revoke = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  function setKeyType(next: ApiKeyType) {
    setType(next);
    setSelectedScopes(defaultScopes[next]);
  }

  function toggle(values: string[], value: string, setter: (next: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
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

    create.mutate();
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Administration</p>
        <h1>API Keys</h1>
      </header>

      {secret && (
        <section className="secret-card">
          <strong>New API key — save it now</strong>
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
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="HMT Minecraft Clients" />
          </label>

          <label>
            Type
            <select value={type} onChange={(event) => setKeyType(event.target.value as ApiKeyType)}>
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
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope)}
                    onChange={() => toggle(selectedScopes, scope, setSelectedScopes)}
                  />
                  <span>{scope}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Player restrictions</legend>
            <p className="scope-preview">Leave empty to allow all players in the workspace.</p>
            <div className="checkbox-grid">
              {playerQuery.data?.map((player) => (
                <label className="checkbox-row" key={player.id}>
                  <input
                    type="checkbox"
                    checked={players.includes(player.id)}
                    onChange={() => toggle(players, player.id, setPlayers)}
                  />
                  <span>{player.current_username} <small>{player.minecraft_uuid}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Server restrictions</legend>
            <p className="scope-preview">Leave empty to allow all registered servers.</p>
            <div className="checkbox-grid">
              {serverQuery.data?.map((server) => (
                <label className="checkbox-row" key={server.id}>
                  <input
                    type="checkbox"
                    checked={servers.includes(server.id)}
                    onChange={() => toggle(servers, server.id, setServers)}
                  />
                  <span>{server.display_name} <small>{server.hostname}:{server.port}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Season restrictions</legend>
            <p className="scope-preview">Leave empty to allow all seasons.</p>
            <div className="checkbox-grid">
              {seasonQuery.data?.map((season) => (
                <label className="checkbox-row" key={season.id}>
                  <input
                    type="checkbox"
                    checked={seasons.includes(season.id)}
                    onChange={() => toggle(seasons, season.id, setSeasons)}
                  />
                  <span>{season.name} <small>{season.slug}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <button disabled={create.isPending} type="submit">
            {create.isPending ? "Creating…" : "Create API key"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="page-card">
        {keys.isPending ? <p>Loading keys…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Prefix</th><th>Restrictions</th><th>Last used</th><th /></tr></thead>
              <tbody>
                {keys.data?.map((key) => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td>{key.type}</td>
                    <td>{key.revoked_at ? "Revoked" : key.enabled ? "Active" : "Disabled"}</td>
                    <td><code>{key.prefix}</code></td>
                    <td>
                      {key.player_restrictions.length} player · {key.server_restrictions.length} server · {key.season_restrictions.length} season
                    </td>
                    <td>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}</td>
                    <td>
                      {!key.revoked_at && (
                        <button type="button" onClick={() => {
                          if (window.confirm("Revoke " + key.name + "?")) revoke.mutate(key.id);
                        }}>
                          Revoke
                        </button>
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

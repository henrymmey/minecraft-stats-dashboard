import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "../api/apiKeys";
import type { ApiKeyType } from "../api/types";
import { ApiError } from "../api/client";

const defaultScopes: Record<ApiKeyType, string[]> = {
  client: ["ingest:write"],
  website: ["players:read", "stats:read", "leaderboards:read", "presence:read"],
  integration: ["players:read", "stats:read"],
};

export function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ApiKeyType>("client");
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keys = useQuery({ queryKey: ["api-keys"], queryFn: apiKeysApi.list });

  const create = useMutation({
    mutationFn: () => apiKeysApi.create({
      name: name.trim(),
      type,
      scopes: defaultScopes[type],
    }),
    onSuccess: (result) => {
      setSecret(result.secret);
      setName("");
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (cause) => {
      setError(cause instanceof ApiError
        ? cause.message + (cause.requestId ? " (request " + cause.requestId + ")" : "")
        : "Unable to create the API key.");
    },
  });

  const revoke = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("A name is required.");
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
            <select value={type} onChange={(event) => setType(event.target.value as ApiKeyType)}>
              <option value="client">Client</option>
              <option value="website">Website</option>
              <option value="integration">Integration</option>
            </select>
          </label>
          <p className="scope-preview">Default scopes: {defaultScopes[type].join(", ")}</p>
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
              <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Prefix</th><th>Last used</th><th /></tr></thead>
              <tbody>
                {keys.data?.map((key) => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td>{key.type}</td>
                    <td>{key.revoked_at ? "Revoked" : key.enabled ? "Active" : "Disabled"}</td>
                    <td><code>{key.prefix}</code></td>
                    <td>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}</td>
                    <td>
                      {!key.revoked_at && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Revoke " + key.name + "?")) revoke.mutate(key.id);
                          }}
                        >
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

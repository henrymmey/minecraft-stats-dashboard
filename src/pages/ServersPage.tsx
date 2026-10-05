import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminResourcesApi } from "../api/adminResources";

export function ServersPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("25565");
  const [error, setError] = useState<string | null>(null);

  const servers = useQuery({ queryKey: ["admin-servers"], queryFn: adminResourcesApi.servers });

  const create = useMutation({
    mutationFn: () => adminResourcesApi.createServer({
      name: name.trim(),
      display_name: displayName.trim(),
      hostname: hostname.trim(),
      port: Number(port),
    }),
    onSuccess: () => {
      setName("");
      setDisplayName("");
      setHostname("");
      setPort("25565");
      void queryClient.invalidateQueries({ queryKey: ["admin-servers"] });
    },
    onError: () => setError("Unable to create the server."),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !displayName.trim() || !hostname.trim() || !port) {
      setError("Name, display name, hostname and port are required.");
      return;
    }
    create.mutate();
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Workspace</p>
        <h1>Servers</h1>
      </header>

      <section className="page-card">
        <form className="key-form" onSubmit={submit}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="craftattack" /></label>
          <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="CraftAttack" /></label>
          <label>Hostname<input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="play.example.net" /></label>
          <label>Port<input type="number" min="1" max="65535" value={port} onChange={(e) => setPort(e.target.value)} /></label>
          {error && <p className="error-text">{error}</p>}
          <button disabled={create.isPending} type="submit">{create.isPending ? "Creating…" : "Register server"}</button>
        </form>
      </section>

      <section className="page-card">
        {servers.isPending ? <p>Loading servers…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Address</th><th>Status</th></tr></thead>
              <tbody>
                {servers.data?.map((server) => (
                  <tr key={server.id}>
                    <td>{server.display_name}</td>
                    <td><code>{server.hostname}:{server.port}</code></td>
                    <td>{server.enabled ? "Enabled" : "Disabled"}</td>
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

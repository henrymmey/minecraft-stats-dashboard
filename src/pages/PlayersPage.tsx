import { useQuery } from "@tanstack/react-query";
import { adminResourcesApi } from "../api/adminResources";

export function PlayersPage() {
  const players = useQuery({
    queryKey: ["admin-players"],
    queryFn: adminResourcesApi.players,
  });

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Workspace</p>
        <h1>Players</h1>
      </header>
      <section className="page-card">
        {players.isPending ? (
          <p>Loading players…</p>
        ) : players.isError ? (
          <p className="error-text">Unable to load players.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Username</th><th>Minecraft UUID</th><th>Last seen</th><th>Public</th></tr>
              </thead>
              <tbody>
                {players.data?.map((player) => (
                  <tr key={player.id}>
                    <td>{player.current_username}</td>
                    <td><code>{player.minecraft_uuid}</code></td>
                    <td>{new Date(player.last_seen_at).toLocaleString()}</td>
                    <td>{player.public ? "Yes" : "No"}</td>
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

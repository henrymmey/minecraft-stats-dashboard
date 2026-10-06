import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export function OverviewPage() {
  const query = useQuery({ queryKey: ["admin-me"], queryFn: authApi.me });

  const authError = new URLSearchParams(window.location.search).get("auth") === "error";

  if (query.isPending) return <section className="page-card">Loading account…</section>;
  if (query.isError && authError) {
    return (
      <section className="page-card">
        <h2>Administrator sign-in failed</h2>
        <p>The OIDC login could not be completed. Check the server log for the exact provider error.</p>
        <p><code>docker compose logs --tail=100 api</code></p>
      </section>
    );
  }
  if (query.isError) return <section className="page-card">Unable to load the current account.</section>;

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Administration</p>
        <h1>Overview</h1>
      </header>
      <section className="stats-grid">
        <div className="stat-card">
          <span>Signed in as</span>
          <strong>{query.data.display_name}</strong>
          <small>{query.data.email ?? "No email claim"}</small>
        </div>
        <div className="stat-card">
          <span>Workspace role</span>
          <strong>{query.data.role}</strong>
          <small>{query.data.workspace_id}</small>
        </div>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export function OverviewPage() {
  const query = useQuery({ queryKey: ["admin-me"], queryFn: authApi.me });

  if (query.isPending) return <section className="page-card">Loading account…</section>;
  if (query.isError) return <section className="page-card">Unable to load the current account.</section>;

  if (query.data.needs_bootstrap) {
    return (
      <>
        <header className="page-header">
          <p className="eyebrow">First-run setup</p>
          <h1>Initialize your workspace</h1>
        </header>
        <section className="page-card">
          <p>You are authenticated, but no workspace exists yet.</p>
          <Link className="button-link" to="/setup">Open setup</Link>
        </section>
      </>
    );
  }

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

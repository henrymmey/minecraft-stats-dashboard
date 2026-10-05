import { Link, Navigate, Route, Routes } from "react-router-dom";

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Minecraft Stats</div>
        <nav>
          <Link to="/">Overview</Link>
          <Link to="/players">Players</Link>
          <Link to="/statistics">Statistics</Link>
          <Link to="/sessions">Sessions</Link>
          <Link to="/events">Events</Link>
          <Link to="/leaderboards">Leaderboards</Link>
          <Link to="/api-keys">API Keys</Link>
          <Link to="/servers">Servers</Link>
          <Link to="/seasons">Seasons</Link>
          <Link to="/users">Admins</Link>
          <Link to="/audit-log">Audit Log</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Page title="Overview" />} />
          <Route path="/players" element={<Page title="Players" />} />
          <Route path="/statistics" element={<Page title="Statistics" />} />
          <Route path="/sessions" element={<Page title="Sessions" />} />
          <Route path="/events" element={<Page title="Events" />} />
          <Route path="/leaderboards" element={<Page title="Leaderboards" />} />
          <Route path="/api-keys" element={<Page title="API Keys" />} />
          <Route path="/servers" element={<Page title="Servers" />} />
          <Route path="/seasons" element={<Page title="Seasons" />} />
          <Route path="/users" element={<Page title="Admins" />} />
          <Route path="/audit-log" element={<Page title="Audit Log" />} />
          <Route path="/settings" element={<Page title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Page({ title }: { title: string }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>{title}</h1>
        </div>
      </header>
      <section className="page-card">
        <p>This section is wired into the shared dashboard shell. API-backed content comes next.</p>
      </section>
    </>
  );
}

export function App() {
  return <Layout />;
}

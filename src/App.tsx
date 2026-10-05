import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SetupPage } from "./pages/SetupPage";

const placeholders: Record<string, string> = {
  "/players": "Players",
  "/statistics": "Statistics",
  "/sessions": "Sessions",
  "/events": "Events",
  "/leaderboards": "Leaderboards",
  "/servers": "Servers",
  "/seasons": "Seasons",
  "/users": "Admins",
  "/audit-log": "Audit Log",
  "/settings": "Settings",
};

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
          <Route path="/" element={<OverviewPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
          {Object.entries(placeholders).map(([path, title]) => (
            <Route key={path} path={path} element={<Placeholder title={title} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Administration</p>
        <h1>{title}</h1>
      </header>
      <section className="page-card">
        <p>This section is planned and will use the shared typed API layer.</p>
      </section>
    </>
  );
}

export function App() {
  return <Layout />;
}

import type { FormEvent } from "react";
import { useState } from "react";
import { apiFetch, ApiError } from "../api/client";

export function SetupPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await apiFetch("/api/v1/setup/bootstrap", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setDone(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message + (cause.requestId ? " (request " + cause.requestId + ")" : "")
          : "Bootstrap failed.",
      );
    }
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">First-run setup</p>
        <h1>Create workspace</h1>
      </header>
      <section className="page-card">
        {done ? (
          <>
            <h2>Workspace initialized</h2>
            <p>Your OIDC account is now the workspace owner.</p>
            <a className="button-link" href="/">Continue to dashboard</a>
          </>
        ) : (
          <form className="key-form" onSubmit={submit}>
            <label>
              Bootstrap token
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="mst_bootstrap_..."
                autoComplete="off"
              />
            </label>
            <p className="scope-preview">
              Generate this one-time token on the server with <code>php artisan stats:bootstrap-token</code>.
            </p>
            {error && <p className="error-text">{error}</p>}
            <button disabled={!token || done} type="submit">Initialize workspace</button>
          </form>
        )}
      </section>
    </>
  );
}

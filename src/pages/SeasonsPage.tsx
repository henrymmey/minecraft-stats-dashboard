import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminResourcesApi } from "../api/adminResources";

export function SeasonsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const seasons = useQuery({ queryKey: ["admin-seasons"], queryFn: adminResourcesApi.seasons });

  const create = useMutation({
    mutationFn: () => adminResourcesApi.createSeason({
      name: name.trim(),
      slug: slug.trim(),
      active,
    }),
    onSuccess: () => {
      setName("");
      setSlug("");
      setActive(true);
      void queryClient.invalidateQueries({ queryKey: ["admin-seasons"] });
    },
    onError: () => setError("Unable to create the season."),
  });

  const activate = useMutation({
    mutationFn: adminResourcesApi.activateSeason,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-seasons"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    create.mutate();
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Workspace</p>
        <h1>Seasons</h1>
      </header>

      <section className="page-card">
        <form className="key-form" onSubmit={submit}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="CraftAttack 14" /></label>
          <label>Slug<input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="craftattack-14" /></label>
          <label className="checkbox-row">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>Activate immediately</span>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button disabled={create.isPending} type="submit">{create.isPending ? "Creating…" : "Create season"}</button>
        </form>
      </section>

      <section className="page-card">
        {seasons.isPending ? <p>Loading seasons…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Slug</th><th>Status</th><th /></tr></thead>
              <tbody>
                {seasons.data?.map((season) => (
                  <tr key={season.id}>
                    <td>{season.name}</td>
                    <td><code>{season.slug}</code></td>
                    <td>{season.active ? "Active" : "Inactive"}</td>
                    <td>
                      {!season.active && (
                        <button type="button" onClick={() => activate.mutate(season.id)}>Activate</button>
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

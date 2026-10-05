# Dashboard Architecture

## Separation of concerns

The dashboard is a thin administrative UI.

```
React page
  |
  v
domain API hook
  |
  v
typed API client
  |
  v
Laravel REST API
  |
  v
PostgreSQL
```

## Directory layout

```
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── apiKeys.ts
│   ├── players.ts
│   ├── statistics.ts
│   ├── sessions.ts
│   ├── events.ts
│   ├── servers.ts
│   ├── seasons.ts
│   └── audit.ts
├── auth/
├── components/
├── layouts/
├── pages/
├── routes/
├── hooks/
├── types/
└── lib/
```

## Data fetching

TanStack Query manages server state.

Do not create a second global cache containing copies of the entire API.

## API types

The OpenAPI contract from the docs repository is the source for generated TypeScript types.

Avoid hand-maintaining request/response interfaces when a schema can be generated.

## OIDC flow

1. Browser opens server login endpoint.
2. Server redirects to OIDC provider.
3. Provider authenticates the admin.
4. Server validates the callback.
5. Server establishes a secure browser session.
6. Dashboard requests `/api/v1/admin/me` to load the current user.

## Route protection

Unauthenticated users are redirected to login.

UI visibility may be role-aware, but the server remains the final authorization boundary.

## UI

The dashboard should prioritize fast administrative workflows:

- searchable players
- filterable API keys
- obvious scope/restriction chips
- one-time key reveal on creation
- destructive actions require confirmation
- audit trail links on sensitive objects

## Error handling

Display stable API error codes as human-readable messages while preserving the request ID for support.

## Testing

- Vitest for components and data transforms
- Playwright for login/navigation/API integration flows
- Accessibility checks for key workflows

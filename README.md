# Minecraft Stats Dashboard

Administrative web interface for Minecraft Stats Server.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Recharts
- Vitest
- Playwright

## Responsibilities

The dashboard owns presentation and interaction only.

The Laravel server remains the source of truth for:

- authentication
- authorization
- API keys
- players
- statistics
- servers
- seasons
- audit logs

## Authentication

The dashboard starts OIDC login through the server. It must not implement password authentication itself.

The server maintains the authenticated browser session using secure HttpOnly cookies.

## API access

Admin requests use the server-side session. Do not embed website API keys or admin tokens into the JavaScript bundle.

## Planned navigation

- Overview
- Players
- Statistics
- Sessions
- Events
- Leaderboards
- API Keys
- Servers
- Seasons
- Admins
- Audit Log
- Settings

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Related projects

- Client: https://github.com/henrymmey/minecraft-stats-client
- Server: https://github.com/henrymmey/minecraft-stats-server
- Documentation: https://github.com/henrymmey/minecraft-stats-docs

## License

MIT.
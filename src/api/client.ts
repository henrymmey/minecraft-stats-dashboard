export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string | null = null,
    public readonly requestId: string | null = null,
  ) {
    super(message);
  }
}

function csrfToken(): string | undefined {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("XSRF-TOKEN="));

  return cookie ? decodeURIComponent(cookie.slice("XSRF-TOKEN=".length)) : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken() ? { "X-XSRF-TOKEN": csrfToken() as string } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    window.location.assign("/auth/login");
    throw new ApiError("Authentication required.", 401);
  }

  const body = (await readJson(response)) as {
    error?: { code?: string; message?: string; request_id?: string };
  } | null;

  if (!response.ok) {
    throw new ApiError(
      body?.error?.message ?? "The request failed.",
      response.status,
      body?.error?.code ?? null,
      body?.error?.request_id ?? response.headers.get("X-Request-ID"),
    );
  }

  return body as T;
}

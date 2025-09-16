// src/api/client.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  signal?: AbortSignal;
}

// Keep this simple to avoid env typing issues.
// TODO: wire to Expo extra if you want: Constants.expoConfig?.extra?.apiUrl
const BASE_URL = "http://localhost:5000";

export class HttpError<T = unknown> extends Error {
  status: number;
  data?: T;
  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

async function request<TResponse = unknown, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", headers, body, signal } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const msg =
      (parsed as any)?.error ||
      (parsed as any)?.message ||
      `HTTP ${res.status}`;
    throw new HttpError(msg, res.status, parsed);
  }

  return parsed as TResponse;
}

export const api = {
  get: <TResponse>(path: string, opt?: Omit<RequestOptions, "body">) =>
    request<TResponse>(path, { ...(opt ?? {}), method: "GET" }),
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    opt?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...(opt ?? {}), method: "POST", body }),
};

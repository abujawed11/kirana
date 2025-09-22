// src/api/client.ts
import * as SecureStore from 'expo-secure-store';

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  signal?: AbortSignal;
  requiresAuth?: boolean;
}

// Keep this simple to avoid env typing issues.
// TODO: wire to Expo extra if you want: Constants.expoConfig?.extra?.apiUrl
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.20.2.78:5000";

// Token storage keys
const STORAGE_TOKEN_KEY = "auth_token";
const STORAGE_TOKEN_EXPIRY_KEY = "auth_token_expiry";

// Token utilities
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_TOKEN_KEY);
    if (!token) return null;

    // Check if token is expired
    const expiryStr = await SecureStore.getItemAsync(STORAGE_TOKEN_EXPIRY_KEY);
    if (expiryStr) {
      const expiry = new Date(expiryStr);
      if (new Date() >= expiry) {
        // Token expired, clear it
        await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY).catch(() => {});
        await SecureStore.deleteItemAsync(STORAGE_TOKEN_EXPIRY_KEY).catch(() => {});
        return null;
      }
    }

    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

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
  const { method = "GET", headers, body, signal, requiresAuth = true } = options;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers ?? {}),
  };

  // Auto-inject auth token for protected routes
  if (requiresAuth && !path.includes('/auth/')) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else {
      // No token available for protected route
      throw new HttpError("Authentication required", 401);
    }
  }

  // Manual auth for specific routes that need it
  if (requiresAuth && (path.includes('/logout') || path.includes('/profile'))) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
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

    // Handle 401 responses by triggering logout
    if (res.status === 401 && path !== '/auth/login') {
      // Clear stored tokens
      await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(STORAGE_TOKEN_EXPIRY_KEY).catch(() => {});

      // Let the AuthContext handle the redirect instead of doing it here
      // This avoids circular dependency and navigation issues
      console.warn('Authentication failed, token cleared. User should be redirected to login.');
    }

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
  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    opt?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...(opt ?? {}), method: "PUT", body }),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    opt?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...(opt ?? {}), method: "PATCH", body }),
  delete: <TResponse>(path: string, opt?: Omit<RequestOptions, "body">) =>
    request<TResponse>(path, { ...(opt ?? {}), method: "DELETE" }),
};

// Public API methods (no auth required)
export const publicApi = {
  get: <TResponse>(path: string, opt?: Omit<RequestOptions, "body">) =>
    request<TResponse>(path, { ...(opt ?? {}), method: "GET", requiresAuth: false }),
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    opt?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...(opt ?? {}), method: "POST", body, requiresAuth: false }),
};

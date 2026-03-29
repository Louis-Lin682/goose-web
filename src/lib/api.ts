const LOCAL_API_BASE_URL = "http://localhost:3001";

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "");

  if (typeof window === "undefined") {
    return configuredBaseUrl || "/api";
  }

  const { hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return configuredBaseUrl || LOCAL_API_BASE_URL;
  }

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (
    hostname === "www.gozoshe.com" ||
    hostname === "gozoshe.com" ||
    hostname === "api.gozoshe.com" ||
    hostname === "gozoshe-staging.vercel.app" ||
    hostname === "goose-web-seven.vercel.app" ||
    hostname.includes("staging")
  ) {
    // Use the same-origin Vercel rewrite so auth cookies stay first-party.
    return "/api";
  }

  return "/api";
};

export const API_BASE_URL = resolveApiBaseUrl();

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const resolveTimeoutMs = (path: string) => {
  if (path === "/auth/me") {
    return 30000;
  }

  if (path === "/auth/login") {
    return 25000;
  }

  return 15000;
};

const isRetryableAuthRequest = (path: string, method: string) => {
  return (
    (path === "/auth/me" && method === "GET") ||
    (path === "/auth/login" && method === "POST")
  );
};

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const method = (init.method ?? "GET").toUpperCase();
  const timeoutMs = resolveTimeoutMs(path);
  const maxAttempts = isRetryableAuthRequest(path, method) ? 2 : 1;
  const fetchHeaders = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...init.headers,
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(path), {
        credentials: "include",
        ...init,
        signal: init.signal ?? controller.signal,
        headers: fetchHeaders,
      });

      const rawBody = await response.text();
      const data = rawBody ? safeParseJson(rawBody) : null;

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data
            ? Array.isArray(data.message)
              ? data.message.join(" ")
              : typeof data.message === "string"
                ? data.message
                : `Request failed (${response.status})`
            : `Request failed (${response.status})`;

        throw new Error(message);
      }

      return data as T;
    } catch (error) {
      const isTimeoutAbort =
        error instanceof DOMException && error.name === "AbortError";
      const isNetworkError =
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch");

      if (
        attempt < maxAttempts &&
        (isTimeoutAbort || isNetworkError)
      ) {
        lastError = error;
        await wait(1200);
        continue;
      }

      if (isTimeoutAbort) {
        throw new Error("Request timeout");
      }

      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  if (lastError instanceof DOMException && lastError.name === "AbortError") {
    throw new Error("Request timeout");
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
};

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

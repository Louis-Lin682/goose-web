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

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      credentials: "include",
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

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
};

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

export const SESSION_TIMEOUT_EVENT = "goose:session-timeout";
export const SESSION_AUTH_GRACE_KEY = "goose_session_auth_grace_until";
export const SESSION_LAST_ACTIVITY_KEY = "goose_last_activity_at";
const SESSION_AUTH_GRACE_MS = 10 * 1000;

export const emitSessionTimeout = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SESSION_TIMEOUT_EVENT));
};

export const markSessionAuthenticated = () => {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, `${now}`);
  window.sessionStorage.setItem(
    SESSION_AUTH_GRACE_KEY,
    `${now + SESSION_AUTH_GRACE_MS}`,
  );
};

export const clearSessionAuthGrace = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SESSION_AUTH_GRACE_KEY);
};

export const isWithinSessionAuthGrace = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const rawValue = window.sessionStorage.getItem(SESSION_AUTH_GRACE_KEY);
  if (!rawValue) {
    return false;
  }

  const expiresAt = Number(rawValue);
  if (!Number.isFinite(expiresAt)) {
    clearSessionAuthGrace();
    return false;
  }

  if (Date.now() >= expiresAt) {
    clearSessionAuthGrace();
    return false;
  }

  return true;
};

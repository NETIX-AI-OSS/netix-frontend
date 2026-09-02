'use strict';

var Axios = require('axios');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Axios__default = /*#__PURE__*/_interopDefault(Axios);

// src/api/auth-config.ts
var TOKEN_ENDPOINT = "/auth/token/";
var REFRESH_ENDPOINT = "/auth/token/refresh/";
var VERIFY_ENDPOINT = "/auth/token/verify/";
var COOKIE_TOKEN_TTL = "300";
var COOKIE_REFRESH_TTL = "172800";
var COOKIE_SECURE = true;
function buildAuthConfig({
  baseDomain,
  authBaseUrl,
  dev = false,
  hostname = "",
  onLogin,
  onLogout
}) {
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE,
    // The bare domain covers every subdomain (RFC 6265), which is what shares the session.
    COOKIE_DOMAIN: dev ? "localhost" : baseDomain,
    LOGIN_PAGE_URL: `https://${baseDomain}/`,
    AUTH_BASE_URL: authBaseUrl,
    LAUNCHPAD_PAGE_URL: `https://launchpad.${baseDomain}/`,
    BASE_DOMAIN: dev ? "localhost" : baseDomain,
    CURRENT_APP_DOMAIN: dev ? "localhost" : hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT,
    ON_LOGIN: onLogin,
    ON_LOGOUT: onLogout
  };
}

// src/api/dev-login.ts
var OVERLAY_STYLE = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,17,21,0.55);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif";
var CARD_STYLE = "box-sizing:border-box;width:100%;max-width:320px;margin:0;padding:20px;color:#111418;background:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.28)";
var TITLE_STYLE = "margin:0 0 16px;font-size:15px;font-weight:600";
var LABEL_STYLE = "display:block;margin-bottom:4px;font-size:12px;font-weight:600;color:#4a5058";
var INPUT_STYLE = "box-sizing:border-box;width:100%;margin:0 0 12px;padding:8px 10px;font:inherit;color:#111418;background:#fff;border:1px solid #c9ced6;border-radius:6px";
var ERROR_STYLE = "margin:0 0 12px;font-size:12px;color:#b42318";
var BUTTON_STYLE = "box-sizing:border-box;width:100%;padding:9px 12px;font:inherit;font-weight:600;color:#fff;background:#1f6feb;border:0;border-radius:6px;cursor:pointer";
var createField = (doc, name, label, type, autocomplete) => {
  const id = `netix-dev-login-${name}`;
  const labelEl = doc.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelEl.setAttribute("style", LABEL_STYLE);
  const input = doc.createElement("input");
  input.id = id;
  input.name = name;
  input.type = type;
  input.required = true;
  input.setAttribute("autocomplete", autocomplete);
  input.setAttribute("style", INPUT_STYLE);
  return { labelEl, input };
};
var storeCredential = async (id, password) => {
  const ctor = globalThis.PasswordCredential;
  if (!ctor || !navigator.credentials) return;
  try {
    await navigator.credentials.store(new ctor({ id, password }));
  } catch {
  }
};
function createDevLoginPrompt({ login, onSuccess }) {
  let overlay = null;
  const close = () => {
    overlay?.remove();
    overlay = null;
  };
  const open = () => {
    const doc = globalThis.document;
    if (overlay || !doc?.body) return;
    const host = doc.createElement("div");
    host.setAttribute("style", OVERLAY_STYLE);
    const form = doc.createElement("form");
    form.method = "post";
    form.setAttribute("style", CARD_STYLE);
    const title = doc.createElement("h2");
    title.textContent = "Sign in - Development Mode";
    title.setAttribute("style", TITLE_STYLE);
    const username = createField(doc, "username", "Username", "text", "username");
    const password = createField(doc, "password", "Password", "password", "current-password");
    const error = doc.createElement("p");
    error.setAttribute("role", "alert");
    error.setAttribute("style", ERROR_STYLE);
    error.hidden = true;
    const button = doc.createElement("button");
    button.type = "submit";
    button.textContent = "Sign in";
    button.setAttribute("style", BUTTON_STYLE);
    form.append(
      title,
      username.labelEl,
      username.input,
      password.labelEl,
      password.input,
      error,
      button
    );
    host.append(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = username.input.value;
      const secret = password.input.value;
      error.hidden = true;
      button.disabled = true;
      button.textContent = "Signing in\u2026";
      void (async () => {
        let result;
        try {
          result = await login(id, secret);
        } catch {
          result = false;
        }
        if (result !== true) {
          error.textContent = "Sign-in failed \u2014 check the credentials and that staging is reachable.";
          error.hidden = false;
          button.disabled = false;
          button.textContent = "Sign in";
          password.input.select();
          return;
        }
        await storeCredential(id, secret);
        close();
        (onSuccess ?? (() => window.location.reload()))();
      })();
    });
    doc.body.append(host);
    overlay = host;
    username.input.focus();
  };
  return { open, close };
}

// src/api/predicates.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var TRANSIENT_NETWORK_MESSAGE = /Failed to fetch|^Load failed$|NetworkError when attempting to fetch|Network request failed|Network Error|ERR_CONN/i;
function isCanceledRequest(exception) {
  if (!isRecord(exception)) return false;
  if (exception.__CANCEL__ === true || exception.code === "ERR_CANCELED") return true;
  if (exception.name === "CanceledError" || exception.name === "AbortError") return true;
  if (typeof exception.message === "string" && /cancell?ed/i.test(exception.message)) return true;
  return exception.message === "Request aborted";
}
function isTransientNetworkError(exception) {
  if (!isRecord(exception)) return false;
  if (exception.code === "ERR_NETWORK") return true;
  return typeof exception.message === "string" && TRANSIENT_NETWORK_MESSAGE.test(exception.message);
}
function isCanceledOrNetworkError(exception) {
  return isCanceledRequest(exception) || isTransientNetworkError(exception);
}

// src/api/envelope.ts
var DEFAULT_FALLBACK = "Unknown error";
var ERROR_DETAIL_MARKER = `[ErrorDetail(string='`;
function stripErrorDetail(value) {
  const message = value.split(ERROR_DETAIL_MARKER)[1]?.split(`',`)[0]?.split("\\n")[0];
  if (!message) return void 0;
  const key = value.split(`{'`)[1]?.split(`'`)[0];
  return key ? `${key} : ${message}` : message;
}
function parseStringifiedArray(value) {
  try {
    return JSON.parse(value).map(String);
  } catch {
    const inner = /^\[\s*'([\s\S]*)'\s*\]$/.exec(value)?.[1];
    return inner === void 0 ? void 0 : inner.split(/',\s*'/);
  }
}
function normalizeString(value) {
  const trimmed = value.trim();
  if (trimmed === "") return [];
  if (trimmed.includes(ERROR_DETAIL_MARKER)) {
    const stripped = stripErrorDetail(trimmed);
    if (stripped) return [stripped];
  }
  if (trimmed.startsWith("[")) {
    const parsed = parseStringifiedArray(trimmed);
    if (parsed) return parsed.filter((message) => message !== "");
  }
  return [trimmed];
}
function normalizeValue(value) {
  if (value === null || value === void 0) return [];
  if (typeof value === "string") return normalizeString(value);
  if (Array.isArray(value)) return value.flatMap(normalizeValue);
  if (isRecord(value)) {
    return Object.entries(value).flatMap(
      ([key, entry]) => normalizeValue(entry).map((message) => `${key} : ${message}`)
    );
  }
  return [String(value)];
}
function parseEnvelope(data, fallback) {
  const source = isRecord(data) ? data.messages ?? data.message ?? data.detail ?? data.error : data;
  const messages = normalizeValue(source);
  return messages.length > 0 ? messages : [fallback || DEFAULT_FALLBACK];
}

// src/api/errors.ts
var ApiError = class extends Error {
  statusCode;
  messages;
  retryAfterMs;
  context;
  constructor(statusCode, messages, options = {}) {
    super(messages.join(", ") || `HTTP ${statusCode}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.messages = messages;
    this.retryAfterMs = options.retryAfterMs;
    this.context = options.context;
  }
  /** Compat alias for the pre-library `{ status }` error shape. */
  get status() {
    return this.statusCode;
  }
  /** Compat alias for the pre-library `{ errorMessage }` error shape. */
  get errorMessage() {
    return this.messages.join(", ");
  }
};
function isApiError(error) {
  return error instanceof ApiError;
}
function getErrorStatusCode(error) {
  if (isApiError(error)) return error.statusCode;
  if (!isRecord(error)) return null;
  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;
  if (error.isAxiosError === true) return 0;
  return null;
}
function isRetryableStatus(statusCode) {
  if (statusCode === null) return false;
  if (statusCode === 0 || statusCode === 408 || statusCode === 429) return true;
  return statusCode >= 500;
}

// src/api/retry-after.ts
var MAX_RETRY_AFTER_MS = 1e4;
function parseRetryAfterMs(headerValue) {
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (raw === void 0 || raw === null) return void 0;
  const value = String(raw).trim();
  if (value === "") return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
  return void 0;
}
function readRetryAfterMs(headers) {
  if (!isRecord(headers)) return void 0;
  const get = headers.get;
  const raw = typeof get === "function" ? get.call(headers, "retry-after") : headers["retry-after"] ?? headers["Retry-After"];
  return parseRetryAfterMs(raw);
}
function getErrorRetryAfterMs(error) {
  const fromApiError = isApiError(error) ? error.retryAfterMs : void 0;
  const raw = fromApiError ?? (isRecord(error) && isRecord(error.response) ? readRetryAfterMs(error.response.headers) : void 0);
  return raw === void 0 ? void 0 : Math.min(raw, MAX_RETRY_AFTER_MS);
}

// src/api/sentry.ts
var HANDLED_HTTP_STATUSES = /* @__PURE__ */ new Set([400, 403, 404]);
function asStatusCode(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 999) {
    return value;
  }
  if (typeof value === "string" && /^\d{3}$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }
  return null;
}
function extractStatusFromMessage(value) {
  if (typeof value !== "string") return null;
  const match = /status code (\d{3})/i.exec(value);
  return match ? asStatusCode(match[1]) : null;
}
function extractStatusFromEvent(event) {
  const tags = isRecord(event.tags) ? event.tags : void 0;
  const statusFromTags = asStatusCode(tags?.statusCode ?? tags?.status_code ?? tags?.http_status);
  if (statusFromTags !== null) return statusFromTags;
  const request = isRecord(event.request) ? event.request : void 0;
  const statusFromRequest = asStatusCode(request?.status_code ?? request?.statusCode);
  if (statusFromRequest !== null) return statusFromRequest;
  const contexts = isRecord(event.contexts) ? event.contexts : void 0;
  const responseContext = contexts?.response;
  if (isRecord(responseContext)) {
    const statusFromContext = asStatusCode(
      responseContext.status_code ?? responseContext.statusCode
    );
    if (statusFromContext !== null) return statusFromContext;
  }
  const exception = isRecord(event.exception) ? event.exception : void 0;
  const values = Array.isArray(exception?.values) ? exception.values : [];
  for (const value of values) {
    if (!isRecord(value)) continue;
    const statusFromException = extractStatusFromMessage(value.value);
    if (statusFromException !== null) return statusFromException;
  }
  return null;
}
function extractStatusFromHint(hint) {
  const original = hint?.originalException;
  if (!original) return null;
  const statusFromMessage = extractStatusFromMessage(original);
  if (statusFromMessage !== null) return statusFromMessage;
  if (!isRecord(original)) return null;
  const statusFromObjMessage = extractStatusFromMessage(original.message);
  if (statusFromObjMessage !== null) return statusFromObjMessage;
  const directStatus = asStatusCode(original.statusCode ?? original.status);
  if (directStatus !== null) return directStatus;
  const response = original.response;
  if (!isRecord(response)) return null;
  return asStatusCode(response.status ?? response.statusCode);
}
function extractHttpStatus(event, hint) {
  return extractStatusFromEvent(event) ?? extractStatusFromHint(hint);
}
function isHandledHttpStatus(statusCode, handled = HANDLED_HTTP_STATUSES) {
  return statusCode != null && (handled.has(statusCode) || statusCode >= 500 && statusCode <= 599);
}
function shouldCaptureHttpStatus(statusCode, handled) {
  return !isHandledHttpStatus(statusCode, handled);
}
function coerceNonErrorEvent(event, hint) {
  const original = hint?.originalException;
  if (original === null || typeof original !== "object" || original instanceof Error || Array.isArray(original)) {
    return event;
  }
  const object = original;
  const keys = Object.keys(object).sort();
  const messageField = typeof object.errorMessage === "string" && object.errorMessage || typeof object.message === "string" && object.message || typeof object.detail === "string" && object.detail || "";
  const value = messageField ? `Non-Error captured: ${messageField}` : `Non-Error captured with keys: ${keys.join(", ")}`;
  const exception = isRecord(event.exception) ? event.exception : void 0;
  const first = Array.isArray(exception?.values) ? exception.values[0] : void 0;
  if (isRecord(first)) {
    first.type = "NonError";
    first.value = value;
  } else {
    event.exception = { values: [{ type: "NonError", value }] };
  }
  const stableKeys = keys.filter((key) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key));
  event.fingerprint = ["non-error-capture", stableKeys.join(",")];
  event.extra = { ...event.extra, non_error_captured: object };
  return event;
}
function createSentryBeforeSend(options = {}) {
  const {
    handledStatuses,
    drop = [],
    dropCanceledOrNetworkErrors = true,
    dropHandledApiErrors = false,
    coerceNonErrors = true
  } = options;
  return (event, hint) => {
    if (drop.some((predicate) => predicate(event, hint))) return null;
    if (dropCanceledOrNetworkErrors && isCanceledOrNetworkError(hint?.originalException))
      return null;
    const original = hint?.originalException;
    if (dropHandledApiErrors && isApiError(original) && original.statusCode >= 400 && original.statusCode < 500) {
      return null;
    }
    if (isHandledHttpStatus(extractHttpStatus(event, hint), handledStatuses)) return null;
    return coerceNonErrors ? coerceNonErrorEvent(event, hint) : event;
  };
}
var sentryBeforeSendDropHandledHttpErrors = createSentryBeforeSend();

// src/api/error-interceptor.ts
function createErrorInterceptor(config = {}) {
  const {
    clientName,
    excludedErrorCodes = [403, 503],
    captureException,
    shouldCapture = shouldCaptureHttpStatus,
    onAuthError,
    onDisplayError,
    forbiddenMessage = "You do not have permission to perform this action",
    networkErrorMessage = "Network error occurred"
  } = config;
  const onError = (error) => {
    if (isCanceledRequest(error)) throw error;
    const response = error.response;
    const statusCode = response?.status ?? 0;
    const messages = statusCode === 0 ? [networkErrorMessage] : parseEnvelope(
      isRecord(response?.data) ? response.data : void 0,
      statusCode === 403 ? forbiddenMessage : response?.statusText
    );
    const capture = statusCode === 0 ? (
      // Transient connectivity failures are expected noise, not defects.
      !isTransientNetworkError(error)
    ) : shouldCapture(statusCode) && !excludedErrorCodes.includes(statusCode);
    if (capture) captureException?.(error, { statusCode, messages, client: clientName });
    const apiError = new ApiError(statusCode, messages, {
      retryAfterMs: readRetryAfterMs(response?.headers),
      context: clientName === void 0 ? void 0 : { client: clientName }
    });
    if (statusCode === 401) onAuthError?.(apiError);
    onDisplayError?.(apiError);
    throw apiError;
  };
  return { onSuccess: (response) => response, onError };
}

// src/api/params.ts
function encodeValue(value) {
  return encodeURIComponent(value instanceof Date ? value.toISOString() : String(value));
}
function serialize(params, joinArrays) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === null) continue;
    const encodedKey = encodeURIComponent(key);
    if (!Array.isArray(value)) {
      parts.push(`${encodedKey}=${encodeValue(value)}`);
      continue;
    }
    if (value.length === 0) continue;
    if (joinArrays) {
      parts.push(`${encodedKey}=${value.map(encodeValue).join(",")}`);
    } else {
      for (const entry of value) parts.push(`${encodedKey}=${encodeValue(entry)}`);
    }
  }
  return parts.join("&");
}
function serializeParamsRepeat(params) {
  return serialize(params, false);
}
function serializeParamsComma(params) {
  return serialize(params, true);
}
function createParamsSerializer(strategy = "default") {
  if (strategy === "default") return void 0;
  return { serialize: strategy === "comma" ? serializeParamsComma : serializeParamsRepeat };
}

// src/api/retry.ts
var MAX_RETRIES = 2;
var BASE_DELAY_MS = 300;
var MAX_BACKOFF_DELAY_MS = 3e3;
var IDEMPOTENT_METHODS = /* @__PURE__ */ new Set(["get", "head", "options"]);
var RETRYABLE_STATUSES = /* @__PURE__ */ new Set([408, 429]);
var scheduleWithTimeout = (callback, delayMs) => {
  setTimeout(callback, delayMs);
};
function isIdempotentMethod(config) {
  return IDEMPOTENT_METHODS.has((config.method || "get").toLowerCase());
}
function isRetryableAxiosError(error, retryServerErrors = false) {
  if (!error.response) return true;
  const status = error.response.status;
  return RETRYABLE_STATUSES.has(status) || retryServerErrors && status >= 500;
}
function computeBackoffDelayMs(attempt) {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_BACKOFF_DELAY_MS);
  return exponential + Math.random() * exponential * 0.5;
}
function attachRetryInterceptor(instance, options = {}) {
  const {
    maxRetries = MAX_RETRIES,
    scheduleRetry = scheduleWithTimeout,
    retryServerErrors = false
  } = options;
  instance.interceptors.response.use(void 0, (error) => {
    const config = error.config;
    if (!config || isCanceledRequest(error) || !isIdempotentMethod(config) || !isRetryableAxiosError(error, retryServerErrors)) {
      return Promise.reject(error);
    }
    const attempt = config.__retryCount ?? 0;
    if (attempt >= maxRetries) return Promise.reject(error);
    config.__retryCount = attempt + 1;
    const retryAfterMs = error.response?.status === 429 ? readRetryAfterMs(error.response.headers) : void 0;
    const delayMs = retryAfterMs === void 0 ? computeBackoffDelayMs(attempt) : Math.min(retryAfterMs, MAX_RETRY_AFTER_MS);
    return new Promise((resolve) => {
      scheduleRetry(() => resolve(), delayMs);
    }).then(() => instance(config));
  });
}

// src/api/http-client.ts
function createAuthRequestInterceptor(config) {
  const { getBaseURL, getToken } = config;
  return async (request) => {
    if (getBaseURL) request.baseURL = getBaseURL();
    const token = await getToken?.();
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  };
}
function createHttpClient(config = {}) {
  const instance = Axios__default.default.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: { "Content-Type": "application/json", ...config.headers },
    paramsSerializer: createParamsSerializer(config.paramsSerializer)
  });
  instance.interceptors.request.use(
    config.requestInterceptor ?? createAuthRequestInterceptor(config)
  );
  if (config.retry !== false) attachRetryInterceptor(instance, config.retry);
  if (config.error !== false) {
    const { onSuccess, onError } = createErrorInterceptor(config.error);
    instance.interceptors.response.use(onSuccess, onError);
  }
  return instance;
}
function createMutator(instance) {
  return async (config, options) => {
    const { data } = await instance({ ...config, ...options });
    return data;
  };
}

// src/api/query-retry.ts
var MAX_QUERY_RETRIES = 2;
var BASE_DELAY_MS2 = 1e3;
var MAX_DELAY_MS = 4e3;
function shouldRetryQuery(failureCount, error, maxRetries = MAX_QUERY_RETRIES) {
  if (failureCount >= maxRetries) return false;
  if (isCanceledRequest(error)) return false;
  return isRetryableStatus(getErrorStatusCode(error));
}
function queryRetryDelay(attemptIndex, error) {
  const base = Math.min(BASE_DELAY_MS2 * 2 ** attemptIndex, MAX_DELAY_MS);
  const backoff = base + Math.random() * base * 0.25;
  const retryAfterMs = getErrorRetryAfterMs(error);
  return retryAfterMs === void 0 ? backoff : Math.max(retryAfterMs, backoff);
}
function createQueryRetryPolicy(options = {}) {
  const { maxRetries = MAX_QUERY_RETRIES } = options;
  return {
    retry: (failureCount, error) => shouldRetryQuery(failureCount, error, maxRetries),
    retryDelay: queryRetryDelay
  };
}

exports.ApiError = ApiError;
exports.COOKIE_REFRESH_TTL = COOKIE_REFRESH_TTL;
exports.COOKIE_SECURE = COOKIE_SECURE;
exports.COOKIE_TOKEN_TTL = COOKIE_TOKEN_TTL;
exports.HANDLED_HTTP_STATUSES = HANDLED_HTTP_STATUSES;
exports.MAX_QUERY_RETRIES = MAX_QUERY_RETRIES;
exports.MAX_RETRIES = MAX_RETRIES;
exports.MAX_RETRY_AFTER_MS = MAX_RETRY_AFTER_MS;
exports.REFRESH_ENDPOINT = REFRESH_ENDPOINT;
exports.TOKEN_ENDPOINT = TOKEN_ENDPOINT;
exports.VERIFY_ENDPOINT = VERIFY_ENDPOINT;
exports.asStatusCode = asStatusCode;
exports.attachRetryInterceptor = attachRetryInterceptor;
exports.buildAuthConfig = buildAuthConfig;
exports.coerceNonErrorEvent = coerceNonErrorEvent;
exports.computeBackoffDelayMs = computeBackoffDelayMs;
exports.createDevLoginPrompt = createDevLoginPrompt;
exports.createErrorInterceptor = createErrorInterceptor;
exports.createHttpClient = createHttpClient;
exports.createMutator = createMutator;
exports.createParamsSerializer = createParamsSerializer;
exports.createQueryRetryPolicy = createQueryRetryPolicy;
exports.createSentryBeforeSend = createSentryBeforeSend;
exports.extractHttpStatus = extractHttpStatus;
exports.extractStatusFromMessage = extractStatusFromMessage;
exports.getErrorRetryAfterMs = getErrorRetryAfterMs;
exports.getErrorStatusCode = getErrorStatusCode;
exports.isApiError = isApiError;
exports.isCanceledOrNetworkError = isCanceledOrNetworkError;
exports.isCanceledRequest = isCanceledRequest;
exports.isHandledHttpStatus = isHandledHttpStatus;
exports.isIdempotentMethod = isIdempotentMethod;
exports.isRecord = isRecord;
exports.isRetryableAxiosError = isRetryableAxiosError;
exports.isRetryableStatus = isRetryableStatus;
exports.isTransientNetworkError = isTransientNetworkError;
exports.parseEnvelope = parseEnvelope;
exports.parseRetryAfterMs = parseRetryAfterMs;
exports.queryRetryDelay = queryRetryDelay;
exports.readRetryAfterMs = readRetryAfterMs;
exports.scheduleWithTimeout = scheduleWithTimeout;
exports.sentryBeforeSendDropHandledHttpErrors = sentryBeforeSendDropHandledHttpErrors;
exports.serializeParamsComma = serializeParamsComma;
exports.serializeParamsRepeat = serializeParamsRepeat;
exports.shouldCaptureHttpStatus = shouldCaptureHttpStatus;
exports.shouldRetryQuery = shouldRetryQuery;

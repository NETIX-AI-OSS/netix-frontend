import Axios from 'axios';

// src/api/auth-config.ts
var TOKEN_ENDPOINT = "/auth/token/";
var REFRESH_ENDPOINT = "/auth/token/refresh/";
var VERIFY_ENDPOINT = "/auth/token/verify/";
var COOKIE_TOKEN_TTL = "300";
var COOKIE_REFRESH_TTL = "172800";
var COOKIE_SECURE = true;
var DEV_AUTH_BASE_URL = "http://localhost:8001";
function buildAuthConfig({
  devMode = false,
  origin = "",
  hostname = "",
  devAuthBaseUrl = DEV_AUTH_BASE_URL,
  env = {}
} = {}) {
  return {
    COOKIE_TOKEN_TTL,
    COOKIE_REFRESH_TTL,
    COOKIE_SECURE,
    COOKIE_DOMAIN: devMode ? "localhost" : env.cookieDomain ?? "",
    LOGIN_PAGE_URL: devMode ? origin : env.loginPageUrl ?? "",
    AUTH_BASE_URL: devMode ? devAuthBaseUrl : env.authBaseUrl ?? "",
    LAUNCHPAD_PAGE_URL: devMode ? origin : env.launchpadPageUrl ?? "",
    BASE_DOMAIN: devMode ? hostname : env.baseDomain ?? "",
    CURRENT_APP_DOMAIN: hostname,
    TOKEN_ENDPOINT,
    REFRESH_ENDPOINT,
    VERIFY_ENDPOINT
  };
}
function createDevTokenManager(config) {
  const {
    devMode,
    username,
    password,
    isTest = false,
    baseURL,
    tokenEndpoint = "/auth/token/",
    onWarn
  } = config;
  let client = config.http;
  let cachedToken = null;
  let pending = null;
  const isEnabled = () => Boolean(devMode && username && password && !isTest);
  const getClient = () => client ??= Axios.create({ baseURL, headers: { "Content-Type": "application/json" } });
  const obtain = async () => {
    try {
      const response = await getClient().post(tokenEndpoint, { username, password });
      const token = response.data?.access;
      if (!token) {
        onWarn?.(`No access token in the ${tokenEndpoint} response`);
        return null;
      }
      return token;
    } catch (error) {
      onWarn?.("Failed to obtain a dev token", error);
      return null;
    }
  };
  return {
    isEnabled,
    shouldUseDevToken: (request = {}) => {
      if (!isEnabled()) return false;
      const url = request.url ?? "";
      return !url.includes("/auth/login/") && !url.includes("/auth/token/");
    },
    getToken: async () => {
      if (!isEnabled()) return null;
      if (cachedToken) return cachedToken;
      pending ??= obtain().then((token) => {
        cachedToken = token;
        pending = null;
        return token;
      });
      return pending;
    },
    getCachedToken: () => cachedToken,
    reset: () => {
      cachedToken = null;
      pending = null;
    }
  };
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
  const { getBaseURL, getToken, devTokens } = config;
  return async (request) => {
    if (getBaseURL) request.baseURL = getBaseURL();
    const devToken = devTokens?.shouldUseDevToken(request) ? await devTokens.getToken() : null;
    const token = devToken ?? await getToken?.();
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  };
}
function createHttpClient(config = {}) {
  const instance = Axios.create({
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

// src/api/swr-retry.ts
var SWR_MAX_RETRIES = 3;
var BASE_DELAY_MS3 = 500;
var MAX_DELAY_MS2 = 4e3;
function computeSwrBackoffDelayMs(attempt) {
  const capped = Math.min(BASE_DELAY_MS3 * 2 ** Math.max(0, attempt), MAX_DELAY_MS2);
  return Math.round(capped * (0.5 + Math.random() * 0.5));
}
function isRetryableSwrError(error) {
  if (isCanceledRequest(error)) return false;
  return isRetryableStatus(getErrorStatusCode(error));
}
function createSwrOnErrorRetry(options = {}) {
  const {
    maxRetries = SWR_MAX_RETRIES,
    scheduleRetry = scheduleWithTimeout,
    isRetryable = isRetryableSwrError
  } = options;
  return (error, _key, _config, revalidate, revalidateOptions) => {
    if (isCanceledRequest(error)) return;
    const attempt = Math.max(0, (revalidateOptions.retryCount ?? 1) - 1);
    if (attempt >= maxRetries) return;
    if (!isRetryable(error)) return;
    const delayMs = getErrorRetryAfterMs(error) ?? computeSwrBackoffDelayMs(attempt);
    scheduleRetry(() => revalidate(revalidateOptions), delayMs);
  };
}

export { ApiError, COOKIE_REFRESH_TTL, COOKIE_SECURE, COOKIE_TOKEN_TTL, DEV_AUTH_BASE_URL, HANDLED_HTTP_STATUSES, MAX_QUERY_RETRIES, MAX_RETRIES, MAX_RETRY_AFTER_MS, REFRESH_ENDPOINT, SWR_MAX_RETRIES, TOKEN_ENDPOINT, VERIFY_ENDPOINT, asStatusCode, attachRetryInterceptor, buildAuthConfig, coerceNonErrorEvent, computeBackoffDelayMs, computeSwrBackoffDelayMs, createDevTokenManager, createErrorInterceptor, createHttpClient, createMutator, createParamsSerializer, createQueryRetryPolicy, createSentryBeforeSend, createSwrOnErrorRetry, extractHttpStatus, extractStatusFromMessage, getErrorRetryAfterMs, getErrorStatusCode, isApiError, isCanceledOrNetworkError, isCanceledRequest, isHandledHttpStatus, isIdempotentMethod, isRecord, isRetryableAxiosError, isRetryableStatus, isRetryableSwrError, isTransientNetworkError, parseEnvelope, parseRetryAfterMs, queryRetryDelay, readRetryAfterMs, scheduleWithTimeout, sentryBeforeSendDropHandledHttpErrors, serializeParamsComma, serializeParamsRepeat, shouldCaptureHttpStatus, shouldRetryQuery };

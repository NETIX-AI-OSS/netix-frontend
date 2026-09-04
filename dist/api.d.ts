import { AxiosResponse, AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * The canonical envoy-ts-auth configuration every NETIX app shares. Seven apps used to carry
 * hand-maintained copies of these constants; this module is the single source of truth.
 *
 * Everything derives from the one deploy input, the base domain: universal-login is served at
 * the domain root, the launchpad at `launchpad.<domain>`, and the session cookie is scoped to
 * the bare domain so every `<app>.<domain>` shares it. Local dev keeps the same shape scoped
 * to localhost, with auth riding the app's `/user-api` dev proxy against real staging.
 *
 * The factory is pure — apps inject their `import.meta.env` reads and window facts — so it
 * stays safe for CJS/react-native builds and deterministic under test.
 */
declare const TOKEN_ENDPOINT = "/auth/token/";
declare const REFRESH_ENDPOINT = "/auth/token/refresh/";
declare const VERIFY_ENDPOINT = "/auth/token/verify/";
declare const COOKIE_TOKEN_TTL = "300";
declare const COOKIE_REFRESH_TTL = "172800";
/**
 * True even on http://localhost: envoy-ts-auth stamps every cookie `SameSite=None`, which
 * browsers only accept together with `Secure`. Chrome and Firefox treat localhost as a secure
 * context so the pair works in dev; Safari does not and silently drops the cookie — local
 * development is Chrome/Firefox.
 */
declare const COOKIE_SECURE = true;
type BuildAuthConfigOptions = {
    /** The one deploy input every URL derives from (`ENV.baseDomain`). */
    baseDomain: string;
    /**
     * `ENV.authBaseUrl` — the same-origin `/user-api` dev-proxy prefix under `vite dev` (real
     * staging auth, no CORS), `https://user.api.<domain>` in a build.
     */
    authBaseUrl: string;
    /** `ENV.isDev`: scopes the cookie and the redirect allowlist to localhost. */
    dev?: boolean;
    /** `window.location.hostname` — the deployed app's own domain, for the redirect allowlist. */
    hostname?: string;
    /** Local dev: open the dev sign-in prompt instead of navigating to universal-login. */
    onLogout?: () => void;
    /** Local dev: suppress the post-login launchpad redirect (the prompt handles success). */
    onLogin?: () => void;
};
type AuthConfig = {
    COOKIE_TOKEN_TTL: string;
    COOKIE_REFRESH_TTL: string;
    COOKIE_SECURE: boolean;
    COOKIE_DOMAIN: string;
    LOGIN_PAGE_URL: string;
    AUTH_BASE_URL: string;
    LAUNCHPAD_PAGE_URL: string;
    BASE_DOMAIN: string;
    CURRENT_APP_DOMAIN: string;
    TOKEN_ENDPOINT: string;
    REFRESH_ENDPOINT: string;
    VERIFY_ENDPOINT: string;
    ON_LOGIN?: () => void;
    ON_LOGOUT?: () => void;
};
/** The AUTH_CONFIG object envoy-ts-auth expects, fully derived from the base domain. */
declare function buildAuthConfig({ baseDomain, authBaseUrl, dev, hostname, onLogin, onLogout, }: BuildAuthConfigOptions): AuthConfig;

/**
 * Local-development sign-in. When envoy-ts-auth reports a missing or expired session
 * (ON_LOGOUT), it asks for staging credentials and stores real tokens, so `vite dev` talks to
 * the real staging APIs as a real user — no login page, no credentials in `.env`.
 *
 * It mounts a real `<form>` rather than calling `window.prompt`, because a native dialog is
 * invisible to password managers: nothing to autofill, nothing to offer to save, and the
 * typing is in cleartext. What every manager does recognise is a form carrying
 * `autocomplete="username"` / `"current-password"` fields and a submit button, followed by a
 * navigation — so this asks once, gets saved, and autofills from then on. Chromium is also
 * asked outright via `navigator.credentials.store`. `http://localhost` is a secure context,
 * so saving works there.
 *
 * The overlay imports nothing and inlines its own styles: it has to work before the app has
 * rendered, and inline styles survive app CSS that would otherwise restyle it out of sight.
 *
 * Wire it through `buildAuthConfig`: `onLogout: devLogin.open`, `onLogin: devLogin.close`.
 */
type DevLoginPromptOptions = {
    /**
     * Typically `(u, p) => Auth.getInstance().login(u, p)`, injected so this module never
     * imports envoy-ts-auth. envoy resolves `true` on success and `false`/`undefined` on
     * failure with no detail, so anything non-`true` is reported as a bad sign-in.
     */
    login: (username: string, password: string) => Promise<unknown>;
    /** Runs after a successful sign-in. Defaults to a full reload so everything that already fetched unauthenticated reruns with the token. */
    onSuccess?: () => void;
};
type DevLoginPrompt = {
    /** Mounts the sign-in overlay. Ignored while one is already open. */
    open: () => void;
    /** Removes the overlay. Wired to ON_LOGIN, which envoy fires as soon as sign-in succeeds. */
    close: () => void;
};
declare function createDevLoginPrompt({ login, onSuccess }: DevLoginPromptOptions): DevLoginPrompt;

/** Normalizes the `{status_code, messages}` error envelope (plus DRF `detail`/`error`) to a flat string[]. */
declare function parseEnvelope(data: unknown, fallback?: string): string[];

type ApiErrorOptions = {
    retryAfterMs?: number;
    context?: Record<string, unknown>;
};
/** The one error every NETIX client throws; `messages` is always normalized to a flat string[]. */
declare class ApiError extends Error {
    readonly statusCode: number;
    readonly messages: string[];
    readonly retryAfterMs?: number;
    readonly context?: Record<string, unknown>;
    constructor(statusCode: number, messages: string[], options?: ApiErrorOptions);
    /** Compat alias for the pre-library `{ status }` error shape. */
    get status(): number;
    /** Compat alias for the pre-library `{ errorMessage }` error shape. */
    get errorMessage(): string;
}
declare function isApiError(error: unknown): error is ApiError;
/** Status from an ApiError, or from a raw axios error for clients not yet on the shared interceptor. */
declare function getErrorStatusCode(error: unknown): number | null;
/** Statuses worth re-dispatching: the network sentinel, request timeout, rate limit, and 5xx. */
declare function isRetryableStatus(statusCode: number | null): boolean;

type ErrorCaptureMeta = {
    statusCode: number;
    messages: string[];
    client?: string;
};
type ErrorInterceptorConfig = {
    /** Tags every captured event so a Sentry issue names the failing service. */
    clientName?: string;
    excludedErrorCodes?: number[];
    /** Sink for the Sentry capture; the package never imports a Sentry SDK itself. */
    captureException?: (error: unknown, meta: ErrorCaptureMeta) => void;
    shouldCapture?: (statusCode: number) => boolean;
    /** 401 hook: envoy-ts-auth owns refresh, so the default is to do nothing. */
    onAuthError?: (error: ApiError) => void;
    /** Optional toast/banner sink; every app that has none keeps surfacing errors at the call site. */
    onDisplayError?: (error: ApiError) => void;
    forbiddenMessage?: string;
    networkErrorMessage?: string;
};
/**
 * Unified response error handler. Every branch throws an ApiError — never returns — so the
 * react-query / SWR retry predicates still run, and a 403 never logs out.
 */
declare function createErrorInterceptor(config?: ErrorInterceptorConfig): {
    onSuccess: (response: AxiosResponse) => AxiosResponse<any, any, {}, any>;
    onError: (error: AxiosError) => never;
};

/**
 * `repeat` (?a=1&a=2) is what most backends' DRF filters expect; `comma` (?a=1,2) is what
 * django-filter's BaseInFilter needs — axios's default bracketed keys are silently dropped by both.
 */
type ParamsSerializerStrategy = 'repeat' | 'comma' | 'default';
declare function serializeParamsRepeat(params: Record<string, unknown>): string;
declare function serializeParamsComma(params: Record<string, unknown>): string;
declare function createParamsSerializer(strategy?: ParamsSerializerStrategy): {
    serialize: typeof serializeParamsComma;
} | undefined;

declare const MAX_RETRIES = 2;
type ScheduleRetry = (callback: () => void, delayMs: number) => void;
type RetryOptions = {
    maxRetries?: number;
    scheduleRetry?: ScheduleRetry;
    retryServerErrors?: boolean;
};
declare const scheduleWithTimeout: ScheduleRetry;
declare function isIdempotentMethod(config: AxiosRequestConfig): boolean;
declare function isRetryableAxiosError(error: AxiosError, retryServerErrors?: boolean): boolean;
/** Capped exponential backoff with equal jitter. */
declare function computeBackoffDelayMs(attempt: number): number;
/**
 * Idempotent-only transport retry. Re-dispatches through the instance so the whole interceptor
 * chain (token refresh included) re-runs; must be attached before the error interceptor so it
 * still sees a raw AxiosError.
 */
declare function attachRetryInterceptor(instance: AxiosInstance, options?: RetryOptions): void;

type MaybePromise<T> = T | Promise<T>;
type HttpClientConfig = {
    baseURL?: string;
    /** Read per request, never cached: the mobile apps repoint themselves from the sign-in screen. */
    getBaseURL?: () => string;
    timeout?: number;
    headers?: Record<string, string>;
    paramsSerializer?: ParamsSerializerStrategy;
    getToken?: () => MaybePromise<string | null | undefined>;
    /** Replaces the default auth request interceptor wholesale. */
    requestInterceptor?: (config: InternalAxiosRequestConfig) => MaybePromise<InternalAxiosRequestConfig>;
    error?: ErrorInterceptorConfig | false;
    retry?: RetryOptions | false;
    /** Defaults to false. React Native's XHR defaults it to true, which attaches the native cookie jar. */
    withCredentials?: boolean;
};
declare function createHttpClient(config?: HttpClientConfig): AxiosInstance;
/** Orval mutator: `<T>(config, options?) => Promise<T>`, client-agnostic for SWR and react-query alike. */
declare function createMutator(instance: AxiosInstance): <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) => Promise<T>;

declare function isRecord(value: unknown): value is Record<string, unknown>;
declare function isCanceledRequest(exception: unknown): boolean;
declare function isTransientNetworkError(exception: unknown): boolean;
declare function isCanceledOrNetworkError(exception: unknown): boolean;

/** Retries after the first attempt; react-query hands the predicate a 0-based failure count. */
declare const MAX_QUERY_RETRIES = 2;
declare function shouldRetryQuery(failureCount: number, error: unknown, maxRetries?: number): boolean;
/** Capped exponential backoff with 25% jitter, never shorter than a server-provided Retry-After. */
declare function queryRetryDelay(attemptIndex: number, error: unknown): number;
/** Drop-in `defaultOptions.queries` fragment for a QueryClient. */
declare function createQueryRetryPolicy(options?: {
    maxRetries?: number;
}): {
    retry: (failureCount: number, error: unknown) => boolean;
    retryDelay: typeof queryRetryDelay;
};

/** Beyond this a server-provided Retry-After is not worth blocking a retry on. */
declare const MAX_RETRY_AFTER_MS = 10000;
/** `Retry-After` is a number of seconds or an HTTP-date; array-valued headers take the first entry. */
declare function parseRetryAfterMs(headerValue: unknown): number | undefined;
/** Reads Retry-After off an axios headers bag, which is either an AxiosHeaders or a plain record. */
declare function readRetryAfterMs(headers: unknown): number | undefined;
/** Capped Retry-After for a thrown error, from ApiError first and the raw axios response second. */
declare function getErrorRetryAfterMs(error: unknown): number | undefined;

type SentryEvent = {
    exception?: unknown;
    tags?: unknown;
    request?: unknown;
    contexts?: unknown;
    extra?: Record<string, unknown>;
    fingerprint?: string[];
};
type SentryEventHint = {
    originalException?: unknown;
};
/** 403 is an expected in-app condition, not a defect: the whole fleet converges on dropping it. */
declare const HANDLED_HTTP_STATUSES: ReadonlySet<number>;
declare function asStatusCode(value: unknown): number | null;
declare function extractStatusFromMessage(value: unknown): number | null;
declare function extractHttpStatus(event: SentryEvent, hint?: SentryEventHint): number | null;
declare function isHandledHttpStatus(statusCode: number | null | undefined, handled?: ReadonlySet<number>): boolean;
declare function shouldCaptureHttpStatus(statusCode: number | null | undefined, handled?: ReadonlySet<number>): boolean;
/** Backstop for non-Error captures: gives GlitchTip a message and a shape-based fingerprint to group on. */
declare function coerceNonErrorEvent<TEvent extends SentryEvent>(event: TEvent, hint?: SentryEventHint): TEvent;
type SentryBeforeSendOptions = {
    handledStatuses?: ReadonlySet<number>;
    /** Extra drop predicates, e.g. viz-ui's meta2d vendor-bug filter. */
    drop?: Array<(event: SentryEvent, hint?: SentryEventHint) => boolean>;
    dropCanceledOrNetworkErrors?: boolean;
    /** Drops 4xx ApiErrors already surfaced in-app (their unhandled-rejection shadow is noise). */
    dropHandledApiErrors?: boolean;
    coerceNonErrors?: boolean;
};
/** The shared `beforeSend` chain: drop filters first, then the handled-status filter, then coercion. */
declare function createSentryBeforeSend(options?: SentryBeforeSendOptions): <TEvent extends SentryEvent>(event: TEvent, hint?: SentryEventHint) => TEvent | null;
/** Zero-config `beforeSend` for the web apps. */
declare const sentryBeforeSendDropHandledHttpErrors: <TEvent extends SentryEvent>(event: TEvent, hint?: SentryEventHint) => TEvent | null;

export { ApiError, type ApiErrorOptions, type AuthConfig, type BuildAuthConfigOptions, COOKIE_REFRESH_TTL, COOKIE_SECURE, COOKIE_TOKEN_TTL, type DevLoginPrompt, type DevLoginPromptOptions, type ErrorCaptureMeta, type ErrorInterceptorConfig, HANDLED_HTTP_STATUSES, type HttpClientConfig, MAX_QUERY_RETRIES, MAX_RETRIES, MAX_RETRY_AFTER_MS, type MaybePromise, type ParamsSerializerStrategy, REFRESH_ENDPOINT, type RetryOptions, type ScheduleRetry, type SentryBeforeSendOptions, type SentryEvent, type SentryEventHint, TOKEN_ENDPOINT, VERIFY_ENDPOINT, asStatusCode, attachRetryInterceptor, buildAuthConfig, coerceNonErrorEvent, computeBackoffDelayMs, createDevLoginPrompt, createErrorInterceptor, createHttpClient, createMutator, createParamsSerializer, createQueryRetryPolicy, createSentryBeforeSend, extractHttpStatus, extractStatusFromMessage, getErrorRetryAfterMs, getErrorStatusCode, isApiError, isCanceledOrNetworkError, isCanceledRequest, isHandledHttpStatus, isIdempotentMethod, isRecord, isRetryableAxiosError, isRetryableStatus, isTransientNetworkError, parseEnvelope, parseRetryAfterMs, queryRetryDelay, readRetryAfterMs, scheduleWithTimeout, sentryBeforeSendDropHandledHttpErrors, serializeParamsComma, serializeParamsRepeat, shouldCaptureHttpStatus, shouldRetryQuery };

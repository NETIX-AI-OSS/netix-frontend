import { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

type DevTokenConfig = {
    /** Injected, never read from import.meta — the RN-safe entries must stay bundler-agnostic. */
    devMode: boolean;
    username?: string;
    password?: string;
    /** Test runs must never fire the dev-token request (user-profile-ui's guard, folded in). */
    isTest?: boolean;
    baseURL: string;
    tokenEndpoint?: string;
    /** Injected in tests; defaults to a bare axios instance on `baseURL`. */
    http?: Pick<AxiosInstance, 'post'>;
    onWarn?: (message: string, error?: unknown) => void;
};
type DevTokenManager = {
    isEnabled: () => boolean;
    shouldUseDevToken: (request?: {
        url?: string;
    }) => boolean;
    getToken: () => Promise<string | null>;
    getCachedToken: () => string | null;
    reset: () => void;
};
/** Local-development token issuer: one promise-locked copy replacing the fleet's seven. */
declare function createDevTokenManager(config: DevTokenConfig): DevTokenManager;

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
};
declare const scheduleWithTimeout: ScheduleRetry;
declare function isIdempotentMethod(config: AxiosRequestConfig): boolean;
declare function isRetryableAxiosError(error: AxiosError): boolean;
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
    devTokens?: DevTokenManager;
    /** Replaces the default auth request interceptor wholesale. */
    requestInterceptor?: (config: InternalAxiosRequestConfig) => MaybePromise<InternalAxiosRequestConfig>;
    error?: ErrorInterceptorConfig | false;
    retry?: RetryOptions | false;
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

/** Retries after the first attempt, not total attempts. */
declare const SWR_MAX_RETRIES = 3;
type SwrRevalidatorOptions = {
    retryCount?: number;
    dedupe?: boolean;
};
type SwrOnErrorRetry = (error: unknown, key: string, config: unknown, revalidate: (options?: SwrRevalidatorOptions) => void, options: SwrRevalidatorOptions) => void;
type SwrRetryOptions = {
    maxRetries?: number;
    scheduleRetry?: ScheduleRetry;
    isRetryable?: (error: unknown) => boolean;
};
/** Capped exponential backoff with equal jitter, over a 0-based attempt index. */
declare function computeSwrBackoffDelayMs(attempt: number): number;
declare function isRetryableSwrError(error: unknown): boolean;
/**
 * `onErrorRetry` for `<SWRConfig>`. SWR hands the handler an already-incremented `retryCount`
 * (1 on the first failure), so it is normalized to a 0-based attempt before the cap and backoff.
 */
declare function createSwrOnErrorRetry(options?: SwrRetryOptions): SwrOnErrorRetry;

export { ApiError, type ApiErrorOptions, type DevTokenConfig, type DevTokenManager, type ErrorCaptureMeta, type ErrorInterceptorConfig, HANDLED_HTTP_STATUSES, type HttpClientConfig, MAX_QUERY_RETRIES, MAX_RETRIES, MAX_RETRY_AFTER_MS, type MaybePromise, type ParamsSerializerStrategy, type RetryOptions, SWR_MAX_RETRIES, type ScheduleRetry, type SentryBeforeSendOptions, type SentryEvent, type SentryEventHint, type SwrOnErrorRetry, type SwrRetryOptions, type SwrRevalidatorOptions, asStatusCode, attachRetryInterceptor, coerceNonErrorEvent, computeBackoffDelayMs, computeSwrBackoffDelayMs, createDevTokenManager, createErrorInterceptor, createHttpClient, createMutator, createParamsSerializer, createQueryRetryPolicy, createSentryBeforeSend, createSwrOnErrorRetry, extractHttpStatus, extractStatusFromMessage, getErrorRetryAfterMs, getErrorStatusCode, isApiError, isCanceledOrNetworkError, isCanceledRequest, isHandledHttpStatus, isIdempotentMethod, isRecord, isRetryableAxiosError, isRetryableStatus, isRetryableSwrError, isTransientNetworkError, parseEnvelope, parseRetryAfterMs, queryRetryDelay, readRetryAfterMs, scheduleWithTimeout, sentryBeforeSendDropHandledHttpErrors, serializeParamsComma, serializeParamsRepeat, shouldCaptureHttpStatus, shouldRetryQuery };

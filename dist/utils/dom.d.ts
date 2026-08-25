import * as React from 'react';
import { ComponentType } from 'react';

type DownloadFileOptions = {
    getToken?: () => string | null | undefined | Promise<string | null | undefined>;
    captureException?: (error: unknown) => void;
    shouldCapture?: (status: number) => boolean;
};
type DownloadError = Error & {
    status: number;
    url: string;
    filename: string;
};
declare function saveFile(url: string, filename: string): void;
declare function downloadFile(url: string, acceptHeader: string, filename: string, options?: DownloadFileOptions): Promise<void>;

type AnyComponent = ComponentType<any>;
type ComponentImport<T extends AnyComponent> = () => Promise<{
    default: T;
}>;
declare const SESSION_STORAGE_KEY = "chunk_failed_refresh";
/** Vite build.assetsDir — only files under this prefix can go stale after a deploy. */
declare const BUILD_OUTPUT_PREFIX = "/static/";
/** Reloads allowed inside CHUNK_RELOAD_WINDOW_MS before the app gives up and surfaces the error. */
declare const MAX_CHUNK_RELOADS = 2;
declare const CHUNK_RELOAD_WINDOW_MS = 60000;
/** True when `message` describes a chunk fetch/parse failure rather than ordinary app breakage. */
declare const isChunkLoadMessage: (message?: string | null) => boolean;
declare const isChunkLoadError: (error: unknown) => boolean;
/** Window `error` events only count when the failing file is part of the build output. */
declare const isChunkLoadErrorEvent: (event: Pick<ErrorEvent, "message" | "filename">) => boolean;
/** Guard survives boot on purpose: clearing it there is what let reloads run forever. */
declare const canReloadForChunkError: (now?: number) => boolean;
declare const recordChunkReload: (now?: number) => void;
/** Reloads once onto fresh HTML when a script tag fails for a stale build-output file. */
declare const installChunkErrorReloadHandler: (target?: Window) => void;
/** Wraps React.lazy so a chunk that went stale across a deploy reloads instead of white-screening. */
declare function lazyWithRetry<T extends AnyComponent>(importFn: ComponentImport<T>): React.LazyExoticComponent<T>;

declare const MISSING_TOKEN_ERROR = "Unable to retrieve authentication token. Please sign in and try again.";
type UploadOptions = {
    endpoint: string;
    getToken: () => string | null | undefined | Promise<string | null | undefined>;
    /** Image downscaler; stays app-side because react-image-file-resizer is not a package dep. */
    compress?: (file: File) => Promise<Blob>;
};
declare function uploadStaticFile(name: string, mime: string, file: Blob, options: UploadOptions): Promise<unknown>;
declare function uploadFile(file: File, options: UploadOptions & {
    compressImages?: boolean;
}): Promise<unknown>;

export { BUILD_OUTPUT_PREFIX, CHUNK_RELOAD_WINDOW_MS, type DownloadError, type DownloadFileOptions, MAX_CHUNK_RELOADS, MISSING_TOKEN_ERROR, SESSION_STORAGE_KEY, type UploadOptions, canReloadForChunkError, downloadFile, installChunkErrorReloadHandler, isChunkLoadError, isChunkLoadErrorEvent, isChunkLoadMessage, lazyWithRetry, recordChunkReload, saveFile, uploadFile, uploadStaticFile };

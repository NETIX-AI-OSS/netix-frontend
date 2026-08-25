import { lazy } from 'react';

// src/utils/dom/download.ts
var PROXY_STATUSES = /* @__PURE__ */ new Set([502, 504]);
var HANDLED_STATUSES = /* @__PURE__ */ new Set([400, 403, 404]);
function saveFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "file-name";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
async function downloadFile(url, acceptHeader, filename, options) {
  const token = await options?.getToken?.();
  const response = await fetch(url, {
    headers: {
      Accept: acceptHeader,
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  if (!response.ok) {
    const { status, statusText } = response;
    const detail = [status, statusText].filter(Boolean).join(" ");
    const error = Object.assign(new Error(`Download failed${detail ? `: ${detail}` : ""}`), {
      status,
      url,
      filename
    });
    const shouldCapture = options?.shouldCapture ?? ((s) => !HANDLED_STATUSES.has(s));
    if (shouldCapture(status) || PROXY_STATUSES.has(status)) {
      options?.captureException?.(error);
    }
    throw error;
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  saveFile(blobUrl, filename);
  URL.revokeObjectURL(blobUrl);
}
var SESSION_STORAGE_KEY = "chunk_failed_refresh";
var BUILD_OUTPUT_PREFIX = "/static/";
var MAX_CHUNK_RELOADS = 2;
var CHUNK_RELOAD_WINDOW_MS = 6e4;
var CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Loading chunk",
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Failed to load module script",
  "MIME type",
  "is not executable"
];
var HTML_PARSED_AS_SCRIPT = "Unexpected token '<'";
var JSON_PARSE_MARKER = "is not valid JSON";
var EMPTY_GUARD = { count: 0, at: 0 };
var readGuard = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return EMPTY_GUARD;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.count !== "number" || typeof parsed?.at !== "number") return EMPTY_GUARD;
    return { count: parsed.count, at: parsed.at };
  } catch {
    return EMPTY_GUARD;
  }
};
var isChunkLoadMessage = (message) => {
  if (!message) return false;
  if (CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) return true;
  return message.includes(HTML_PARSED_AS_SCRIPT) && !message.includes(JSON_PARSE_MARKER);
};
var isChunkLoadError = (error) => error instanceof Error && (error.name === "ChunkLoadError" || isChunkLoadMessage(error.message));
var isChunkLoadErrorEvent = (event) => {
  if (!isChunkLoadMessage(event.message)) return false;
  return !event.filename || event.filename.includes(BUILD_OUTPUT_PREFIX);
};
var canReloadForChunkError = (now = Date.now()) => {
  const { count, at } = readGuard();
  return count < MAX_CHUNK_RELOADS || now - at > CHUNK_RELOAD_WINDOW_MS;
};
var recordChunkReload = (now = Date.now()) => {
  const { count, at } = readGuard();
  const expired = now - at > CHUNK_RELOAD_WINDOW_MS;
  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ count: expired ? 1 : count + 1, at: now })
    );
  } catch {
  }
};
var installChunkErrorReloadHandler = (target = window) => {
  target.addEventListener("error", (event) => {
    if (!isChunkLoadErrorEvent(event)) return;
    if (!canReloadForChunkError()) return;
    recordChunkReload();
    target.location.reload();
  });
};
function lazyWithRetry(importFn) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      if (isChunkLoadError(error) && canReloadForChunkError()) {
        recordChunkReload();
        window.location.reload();
        return new Promise(() => {
        });
      }
      throw error;
    }
  });
}

// src/utils/dom/upload.ts
var MISSING_TOKEN_ERROR = "Unable to retrieve authentication token. Please sign in and try again.";
async function uploadStaticFile(name, mime, file, options) {
  const token = await options.getToken();
  if (!token) {
    throw new Error(MISSING_TOKEN_ERROR);
  }
  const formData = new FormData();
  formData.append("name", name);
  formData.append("mime", mime);
  formData.append("file", file);
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!(response.status === 200 || response.status === 201)) throw response;
  return await response.json();
}
async function uploadFile(file, options) {
  const shouldCompress = options.compressImages && typeof file.type === "string" && file.type.startsWith("image/");
  const body = shouldCompress && options.compress ? await options.compress(file) : file;
  return uploadStaticFile(file.name?.replace(/,/g, "_"), file.type, body, options);
}

export { BUILD_OUTPUT_PREFIX, CHUNK_RELOAD_WINDOW_MS, MAX_CHUNK_RELOADS, MISSING_TOKEN_ERROR, SESSION_STORAGE_KEY, canReloadForChunkError, downloadFile, installChunkErrorReloadHandler, isChunkLoadError, isChunkLoadErrorEvent, isChunkLoadMessage, lazyWithRetry, recordChunkReload, saveFile, uploadFile, uploadStaticFile };

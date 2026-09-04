'use strict';

var i18next = require('i18next');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var i18next__default = /*#__PURE__*/_interopDefault(i18next);

// src/i18n/locales/common.ar.json
var common_ar_default = {
  active: "\u0646\u0634\u0637",
  add: "\u0625\u0636\u0627\u0641\u0629",
  asset: "\u0623\u0635\u0644",
  back: "\u0631\u062C\u0648\u0639",
  cancel: "\u0625\u0644\u063A\u0627\u0621",
  close: "\u0625\u063A\u0644\u0627\u0642",
  confirm: "\u062A\u0623\u0643\u064A\u062F",
  created_on: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
  dark: "\u062F\u0627\u0643\u0646",
  delete: "\u062D\u0630\u0641",
  edit: "\u062A\u0639\u062F\u064A\u0644",
  email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
  home: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
  light: "\u0641\u0627\u062A\u062D",
  loading: "\u062C\u0627\u0631 \u0627\u0644\u062A\u062D\u0645\u064A\u0644...",
  logout: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C",
  na: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
  name: "\u0627\u0644\u0627\u0633\u0645",
  next: "\u0627\u0644\u062A\u0627\u0644\u064A",
  no: "\u0644\u0627",
  no_data: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0634\u064A\u0621 \u0647\u0646\u0627",
  open: "\u0645\u0641\u062A\u0648\u062D",
  profile: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A",
  save: "\u062D\u0641\u0638",
  search: "\u0628\u062D\u062B",
  settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
  status: "\u0627\u0644\u062D\u0627\u0644\u0629",
  submit: "\u0625\u0631\u0633\u0627\u0644",
  support: "\u0627\u0644\u062F\u0639\u0645",
  switch_organization: "\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u0629",
  system: "\u0627\u0644\u0646\u0638\u0627\u0645",
  version: "\u0627\u0644\u0625\u0635\u062F\u0627\u0631",
  yes: "\u0646\u0639\u0645"
};

// src/i18n/locales/common.en.json
var common_en_default = {
  active: "Active",
  add: "Add",
  asset: "Asset",
  back: "Back",
  cancel: "Cancel",
  close: "Close",
  confirm: "Confirm",
  created_on: "Created on",
  dark: "Dark",
  delete: "Delete",
  edit: "Edit",
  email: "Email",
  home: "Home",
  light: "Light",
  loading: "Loading...",
  logout: "Logout",
  na: "NA",
  name: "Name",
  next: "Next",
  no: "No",
  no_data: "There is nothing here",
  open: "Open",
  profile: "Profile",
  save: "Save",
  search: "Search",
  settings: "Settings",
  status: "Status",
  submit: "Submit",
  support: "Support",
  switch_organization: "Switch organization",
  system: "System",
  version: "Version",
  yes: "Yes"
};

// src/i18n/locales/common.es.json
var common_es_default = {
  active: "Activo",
  add: "Agregar",
  asset: "Activo",
  back: "Atr\xE1s",
  cancel: "Cancelar",
  close: "Cerrar",
  confirm: "Confirmar",
  created_on: "Creado el",
  dark: "Oscuro",
  delete: "Eliminar",
  edit: "Editar",
  email: "Correo electr\xF3nico",
  home: "Inicio",
  light: "Claro",
  loading: "Cargando...",
  logout: "Cerrar sesi\xF3n",
  na: "NA",
  name: "Nombre",
  next: "Siguiente",
  no: "No",
  no_data: "No hay nada aqu\xED",
  open: "Abierto",
  profile: "Perfil",
  save: "Guardar",
  search: "Buscar",
  settings: "Configuraci\xF3n",
  status: "Estado",
  submit: "Enviar",
  support: "Soporte",
  switch_organization: "Cambiar de organizaci\xF3n",
  system: "Sistema",
  version: "Versi\xF3n",
  yes: "S\xED"
};

// src/i18n/common-resources.ts
var COMMON_NAMESPACE = "common";
var commonTranslations = { ar: common_ar_default, en: common_en_default, es: common_es_default };
var commonResources = {
  ar: { [COMMON_NAMESPACE]: common_ar_default },
  en: { [COMMON_NAMESPACE]: common_en_default },
  es: { [COMMON_NAMESPACE]: common_es_default }
};

// src/i18n/normalize-language.ts
function normalizeLanguage(value, supported, fallback) {
  const base = value?.trim().toLowerCase().split("-")[0];
  return supported.includes(base) ? base : fallback;
}

// src/i18n/create-i18n.ts
function detectStorage() {
  try {
    return typeof globalThis.localStorage?.getItem === "function" ? globalThis.localStorage : null;
  } catch {
    return null;
  }
}
function readStored(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function writeStored(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
  }
}
function applyDocumentDirection(language, dir) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = dir;
}
function createI18n(options) {
  const {
    resources,
    instance = i18next__default.default,
    plugins = [],
    supportedLngs = Object.keys(resources),
    fallbackLng = "en",
    debug = false,
    platform = "web",
    storageKey = "language",
    persistOnChange = true,
    applyDirection = applyDocumentDirection,
    initOptions
  } = options;
  const storage = options.storage === void 0 ? detectStorage() : options.storage;
  const normalize = (value) => normalizeLanguage(value, supportedLngs, fallbackLng);
  const stored = platform === "native" ? null : readStored(storage, storageKey);
  const lng = options.lng ?? (stored === null ? void 0 : normalize(stored));
  for (const plugin of plugins) instance.use(plugin);
  void instance.init({
    resources,
    lng,
    fallbackLng,
    debug,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
    ...initOptions
  });
  const onLanguageChanged = (language) => {
    if (persistOnChange && storage) writeStored(storage, storageKey, normalize(language));
    applyDirection(language, instance.dir(language));
  };
  instance.on("languageChanged", onLanguageChanged);
  onLanguageChanged(instance.resolvedLanguage ?? instance.language ?? fallbackLng);
  return instance;
}

// src/i18n/organization-locale.ts
var PENDING_LANGUAGE_KEY = "organization-locale:pending-language:v1";
function localeIdentity(user) {
  const userId = user?.user_id ?? user?.id;
  const organizationId = user?.organization_id ?? user?.organization;
  return userId == null || organizationId == null ? null : { userId, organizationId };
}
function sameIdentity(left, right) {
  return left != null && String(left.userId) === String(right.userId) && String(left.organizationId) === String(right.organizationId);
}
function createOrganizationLocale(config) {
  const {
    i18n,
    storage,
    createRuntime,
    getApiBaseUrl,
    languageKey = "language",
    namespace = "translation",
    pendingKeyPrefix = PENDING_LANGUAGE_KEY,
    defaultLanguage = "en",
    healthGate = false
  } = config;
  let runtime = null;
  let runtimeOrigin = "";
  let activeIdentity = null;
  const pendingLanguageKey = (identity) => `${pendingKeyPrefix}:${encodeURIComponent(String(identity.userId))}:${encodeURIComponent(String(identity.organizationId))}`;
  function getLocaleRuntime() {
    const apiBaseUrl = getApiBaseUrl()?.replace(/\/+$/, "");
    if (!apiBaseUrl) return null;
    if (!runtime || runtimeOrigin !== apiBaseUrl) {
      runtimeOrigin = apiBaseUrl;
      runtime = createRuntime(apiBaseUrl);
    }
    return runtime;
  }
  function clearActiveIdentity() {
    activeIdentity = null;
    getLocaleRuntime()?.setActiveIdentity(null);
  }
  async function renderLanguage(language, persistPreference) {
    if (persistPreference) await storage.setItem(languageKey, language);
    await i18n.changeLanguage(language);
  }
  async function applyLanguage(language) {
    await renderLanguage(language, true);
  }
  async function hydrateBundledLanguage() {
    const language = await storage.getItem(languageKey) || defaultLanguage;
    await applyLanguage(language);
    return language;
  }
  const bundled = /* @__PURE__ */ new Map();
  async function applyEffectiveLocale(locale) {
    const language = locale.resolved_language;
    const floor = bundled.get(language) ?? i18n.getResourceBundle(language, namespace) ?? {};
    bundled.set(language, floor);
    i18n.removeResourceBundle(language, namespace);
    i18n.addResourceBundle(language, namespace, floor, true, true);
    i18n.addResourceBundle(language, namespace, locale.translations, true, true);
    await renderLanguage(language, false);
  }
  async function initialLanguage(identity, user) {
    return await storage.getItem(pendingLanguageKey(identity)) || user.preferred_language || user.organization_default_language || await storage.getItem(languageKey) || defaultLanguage;
  }
  async function isHealthy(locales) {
    if (!healthGate || !locales.checkHealth) return true;
    try {
      return await locales.checkHealth();
    } catch {
      return false;
    }
  }
  async function refreshOrganizationLocale(user, requestedLanguage) {
    const identity = localeIdentity(user);
    const locales = getLocaleRuntime();
    if (!identity || !locales) return null;
    activeIdentity = identity;
    locales.setActiveIdentity(identity);
    if (!await isHealthy(locales)) return null;
    const language = requestedLanguage || await initialLanguage(identity, user);
    const cached = await locales.hydrate(identity, language);
    if (cached && sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(cached.locale);
    const result = await locales.refreshEffective(identity, language);
    if (sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(result.locale);
    if (await locales.reconcilePendingLanguage(identity)) {
      await storage.removeItem(pendingLanguageKey(identity));
    }
    return result.locale;
  }
  async function changeOrganizationLanguage(language) {
    const identity = activeIdentity;
    if (identity) await storage.setItem(pendingLanguageKey(identity), language);
    await applyLanguage(language);
    const locales = getLocaleRuntime();
    if (!locales || !identity) return;
    const synchronized = await locales.setPreferredLanguage(identity, language);
    if (synchronized) await storage.removeItem(pendingLanguageKey(identity));
    if (!synchronized) return;
    try {
      const refreshed = await locales.refreshEffective(identity, language);
      if (sameIdentity(activeIdentity, identity)) await applyEffectiveLocale(refreshed.locale);
    } catch {
    }
  }
  return {
    getLocaleRuntime,
    clearActiveIdentity,
    applyLanguage,
    hydrateBundledLanguage,
    applyEffectiveLocale,
    refreshOrganizationLocale,
    changeOrganizationLanguage
  };
}

exports.COMMON_NAMESPACE = COMMON_NAMESPACE;
exports.commonResources = commonResources;
exports.commonTranslations = commonTranslations;
exports.createI18n = createI18n;
exports.createOrganizationLocale = createOrganizationLocale;
exports.localeIdentity = localeIdentity;
exports.normalizeLanguage = normalizeLanguage;

import { Resource, i18n, InitOptions } from 'i18next';

var active = "Active";
var add = "Add";
var asset = "Asset";
var back = "Back";
var cancel = "Cancel";
var close = "Close";
var confirm = "Confirm";
var created_on = "Created on";
var dark = "Dark";
var edit = "Edit";
var email = "Email";
var home = "Home";
var light = "Light";
var loading = "Loading...";
var logout = "Logout";
var na = "NA";
var name = "Name";
var next = "Next";
var no = "No";
var no_data = "There is nothing here";
var open = "Open";
var profile = "Profile";
var save = "Save";
var search = "Search";
var settings = "Settings";
var status = "Status";
var submit = "Submit";
var support = "Support";
var switch_organization = "Switch organization";
var system = "System";
var version = "Version";
var yes = "Yes";
var en = {
	active: active,
	add: add,
	asset: asset,
	back: back,
	cancel: cancel,
	close: close,
	confirm: confirm,
	created_on: created_on,
	dark: dark,
	"delete": "Delete",
	edit: edit,
	email: email,
	home: home,
	light: light,
	loading: loading,
	logout: logout,
	na: na,
	name: name,
	next: next,
	no: no,
	no_data: no_data,
	open: open,
	profile: profile,
	save: save,
	search: search,
	settings: settings,
	status: status,
	submit: submit,
	support: support,
	switch_organization: switch_organization,
	system: system,
	version: version,
	yes: yes
};

declare const COMMON_NAMESPACE = "common";
declare const commonTranslations: {
    ar: {
        active: string;
        add: string;
        asset: string;
        back: string;
        cancel: string;
        close: string;
        confirm: string;
        created_on: string;
        dark: string;
        delete: string;
        edit: string;
        email: string;
        home: string;
        light: string;
        loading: string;
        logout: string;
        na: string;
        name: string;
        next: string;
        no: string;
        no_data: string;
        open: string;
        profile: string;
        save: string;
        search: string;
        settings: string;
        status: string;
        submit: string;
        support: string;
        switch_organization: string;
        system: string;
        version: string;
        yes: string;
    };
    en: {
        active: string;
        add: string;
        asset: string;
        back: string;
        cancel: string;
        close: string;
        confirm: string;
        created_on: string;
        dark: string;
        delete: string;
        edit: string;
        email: string;
        home: string;
        light: string;
        loading: string;
        logout: string;
        na: string;
        name: string;
        next: string;
        no: string;
        no_data: string;
        open: string;
        profile: string;
        save: string;
        search: string;
        settings: string;
        status: string;
        submit: string;
        support: string;
        switch_organization: string;
        system: string;
        version: string;
        yes: string;
    };
    es: {
        active: string;
        add: string;
        asset: string;
        back: string;
        cancel: string;
        close: string;
        confirm: string;
        created_on: string;
        dark: string;
        delete: string;
        edit: string;
        email: string;
        home: string;
        light: string;
        loading: string;
        logout: string;
        na: string;
        name: string;
        next: string;
        no: string;
        no_data: string;
        open: string;
        profile: string;
        save: string;
        search: string;
        settings: string;
        status: string;
        submit: string;
        support: string;
        switch_organization: string;
        system: string;
        version: string;
        yes: string;
    };
};
type CommonLanguage = keyof typeof commonTranslations;
type CommonKey = keyof typeof en;
/** Mergeable i18next resource bundle; apps deep-merge it under the `common` namespace. */
declare const commonResources: {
    ar: {
        common: {
            active: string;
            add: string;
            asset: string;
            back: string;
            cancel: string;
            close: string;
            confirm: string;
            created_on: string;
            dark: string;
            delete: string;
            edit: string;
            email: string;
            home: string;
            light: string;
            loading: string;
            logout: string;
            na: string;
            name: string;
            next: string;
            no: string;
            no_data: string;
            open: string;
            profile: string;
            save: string;
            search: string;
            settings: string;
            status: string;
            submit: string;
            support: string;
            switch_organization: string;
            system: string;
            version: string;
            yes: string;
        };
    };
    en: {
        common: {
            active: string;
            add: string;
            asset: string;
            back: string;
            cancel: string;
            close: string;
            confirm: string;
            created_on: string;
            dark: string;
            delete: string;
            edit: string;
            email: string;
            home: string;
            light: string;
            loading: string;
            logout: string;
            na: string;
            name: string;
            next: string;
            no: string;
            no_data: string;
            open: string;
            profile: string;
            save: string;
            search: string;
            settings: string;
            status: string;
            submit: string;
            support: string;
            switch_organization: string;
            system: string;
            version: string;
            yes: string;
        };
    };
    es: {
        common: {
            active: string;
            add: string;
            asset: string;
            back: string;
            cancel: string;
            close: string;
            confirm: string;
            created_on: string;
            dark: string;
            delete: string;
            edit: string;
            email: string;
            home: string;
            light: string;
            loading: string;
            logout: string;
            na: string;
            name: string;
            next: string;
            no: string;
            no_data: string;
            open: string;
            profile: string;
            save: string;
            search: string;
            settings: string;
            status: string;
            submit: string;
            support: string;
            switch_organization: string;
            system: string;
            version: string;
            yes: string;
        };
    };
};

type Direction = 'ltr' | 'rtl';
type I18nPlugin = Parameters<i18n['use']>[0];
/** Synchronous key/value storage; `localStorage` satisfies it. */
type I18nSyncStorage = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};
type CreateI18nOptions = {
    resources: Resource;
    /** Defaults to the shared i18next singleton. */
    instance?: i18n;
    /** Passed to `instance.use()` in order; apps supply `initReactI18next`. */
    plugins?: I18nPlugin[];
    /** Defaults to the keys of `resources`. */
    supportedLngs?: readonly string[];
    fallbackLng?: string;
    /** Overrides the persisted/detected boot language. */
    lng?: string;
    debug?: boolean;
    /** 'native' leaves `lng` unset so the organization-locale runtime owns it. */
    platform?: 'web' | 'native';
    /** `null` disables persistence; omitted falls back to `localStorage` when reachable. */
    storage?: I18nSyncStorage | null;
    storageKey?: string;
    persistOnChange?: boolean;
    /** RN apps pass an `I18nManager` applier; the default writes `<html lang|dir>`. */
    applyDirection?: (language: string, dir: Direction) => void;
    /** Merged last, so it can override any default init option. */
    initOptions?: InitOptions;
};
/** Boots an i18next instance and keeps document direction and the stored language in sync. */
declare function createI18n(options: CreateI18nOptions): i18n;

/** Reduces a BCP-47 tag to a supported base tag, falling back when unrecognised. */
declare function normalizeLanguage<T extends string>(value: string | null | undefined, supported: readonly T[], fallback: T): T;

type LocaleTranslations = {
    [key: string]: string | LocaleTranslations;
};
type EffectiveLocale = {
    application: string;
    requested_language: string;
    resolved_language: string;
    available_languages: string[];
    revision: string;
    translations: LocaleTranslations;
};
type LocaleIdentity = {
    userId: string | number;
    organizationId: string | number;
};
type LocaleUser = {
    user_id?: string | number;
    id?: string | number;
    organization_id?: string | number;
    organization?: string | number;
    preferred_language?: string;
};
/** The subset of envoy-ts-auth's `LocaleRuntime` this module drives. */
interface LocaleRuntimeLike {
    setActiveIdentity(identity: LocaleIdentity | null): void;
    hydrate(identity: LocaleIdentity, language: string): Promise<{
        locale: EffectiveLocale;
    } | null>;
    refreshEffective(identity: LocaleIdentity, language: string): Promise<{
        locale: EffectiveLocale;
    }>;
    setPreferredLanguage(identity: LocaleIdentity, language: string): Promise<boolean>;
    reconcilePendingLanguage(identity: LocaleIdentity): Promise<boolean>;
}
/** Asynchronous storage contract shared by `createBrowserLocaleStorage` and AsyncStorage. */
type LocaleAsyncStorage = {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
};
type OrganizationLocaleConfig = {
    i18n: i18n;
    storage: LocaleAsyncStorage;
    /** Called again whenever the trailing-slash-trimmed API origin changes. */
    createRuntime: (apiBaseUrl: string) => LocaleRuntimeLike;
    getApiBaseUrl: () => string | null | undefined;
    languageKey?: string;
    namespace?: string;
    pendingKeyPrefix?: string;
    defaultLanguage?: string;
};
type OrganizationLocale = {
    getLocaleRuntime: () => LocaleRuntimeLike | null;
    clearActiveIdentity: () => void;
    applyLanguage: (language: string) => Promise<void>;
    hydrateBundledLanguage: () => Promise<string>;
    applyEffectiveLocale: (locale: EffectiveLocale) => Promise<void>;
    refreshOrganizationLocale: (user: LocaleUser, requestedLanguage?: string) => Promise<EffectiveLocale | null>;
    changeOrganizationLanguage: (language: string) => Promise<void>;
};
declare function localeIdentity(user: LocaleUser | null | undefined): LocaleIdentity | null;
/** Identity-scoped organization locale coordinator; one instance per app. */
declare function createOrganizationLocale(config: OrganizationLocaleConfig): OrganizationLocale;

export { COMMON_NAMESPACE, type CommonKey, type CommonLanguage, type CreateI18nOptions, type Direction, type EffectiveLocale, type I18nPlugin, type I18nSyncStorage, type LocaleAsyncStorage, type LocaleIdentity, type LocaleRuntimeLike, type LocaleTranslations, type LocaleUser, type OrganizationLocale, type OrganizationLocaleConfig, commonResources, commonTranslations, createI18n, createOrganizationLocale, localeIdentity, normalizeLanguage };

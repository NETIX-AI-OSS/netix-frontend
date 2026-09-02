import { C as CurrentUser } from './current-user-B0Z0_kAv.js';

type SetSearchParams = (next: URLSearchParams, options?: {
    replace?: boolean;
}) => void;
/** The smallest binding needed by URL-backed hooks; adapters can come from any router. */
type SearchParamsBinding = readonly [URLSearchParams, SetSearchParams];
type Updater<T> = T | ((old: T) => T);
declare const applyUpdater: <T>(updater: Updater<T>, previous: T) => T;

/** The shared signed-in user query used by shell, permissions and feature code. */
declare function useCurrentUser(): {
    user: CurrentUser | null;
    isLoading: boolean;
};

/** Permission state derived from the shared current-user contract; loading is fail-closed. */
declare function usePermissions(): {
    user: CurrentUser | null;
    permissions: Set<string>;
    isSuperuser: boolean;
    isLoaded: boolean;
    hasPermission: (code: string) => boolean;
};

type PaginationState = {
    pageIndex: number;
    pageSize: number;
};
type UrlPaginationOptions = {
    pageIndex?: number;
    pageSize?: number;
    pageIndexParam?: string;
    pageSizeParam?: string;
};
/** URL-backed pagination state without a dependency on a specific router. */
declare function useUrlPagination(binding: SearchParamsBinding, options?: UrlPaginationOptions): {
    pagination: PaginationState;
    updatePagination: (updater: Updater<PaginationState>) => void;
};

type UrlTabOptions = {
    param?: string;
    clearOnChange?: string[];
};
/** URL-backed tab state without importing a router. */
declare function useUrlTab(binding: SearchParamsBinding, options?: UrlTabOptions): {
    tab: string | undefined;
    updateTab: (updater: Updater<string | undefined>) => void;
};

export { type PaginationState, type SearchParamsBinding, type SetSearchParams, type Updater, type UrlPaginationOptions, type UrlTabOptions, applyUpdater, useCurrentUser, usePermissions, useUrlPagination, useUrlTab };

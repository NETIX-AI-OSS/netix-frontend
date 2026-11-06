import { PermissionsState } from './hooks/permissions.js';
export { usePermissionsFrom } from './hooks/permissions.js';
import { CurrentUser } from './auth.js';

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
declare function usePermissions(): PermissionsState;

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

export { PermissionsState, applyUpdater, useCurrentUser, usePermissions, useUrlPagination, useUrlTab };
export type { PaginationState, SearchParamsBinding, SetSearchParams, Updater, UrlPaginationOptions, UrlTabOptions };

import * as react from 'react';
import { ReactNode } from 'react';

type SetSearchParams = (next: URLSearchParams, options?: {
    replace?: boolean;
}) => void;
/** Structurally what react-router's `useSearchParams()` returns, so apps can pass it straight through. */
type SearchParamsBinding = readonly [URLSearchParams, SetSearchParams];
type Updater<T> = T | ((old: T) => T);
declare const applyUpdater: <T>(updater: Updater<T>, previous: T) => T;

declare function useDelayedLoading(isLoading: boolean, delayMs?: number): boolean;

type FilterValues = Record<string, unknown>;
type FiltersOptions = {
    /** Namespaces the URL param; anything other than 'filters' also stops the pageIndex reset. */
    filterKey?: string;
    /** viz treats created_on__lte as an exclusive bound and shifts it a day; cafm does not. */
    inclusiveEndDate?: boolean;
};
declare function useFilters(binding: SearchParamsBinding, options?: FiltersOptions): {
    raw: FilterValues | undefined;
    filters: FilterValues;
    updateFilters: (updater: Updater<FilterValues | undefined>) => void;
    isLoading: boolean;
};

declare const MOBILE_BREAKPOINT = 768;
declare function useIsMobile(): boolean;

type PaginationState = {
    pageIndex: number;
    pageSize: number;
};
type PaginationOptions = {
    pageIndex?: number;
    pageSize?: number;
};
declare function usePagination(binding: SearchParamsBinding, { pageIndex, pageSize }?: PaginationOptions): {
    pagination: PaginationState;
    updatePagination: (updater: Updater<PaginationState>) => void;
};

type PermissionGroup = {
    permissions?: unknown[] | null;
} | null | undefined;
type PermissionUser = {
    permissions?: unknown[] | null;
    groups_detailed?: Record<string, PermissionGroup> | null;
    is_superuser?: boolean | null;
};
type CurrentUserState = {
    user?: PermissionUser | null;
    isLoading?: boolean;
};
/** Apps bind this to envoy-ts-auth's current-user hook; the package never imports auth itself. */
type UseCurrentUser = () => CurrentUserState;
/** Unions the flat `permissions` array with per-group permissions into one set of bare codenames. */
declare const derivePermissions: (user?: PermissionUser | null) => Set<string>;
declare function configurePermissions(useCurrentUser: UseCurrentUser): void;
type PermissionsOptions = {
    useCurrentUser?: UseCurrentUser;
    /** asset-ui's documented contract — the backend enforces authoritatively; default is fail-closed. */
    failOpen?: boolean;
};
declare function usePermissions(options?: PermissionsOptions): {
    permissions: Set<string>;
    isSuperuser: boolean;
    isLoaded: boolean;
    hasPermission: (code: string) => boolean;
};
type PermissionGateProps = PermissionsOptions & {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
};
declare function PermissionGate({ permission, children, fallback, ...options }: PermissionGateProps): react.JSX.Element;

declare function useResizeObserver(ref: HTMLElement | null): {
    width: number;
    height: number;
};

type TabsOptions = {
    /** Params dropped whenever the tab changes; cafm passes ['filters']. */
    clearOnChange?: string[];
};
declare function useTabs(binding: SearchParamsBinding, options?: TabsOptions): {
    tab: string | undefined;
    updateTab: (updater: Updater<string | undefined>) => void;
};

type EpochRange = {
    from: number | undefined;
    to: number | undefined;
};
/** Structurally react-day-picker's DateRange, without taking the dependency. */
type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};
/** Fixed epoch for "Overall" start: 2022-01-01 00:00:00 UTC. */
declare const OVERALL_FROM_EPOCH = 1640995200;
declare const TIME_DURATIONS: {
    LAST_30_DAYS: number;
    LAST_6_MONTHS: number;
    LAST_1_YEAR: number;
    SIX_HOURS: number;
    TWELVE_HOURS: number;
    TWENTY_FOUR_HOURS: number;
    SEVEN_DAYS: number;
    OVERALL: number;
};
declare const DURATION_OPTIONS: {
    value: string;
    label: string;
    labelKey: string;
}[];
declare function getDuration(from?: number | string | null, to?: number | string | null): number;
declare function getEpochfromDuration(hrs: number, anchor?: boolean, referenceDate?: Date): {
    from: Date;
    to: Date;
};
declare function getCurrentMonthEpochRange(referenceDate?: Date): EpochRange;
declare function getYesterdayEpochRange(referenceDate?: Date): {
    from: Date;
    to: Date;
};
declare function getLastDaysEpochRange(days: number, referenceDate?: Date): {
    from: Date;
    to: Date;
};
declare function getQuickDurationRange(hrs: number, referenceDate?: Date): {
    from: Date;
    to: Date;
};
declare function getFullDayRange(range?: DateRange): DateRange | undefined;
declare function getEpochRange(range?: EpochRange | DateRange): EpochRange;
declare function getDateRange(range?: EpochRange | DateRange): DateRange;
type TimeRangeOptions = {
    enabled?: boolean;
};
declare function useTimeRange(binding: SearchParamsBinding, defaultRange?: EpochRange, options?: TimeRangeOptions): {
    epoch: {
        from: number | undefined;
        to: number | undefined;
    };
    duration: number;
    updateTimeRange: (range: EpochRange | DateRange) => void;
    updateTimeDuration: (hrs: number) => void;
};

export { type CurrentUserState, DURATION_OPTIONS, type DateRange, type EpochRange, type FilterValues, type FiltersOptions, MOBILE_BREAKPOINT, OVERALL_FROM_EPOCH, type PaginationOptions, type PaginationState, PermissionGate, type PermissionGateProps, type PermissionGroup, type PermissionUser, type PermissionsOptions, type SearchParamsBinding, type SetSearchParams, TIME_DURATIONS, type TabsOptions, type TimeRangeOptions, type Updater, type UseCurrentUser, applyUpdater, configurePermissions, derivePermissions, getCurrentMonthEpochRange, getDateRange, getDuration, getEpochRange, getEpochfromDuration, getFullDayRange, getLastDaysEpochRange, getQuickDurationRange, getYesterdayEpochRange, useDelayedLoading, useFilters, useIsMobile, usePagination, usePermissions, useResizeObserver, useTabs, useTimeRange };

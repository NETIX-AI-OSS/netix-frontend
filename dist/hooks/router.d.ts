import { a as FiltersOptions, F as FilterValues, U as Updater, S as SearchParamsBinding } from '../use-filters-avvyFRIp.js';

type EpochRange = {
    from: number | undefined;
    to: number | undefined;
};
/** Structurally react-day-picker's DateRange, without taking the dependency. */
type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};
type TimeRangeOptions = {
    enabled?: boolean;
};

type PaginationState = {
    pageIndex: number;
    pageSize: number;
};
type PaginationOptions = {
    pageIndex?: number;
    pageSize?: number;
};

type TabsOptions = {
    /** Params dropped whenever the tab changes; cafm passes ['filters']. */
    clearOnChange?: string[];
};

/** react-router is an optional peer, so this entry is never reachable from the RN-safe ./hooks barrel. */
declare function useSearchParamsBinding(): SearchParamsBinding;
declare const useRouterPagination: (options?: PaginationOptions) => {
    pagination: PaginationState;
    updatePagination: (updater: Updater<PaginationState>) => void;
};
declare const useRouterTabs: (options?: TabsOptions) => {
    tab: string | undefined;
    updateTab: (updater: Updater<string | undefined>) => void;
};
declare const useRouterFilters: (options?: FiltersOptions) => {
    raw: FilterValues | undefined;
    filters: FilterValues;
    updateFilters: (updater: Updater<FilterValues | undefined>) => void;
    isLoading: boolean;
};
declare const useRouterTimeRange: (defaultRange?: EpochRange, options?: TimeRangeOptions) => {
    epoch: {
        from: number | undefined;
        to: number | undefined;
    };
    duration: number;
    updateTimeRange: (range: EpochRange | DateRange) => void;
    updateTimeDuration: (hrs: number) => void;
};

export { useRouterFilters, useRouterPagination, useRouterTabs, useRouterTimeRange, useSearchParamsBinding };

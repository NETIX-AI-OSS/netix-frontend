type SetSearchParams = (next: URLSearchParams, options?: {
    replace?: boolean;
}) => void;
/** Structurally what react-router's `useSearchParams()` returns, so apps can pass it straight through. */
type SearchParamsBinding = readonly [URLSearchParams, SetSearchParams];
type Updater<T> = T | ((old: T) => T);

type FilterValues = Record<string, unknown>;
type FiltersOptions = {
    /** Namespaces the URL param; anything other than 'filters' also stops the pageIndex reset. */
    filterKey?: string;
    /** viz treats created_on__lte as an exclusive bound and shifts it a day; cafm does not. */
    inclusiveEndDate?: boolean;
};

export type { FilterValues as F, SearchParamsBinding as S, Updater as U, FiltersOptions as a };

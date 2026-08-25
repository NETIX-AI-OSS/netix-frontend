import { FieldValues } from 'react-hook-form';
import { F as FilterValues, U as Updater } from './use-filters-avvyFRIp.js';

type FilterOption = {
    label: string;
    value: string;
};
type UseListHook = (params: Record<string, unknown>, options: Record<string, {
    enabled: boolean;
}>) => {
    data?: unknown;
    isLoading?: boolean;
};
type UseOptionsHook = (data: unknown) => FilterOption[];
type ColumnFilterMeta = {
    key: string;
    useList?: UseListHook;
    useOptions?: UseOptionsHook;
    options?: FilterOption[];
    multiple?: boolean;
    transformer?: (f?: FieldValues) => Promise<FieldValues | undefined>;
    sort?: string;
};
type ColumnMeta = {
    filter?: ColumnFilterMeta;
    headerClassName?: string;
    cellClassName?: string;
};
type ColumnFilterLabels = {
    search: string;
    reset: string;
    noDataFound: string;
};
declare const DEFAULT_COLUMN_FILTER_LABELS: ColumnFilterLabels;
declare const DEBOUNCE_DELAY_MS = 800;
type FilterContext = {
    filters?: FilterValues;
    updateFilters: (updater: Updater<FilterValues | undefined>) => void;
    listParams?: Record<string, unknown>;
    queryOptionKey?: string;
    debounceMs?: number;
    labels?: Partial<ColumnFilterLabels>;
    translateOptionLabel?: (label: string) => string;
    onError?: (error: unknown) => void;
};

export { type ColumnFilterLabels as C, DEBOUNCE_DELAY_MS as D, type FilterContext as F, type UseListHook as U, type ColumnFilterMeta as a, type ColumnMeta as b, DEFAULT_COLUMN_FILTER_LABELS as c, type FilterOption as d, type UseOptionsHook as e };

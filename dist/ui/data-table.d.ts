import * as React$1 from 'react';
import { CSSProperties, ReactNode } from 'react';
import { RowData } from '@tanstack/react-table';
import { LegacyTable, LegacyRow } from '@tanstack/react-table/legacy';
import { F as FilterContext } from '../data-table-types-C-9Y7tAB.js';
export { b as ColumnMeta } from '../data-table-types-C-9Y7tAB.js';
import 'react-hook-form';
import '../use-filters-YRiDTw8g.js';

type RowWrapperProps<TData extends RowData> = React.HTMLAttributes<HTMLTableRowElement> & {
    row: LegacyRow<TData>;
    children: React.ReactNode;
};
type TranslateHeader = (header: string, columnId: string) => ReactNode;
type DataTableProps<TData extends RowData> = {
    table: LegacyTable<TData>;
    onRowClick?: (row: LegacyRow<TData>) => void;
    renderSubComponent?: (props: {
        row: LegacyRow<TData>;
    }) => React.ReactElement;
    className?: string;
    rowClassName?: (row: LegacyRow<TData>) => string;
    style?: CSSProperties;
    loading?: boolean;
    loadingMode?: 'skeleton' | 'overlay';
    loadingRowCount?: number;
    heightAuto?: boolean;
    filtering?: FilterContext;
    RowWrapper?: React.ComponentType<RowWrapperProps<TData>>;
    translateHeader?: TranslateHeader;
    clearFiltersLabel?: string;
    EmptyComponent?: React.ComponentType;
    LoadingComponent?: React.ComponentType;
};
declare function DataTable<TData extends RowData>({ table, onRowClick, renderSubComponent, className, rowClassName, style, loading, loadingMode, loadingRowCount, heightAuto, filtering, RowWrapper, translateHeader, clearFiltersLabel, EmptyComponent, LoadingComponent, }: DataTableProps<TData>): React$1.JSX.Element;

export { DataTable, type DataTableProps, type RowWrapperProps, type TranslateHeader };

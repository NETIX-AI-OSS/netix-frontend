import * as React from 'react';
import { RowData } from '@tanstack/react-table';
import { LegacyReactTable } from '@tanstack/react-table/legacy';

type PaginationControlsProps<TData extends RowData> = {
    table: LegacyReactTable<TData>;
    className?: string;
    showTotalCount?: boolean;
    totalCountLabel?: string;
    pageSizeOptions?: number[];
    pageSizePlaceholder?: string;
    pageLabel?: string;
};
declare function PaginationControls<TData extends RowData>({ table, className, showTotalCount, totalCountLabel, pageSizeOptions, pageSizePlaceholder, pageLabel, }: PaginationControlsProps<TData>): React.JSX.Element;

export { PaginationControls, type PaginationControlsProps };

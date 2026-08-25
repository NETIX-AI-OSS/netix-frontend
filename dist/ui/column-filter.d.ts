import * as React from 'react';
import { RowData } from '@tanstack/react-table';
import { LegacyColumn } from '@tanstack/react-table/legacy';
import { F as FilterContext } from '../data-table-types-C-9Y7tAB.js';
import 'react-hook-form';
import '../use-filters-YRiDTw8g.js';

type ColumnFilterProps = {
    column: LegacyColumn<RowData, unknown>;
    filtering: FilterContext;
};
declare function ColumnFilter({ column, filtering }: ColumnFilterProps): React.JSX.Element;

export { ColumnFilter, type ColumnFilterProps };

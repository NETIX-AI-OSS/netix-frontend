import * as React from 'react';
import { d as FilterOption } from '../data-table-types-BT147DY9.js';
import 'react-hook-form';
import '../use-filters-avvyFRIp.js';

type ComboboxLabels = {
    select: string;
    search: string;
    noDataFound: string;
};
type ComboboxProps = Omit<React.ComponentProps<'button'>, 'value' | 'onChange'> & {
    options: FilterOption[];
    onValueChange: (value?: string) => void;
    value?: string;
    placeholder?: string;
    loading?: boolean;
    modalPopover?: boolean;
    labels?: Partial<ComboboxLabels>;
};
declare function Combobox({ value, onValueChange, options, placeholder, loading, modalPopover, labels, ...props }: ComboboxProps): React.JSX.Element;

export { Combobox, type ComboboxLabels, type ComboboxProps };

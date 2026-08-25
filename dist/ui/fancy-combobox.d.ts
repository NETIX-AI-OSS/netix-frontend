import * as React from 'react';

type FancyComboboxOption = {
    label: string;
    value: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
};
type FancyComboboxLabels = {
    select: string;
    notAvailable: string;
    searchPlaceholder: string;
    noDataFound: string;
    typeToSearch: string;
    selectAll: string;
    loading: string;
    loadMore: string;
};
type FancyComboboxProps = Omit<React.ComponentProps<'button'>, 'value' | 'onChange'> & {
    options: FancyComboboxOption[];
    onValueChange: (value: string[]) => void;
    value?: string[];
    onSearchValueChange?: (value: string) => void;
    placeholder?: string;
    maxCount?: number;
    modalPopover?: boolean;
    multiple?: boolean;
    loading?: boolean;
    disableClear?: boolean;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    onLoadMore?: () => void;
    labels?: Partial<FancyComboboxLabels>;
};
declare function FancyCombobox({ options, onValueChange, onSearchValueChange, multiple, loading, value, placeholder, maxCount, modalPopover, className, disableClear, hasNextPage, isFetchingNextPage, onLoadMore, labels, ...props }: FancyComboboxProps): React.JSX.Element;

export { FancyCombobox, type FancyComboboxLabels, type FancyComboboxOption, type FancyComboboxProps };

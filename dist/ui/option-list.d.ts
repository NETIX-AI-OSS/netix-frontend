import * as React from 'react';

type OptionListItem = {
    key: string;
    /** What the built-in search matches against. */
    text: string;
    content: React.ReactNode;
    selected?: boolean;
    className?: string;
    onSelect: () => void;
};
type OptionListProps = {
    items: OptionListItem[];
    placeholder: string;
    empty: React.ReactNode;
    /** Provide to take over searching (remote); omitted means the list filters itself. */
    searchValue?: string;
    onSearchValueChange?: (value: string) => void;
    onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
};
declare function OptionList({ items, placeholder, empty, searchValue, onSearchValueChange, onSearchKeyDown, header, footer, className, }: OptionListProps): React.JSX.Element;

export { OptionList, type OptionListItem, type OptionListProps };

import * as React from 'react';

type TreeViewItem<TData = unknown> = {
    id: string;
    label: string;
    children?: TreeViewItem<TData>[];
    data?: TData;
    hasChildren?: boolean;
    childrenLoaded?: boolean;
};
type TreeViewLabels = {
    collapse: (label: string) => string;
    expand: (label: string) => string;
    loadingChildren: string;
    noChildNodes: string;
};
type TreeViewProps<TData = unknown> = {
    items: TreeViewItem<TData>[];
    selectedId?: string;
    onItemSelect?: (item: TreeViewItem<TData>) => void;
    onItemToggle?: (item: TreeViewItem<TData>, expanded: boolean) => void;
    className?: string;
    emptyText?: string;
    defaultExpandAll?: boolean;
    loadingItemIds?: string[];
    labels?: Partial<TreeViewLabels>;
};
declare const TreeView: <TData>({ items, selectedId, onItemSelect, onItemToggle, className, emptyText, defaultExpandAll, loadingItemIds, labels, }: TreeViewProps<TData>) => React.JSX.Element;

export { TreeView, type TreeViewItem, type TreeViewLabels, type TreeViewProps };

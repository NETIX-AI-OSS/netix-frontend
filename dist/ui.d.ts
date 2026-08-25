import * as React$1 from 'react';
import { CSSProperties, ReactNode } from 'react';
import { RowData } from '@tanstack/react-table';
import { LegacyColumn, LegacyTable, LegacyRow, LegacyReactTable } from '@tanstack/react-table/legacy';
import * as react_hook_form from 'react-hook-form';
import { FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import { a as FilterValues, U as Updater } from './use-filters-YRiDTw8g.js';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { ToasterProps } from 'sonner';
export { ToasterProps } from 'sonner';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

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

type ColumnFilterProps = {
    column: LegacyColumn<RowData, unknown>;
    filtering: FilterContext;
};
declare function ColumnFilter({ column, filtering }: ColumnFilterProps): React$1.JSX.Element;

type ComboboxLabels = {
    select: string;
    search: string;
    noDataFound: string;
};
type ComboboxProps = Omit<React$1.ComponentProps<'button'>, 'value' | 'onChange'> & {
    options: FilterOption[];
    onValueChange: (value?: string) => void;
    value?: string;
    placeholder?: string;
    loading?: boolean;
    modalPopover?: boolean;
    labels?: Partial<ComboboxLabels>;
};
declare function Combobox({ value, onValueChange, options, placeholder, loading, modalPopover, labels, ...props }: ComboboxProps): React$1.JSX.Element;

declare function Accordion({ ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Root>): React$1.JSX.Element;
declare function AccordionItem({ className, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Item>): React$1.JSX.Element;
declare function AccordionTrigger({ className, children, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Trigger>): React$1.JSX.Element;
declare function AccordionContent({ className, children, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Content>): React$1.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: React$1.ComponentProps<'div'> & VariantProps<typeof alertVariants>): React$1.JSX.Element;
declare function AlertTitle({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function AlertDescription({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;

declare function AlertDialog({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Root>): React$1.JSX.Element;
declare function AlertDialogTrigger({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Trigger>): React$1.JSX.Element;
declare function AlertDialogPortal({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Portal>): React$1.JSX.Element;
declare function AlertDialogOverlay({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Overlay>): React$1.JSX.Element;
declare function AlertDialogContent({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Content>): React$1.JSX.Element;
declare function AlertDialogHeader({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function AlertDialogFooter({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function AlertDialogTitle({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Title>): React$1.JSX.Element;
declare function AlertDialogDescription({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Description>): React$1.JSX.Element;
declare function AlertDialogAction({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Action>): React$1.JSX.Element;
declare function AlertDialogCancel({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Cancel>): React$1.JSX.Element;

declare function Avatar({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Root>): React$1.JSX.Element;
declare function AvatarImage({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Image>): React$1.JSX.Element;
declare function AvatarFallback({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Fallback>): React$1.JSX.Element;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Badge({ className, variant, asChild, ...props }: React$1.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
}): React$1.JSX.Element;

declare function Breadcrumb({ ...props }: React$1.ComponentProps<'nav'>): React$1.JSX.Element;
declare function BreadcrumbList({ className, ...props }: React$1.ComponentProps<'ol'>): React$1.JSX.Element;
declare function BreadcrumbItem({ className, ...props }: React$1.ComponentProps<'li'>): React$1.JSX.Element;
declare function BreadcrumbLink({ asChild, className, ...props }: React$1.ComponentProps<'a'> & {
    asChild?: boolean;
}): React$1.JSX.Element;
declare function BreadcrumbPage({ className, ...props }: React$1.ComponentProps<'span'>): React$1.JSX.Element;
declare function BreadcrumbSeparator({ children, className, ...props }: React$1.ComponentProps<'li'>): React$1.JSX.Element;
declare function BreadcrumbEllipsis({ className, ...props }: React$1.ComponentProps<'span'>): React$1.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ButtonProps = React$1.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
declare function Button({ className, variant, size, asChild, ...props }: ButtonProps): React$1.JSX.Element;

declare function Card({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardHeader({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardTitle({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardDescription({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardAction({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardContent({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function CardFooter({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;

declare function Checkbox({ className, ...props }: React$1.ComponentProps<typeof CheckboxPrimitive.Root>): React$1.JSX.Element;

declare function Collapsible({ ...props }: React$1.ComponentProps<typeof CollapsiblePrimitive.Root>): React$1.JSX.Element;
declare function CollapsibleTrigger({ ...props }: React$1.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>): React$1.JSX.Element;
declare function CollapsibleContent({ ...props }: React$1.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>): React$1.JSX.Element;

declare function Dialog({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): React$1.JSX.Element;
declare function DialogTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): React$1.JSX.Element;
declare function DialogPortal({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Portal>): React$1.JSX.Element;
declare function DialogClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): React$1.JSX.Element;
declare function DialogOverlay({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Overlay>): React$1.JSX.Element;
type DialogContentProps = React$1.ComponentProps<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
    hideClose?: boolean;
};
declare function DialogContent({ className, children, overlayClassName, hideClose, ...props }: DialogContentProps): React$1.JSX.Element;
declare function DialogHeader({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function DialogFooter({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function DialogTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): React$1.JSX.Element;
declare function DialogDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): React$1.JSX.Element;

declare function DropdownMenu({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Root>): React$1.JSX.Element;
declare function DropdownMenuPortal({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Portal>): React$1.JSX.Element;
declare function DropdownMenuTrigger({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Trigger>): React$1.JSX.Element;
declare function DropdownMenuContent({ className, sideOffset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Content>): React$1.JSX.Element;
declare function DropdownMenuGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Group>): React$1.JSX.Element;
declare function DropdownMenuItem({ className, inset, variant, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
}): React$1.JSX.Element;
declare function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>): React$1.JSX.Element;
declare function DropdownMenuRadioGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>): React$1.JSX.Element;
declare function DropdownMenuRadioItem({ className, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>): React$1.JSX.Element;
declare function DropdownMenuLabel({ className, inset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}): React$1.JSX.Element;
declare function DropdownMenuSeparator({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Separator>): React$1.JSX.Element;
declare function DropdownMenuShortcut({ className, ...props }: React$1.ComponentProps<'span'>): React$1.JSX.Element;
declare function DropdownMenuSub({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Sub>): React$1.JSX.Element;
declare function DropdownMenuSubTrigger({ className, inset, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}): React$1.JSX.Element;
declare function DropdownMenuSubContent({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubContent>): React$1.JSX.Element;

declare function HoverCard({ ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Root>): React$1.JSX.Element;
declare function HoverCardTrigger({ ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Trigger>): React$1.JSX.Element;
declare function HoverCardContent({ className, align, sideOffset, ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Content>): React$1.JSX.Element;

declare function Input({ className, type, ...props }: React$1.ComponentProps<'input'>): React$1.JSX.Element;

declare function Label({ className, ...props }: React$1.ComponentProps<typeof LabelPrimitive.Root>): React$1.JSX.Element;

declare function NavigationMenu({ className, children, viewport, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean;
}): React$1.JSX.Element;
declare function NavigationMenuList({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.List>): React$1.JSX.Element;
declare function NavigationMenuItem({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Item>): React$1.JSX.Element;
declare const navigationMenuTriggerStyle: (props?: class_variance_authority_types.ClassProp | undefined) => string;
declare function NavigationMenuTrigger({ className, children, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Trigger>): React$1.JSX.Element;
declare function NavigationMenuContent({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Content>): React$1.JSX.Element;
declare function NavigationMenuViewport({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Viewport>): React$1.JSX.Element;
declare function NavigationMenuLink({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Link>): React$1.JSX.Element;
declare function NavigationMenuIndicator({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Indicator>): React$1.JSX.Element;

declare function Pagination({ className, ...props }: React$1.ComponentProps<'nav'>): React$1.JSX.Element;
declare function PaginationContent({ className, ...props }: React$1.ComponentProps<'ul'>): React$1.JSX.Element;
declare function PaginationItem({ ...props }: React$1.ComponentProps<'li'>): React$1.JSX.Element;
type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React$1.ComponentProps<typeof Button>, 'size'> & React$1.ComponentProps<'a'>;
declare function PaginationLink({ className, isActive, size, ...props }: PaginationLinkProps): React$1.JSX.Element;
declare function PaginationPrevious({ className, ...props }: React$1.ComponentProps<typeof PaginationLink>): React$1.JSX.Element;
declare function PaginationNext({ className, ...props }: React$1.ComponentProps<typeof PaginationLink>): React$1.JSX.Element;
declare function PaginationEllipsis({ className, ...props }: React$1.ComponentProps<'span'>): React$1.JSX.Element;

declare function Popover({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Root>): React$1.JSX.Element;
declare function PopoverTrigger({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Trigger>): React$1.JSX.Element;
declare function PopoverContent({ className, align, sideOffset, ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Content>): React$1.JSX.Element;
declare function PopoverAnchor({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Anchor>): React$1.JSX.Element;

declare function Progress({ className, value, ...props }: React$1.ComponentProps<typeof ProgressPrimitive.Root>): React$1.JSX.Element;

declare function RadioGroup({ className, ...props }: React$1.ComponentProps<typeof RadioGroupPrimitive.Root>): React$1.JSX.Element;
declare function RadioGroupItem({ className, ...props }: React$1.ComponentProps<typeof RadioGroupPrimitive.Item>): React$1.JSX.Element;

declare function ScrollArea({ className, children, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.Root>): React$1.JSX.Element;
declare function ScrollBar({ className, orientation, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>): React$1.JSX.Element;

declare function Select({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Root>): React$1.JSX.Element;
declare function SelectGroup({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Group>): React$1.JSX.Element;
declare function SelectValue({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Value>): React$1.JSX.Element;
declare function SelectTrigger({ className, size, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: 'sm' | 'default';
}): React$1.JSX.Element;
declare function SelectContent({ className, children, position, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Content>): React$1.JSX.Element;
declare function SelectLabel({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Label>): React$1.JSX.Element;
declare function SelectItem({ className, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Item>): React$1.JSX.Element;
declare function SelectSeparator({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Separator>): React$1.JSX.Element;
declare function SelectScrollUpButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): React$1.JSX.Element;
declare function SelectScrollDownButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): React$1.JSX.Element;

declare function Separator({ className, orientation, decorative, ...props }: React$1.ComponentProps<typeof SeparatorPrimitive.Root>): React$1.JSX.Element;

declare function Sheet({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): React$1.JSX.Element;
declare function SheetTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): React$1.JSX.Element;
declare function SheetClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): React$1.JSX.Element;
declare function SheetContent({ className, children, side, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Content> & {
    side?: 'top' | 'right' | 'bottom' | 'left';
}): React$1.JSX.Element;
declare function SheetHeader({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function SheetFooter({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function SheetTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): React$1.JSX.Element;
declare function SheetDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): React$1.JSX.Element;

type SkeletonProps = React$1.ComponentProps<'div'> & {
    animate?: boolean;
    variant?: 'block' | 'text' | 'circle';
};
declare function Skeleton({ className, animate, variant, ...props }: SkeletonProps): React$1.JSX.Element;

declare function Slider({ className, defaultValue, value, min, max, ...props }: React$1.ComponentProps<typeof SliderPrimitive.Root>): React$1.JSX.Element;

declare function Switch({ className, ...props }: React$1.ComponentProps<typeof SwitchPrimitive.Root>): React$1.JSX.Element;

declare function Table({ className, ...props }: React$1.ComponentProps<'table'>): React$1.JSX.Element;
declare function TableHeader({ className, ...props }: React$1.ComponentProps<'thead'>): React$1.JSX.Element;
declare function TableBody({ className, ...props }: React$1.ComponentProps<'tbody'>): React$1.JSX.Element;
declare function TableFooter({ className, ...props }: React$1.ComponentProps<'tfoot'>): React$1.JSX.Element;
declare function TableRow({ className, ...props }: React$1.ComponentProps<'tr'>): React$1.JSX.Element;
declare function TableHead({ className, ...props }: React$1.ComponentProps<'th'>): React$1.JSX.Element;
declare function TableCell({ className, ...props }: React$1.ComponentProps<'td'>): React$1.JSX.Element;
declare function TableCaption({ className, ...props }: React$1.ComponentProps<'caption'>): React$1.JSX.Element;

declare function Tabs({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Root>): React$1.JSX.Element;
declare function TabsList({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.List>): React$1.JSX.Element;
declare function TabsTrigger({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Trigger>): React$1.JSX.Element;
declare function TabsContent({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Content>): React$1.JSX.Element;

declare function Textarea({ className, ...props }: React$1.ComponentProps<'textarea'>): React$1.JSX.Element;

declare const toggleVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Toggle({ className, variant, size, ...props }: React$1.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>): React$1.JSX.Element;

declare function TooltipProvider({ delayDuration, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Provider>): React$1.JSX.Element;
declare function Tooltip({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Root>): React$1.JSX.Element;
declare function TooltipTrigger({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Trigger>): React$1.JSX.Element;
declare function TooltipContent({ className, sideOffset, children, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Content>): React$1.JSX.Element;

declare const typographyVariants: (props?: ({
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | null | undefined;
    affects?: "small" | "default" | "lead" | "large" | "muted" | "removePMargin" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TypographyProps = React$1.HTMLAttributes<HTMLHeadingElement> & VariantProps<typeof typographyVariants>;
declare function Typography({ className, variant, affects, ...props }: TypographyProps): React$1.JSX.Element;
declare function TypographyH1(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;
declare function TypographyH2(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;
declare function TypographyH3(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;
declare function TypographyH4(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;
declare function TypographyP(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;
declare function TypographyMuted(props: React$1.HTMLAttributes<HTMLHeadingElement>): React$1.JSX.Element;

type ConfirmModalProps = {
    onConfirm: () => void | Promise<void>;
    children: React.ReactNode;
    confirmVariant?: ButtonVariant;
    triggerVariant?: ButtonVariant;
    triggerIcon?: React.ElementType;
    triggerText?: string;
    triggerClassName?: string;
    trigger?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    permission?: string;
    hasPermission?: (permission: string) => boolean;
    showCancelButton?: boolean;
    disabled?: boolean;
};
declare function ConfirmModal({ onConfirm, children, confirmVariant, triggerVariant, triggerIcon: TriggerIcon, triggerText, triggerClassName, trigger, confirmText, cancelText, permission, hasPermission, showCancelButton, disabled, }: ConfirmModalProps): React$1.JSX.Element | null;

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

type EmptyStateProps = {
    text?: string;
    icon?: React.ReactNode;
    className?: string;
};
declare function EmptyState({ text, icon, className }: EmptyStateProps): React$1.JSX.Element;

type FancyComboboxOption = {
    label: string;
    value: string;
    icon?: React$1.ComponentType<{
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
type FancyComboboxProps = Omit<React$1.ComponentProps<'button'>, 'value' | 'onChange'> & {
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
declare function FancyCombobox({ options, onValueChange, onSearchValueChange, multiple, loading, value, placeholder, maxCount, modalPopover, className, disableClear, hasNextPage, isFetchingNextPage, onLoadMore, labels, ...props }: FancyComboboxProps): React$1.JSX.Element;

declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>({ children, watch, getValues, getErrors, getFieldState, setError, clearErrors, setValue, setValues, trigger, formState, resetField, reset, resetDefaultValues, handleSubmit, unregister, control, register, setFocus, subscribe, }: react_hook_form.FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React$1.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => React$1.JSX.Element;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: react_hook_form.FieldError | undefined;
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};
declare function FormItem({ className, ...props }: React$1.ComponentProps<'div'>): React$1.JSX.Element;
declare function FormLabel({ className, ...props }: React$1.ComponentProps<typeof LabelPrimitive.Root>): React$1.JSX.Element;
declare function FormControl({ ...props }: React$1.ComponentProps<typeof Slot>): React$1.JSX.Element;
declare function FormDescription({ className, ...props }: React$1.ComponentProps<'p'>): React$1.JSX.Element;
declare function FormMessage({ className, ...props }: React$1.ComponentProps<'p'>): React$1.JSX.Element | null;

type FormModalProps = {
    onSubmit: () => void | Promise<void | boolean>;
    children: React.ReactNode;
    onOpenChange?: (v: boolean) => void | Promise<void | boolean>;
    trigger?: React.ReactNode;
    header?: React.ReactNode;
    actionButtonText?: string;
    triggerButtonText?: string | React.ReactNode;
    cancelButtonText?: string;
    className?: string;
    overlayClassName?: string;
    permission?: string;
    hasPermission?: (permission: string) => boolean;
    open?: boolean;
    hideTrigger?: boolean;
    disabled?: boolean;
};
declare function FormModal({ onSubmit, onOpenChange, trigger, header, actionButtonText, triggerButtonText, cancelButtonText, className, overlayClassName, children, permission, hasPermission, open: externalOpen, hideTrigger, disabled, }: FormModalProps): React$1.JSX.Element | null;

type LoadingVariant = 'page' | 'route' | 'section' | 'card' | 'table' | 'chart' | 'inline' | 'button';
type LoadingStateProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: LoadingVariant;
    rows?: number;
    lines?: number;
    label?: string;
    /** @deprecated pass `variant` instead */
    size?: number;
    /** @deprecated no longer honoured */
    color?: string;
    /** @deprecated pass `variant='section'` instead */
    center?: boolean;
    /** @deprecated no longer honoured */
    name?: string;
};
declare function inferVariant({ variant, center, size, }: Pick<LoadingStateProps, 'variant' | 'center' | 'size'>): LoadingVariant;
declare function LoadingState({ variant, rows, lines, label, className, center, size, color, name, ...props }: LoadingStateProps): React$1.JSX.Element;

type OptionListItem = {
    key: string;
    /** What the built-in search matches against. */
    text: string;
    content: React$1.ReactNode;
    selected?: boolean;
    className?: string;
    onSelect: () => void;
};
type OptionListProps = {
    items: OptionListItem[];
    placeholder: string;
    empty: React$1.ReactNode;
    /** Provide to take over searching (remote); omitted means the list filters itself. */
    searchValue?: string;
    onSearchValueChange?: (value: string) => void;
    onSearchKeyDown?: (event: React$1.KeyboardEvent<HTMLInputElement>) => void;
    header?: React$1.ReactNode;
    footer?: React$1.ReactNode;
    className?: string;
};
declare function OptionList({ items, placeholder, empty, searchValue, onSearchValueChange, onSearchKeyDown, header, footer, className, }: OptionListProps): React$1.JSX.Element;

type PaginationControlsProps<TData extends RowData> = {
    table: LegacyReactTable<TData>;
    className?: string;
    showTotalCount?: boolean;
    totalCountLabel?: string;
    pageSizeOptions?: number[];
    pageSizePlaceholder?: string;
    pageLabel?: string;
};
declare function PaginationControls<TData extends RowData>({ table, className, showTotalCount, totalCountLabel, pageSizeOptions, pageSizePlaceholder, pageLabel, }: PaginationControlsProps<TData>): React$1.JSX.Element;

declare function Toaster({ theme, className, style, ...props }: ToasterProps): React$1.JSX.Element;

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
declare const TreeView: <TData>({ items, selectedId, onItemSelect, onItemToggle, className, emptyText, defaultExpandAll, loadingItemIds, labels, }: TreeViewProps<TData>) => React$1.JSX.Element;

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';
type ThemeProviderProps = {
    children: ReactNode;
    defaultTheme?: Theme;
    /** One key across the fleet so a user's choice follows them between NETIX apps. */
    storageKey?: string;
};
type ThemeProviderState = {
    /** The user's choice: an explicit theme, or "system" to follow the OS. */
    theme: Theme;
    /** The theme actually applied right now ("system" resolved against the OS). */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};
declare const THEME_STORAGE_KEY = "netix-theme";
declare function ThemeProvider({ children, defaultTheme, storageKey, }: ThemeProviderProps): React$1.JSX.Element;
declare const useTheme: () => ThemeProviderState;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, AlertTitle, Avatar, AvatarFallback, AvatarImage, Badge, Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button, type ButtonProps, type ButtonVariant, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, ColumnFilter, type ColumnFilterLabels, type ColumnFilterMeta, type ColumnFilterProps, type ColumnMeta, Combobox, type ComboboxLabels, type ComboboxProps, ConfirmModal, type ConfirmModalProps, DEBOUNCE_DELAY_MS, DEFAULT_COLUMN_FILTER_LABELS, DataTable, type DataTableProps, Dialog, DialogClose, DialogContent, type DialogContentProps, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, EmptyState, type EmptyStateProps, FancyCombobox, type FancyComboboxLabels, type FancyComboboxOption, type FancyComboboxProps, type FilterContext, type FilterOption, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormModal, type FormModalProps, HoverCard, HoverCardContent, HoverCardTrigger, Input, Label, LoadingState, type LoadingStateProps, type LoadingVariant, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, OptionList, type OptionListItem, type OptionListProps, Pagination, PaginationContent, PaginationControls, type PaginationControlsProps, PaginationEllipsis, PaginationItem, PaginationLink, type PaginationLinkProps, PaginationNext, PaginationPrevious, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Progress, RadioGroup, RadioGroupItem, type ResolvedTheme, type RowWrapperProps, ScrollArea, ScrollBar, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Separator, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, type SkeletonProps, Slider, Switch, THEME_STORAGE_KEY, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, type Theme, ThemeProvider, type ThemeProviderProps, type ThemeProviderState, Toaster, Toggle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TranslateHeader, TreeView, type TreeViewItem, type TreeViewLabels, type TreeViewProps, Typography, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyMuted, TypographyP, type TypographyProps, type UseListHook, type UseOptionsHook, alertVariants, badgeVariants, buttonVariants, inferVariant, navigationMenuTriggerStyle, toggleVariants, typographyVariants, useFormField, useTheme };

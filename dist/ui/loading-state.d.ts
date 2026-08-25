import * as React$1 from 'react';

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

export { LoadingState, type LoadingStateProps, type LoadingVariant, inferVariant };

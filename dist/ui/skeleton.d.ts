import * as React from 'react';

type SkeletonProps = React.ComponentProps<'div'> & {
    animate?: boolean;
    variant?: 'block' | 'text' | 'circle';
};
declare function Skeleton({ className, animate, variant, ...props }: SkeletonProps): React.JSX.Element;

export { Skeleton, type SkeletonProps };

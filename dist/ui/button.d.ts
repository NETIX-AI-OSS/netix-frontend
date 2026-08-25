import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
declare function Button({ className, variant, size, asChild, ...props }: ButtonProps): React.JSX.Element;

export { Button, type ButtonProps, type ButtonVariant, buttonVariants };

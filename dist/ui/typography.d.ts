import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';

declare const typographyVariants: (props?: ({
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | null | undefined;
    affects?: "small" | "default" | "lead" | "large" | "muted" | "removePMargin" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TypographyProps = React.HTMLAttributes<HTMLHeadingElement> & VariantProps<typeof typographyVariants>;
declare function Typography({ className, variant, affects, ...props }: TypographyProps): React.JSX.Element;
declare function TypographyH1(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;
declare function TypographyH2(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;
declare function TypographyH3(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;
declare function TypographyH4(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;
declare function TypographyP(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;
declare function TypographyMuted(props: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element;

export { Typography, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyMuted, TypographyP, type TypographyProps, typographyVariants };

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

declare function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>): React.JSX.Element;
declare function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>): React.JSX.Element;
declare function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>): React.JSX.Element;
declare function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>): React.JSX.Element;
declare function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>): React.JSX.Element;
type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
    hideClose?: boolean;
};
declare function DialogContent({ className, children, overlayClassName, hideClose, ...props }: DialogContentProps): React.JSX.Element;
declare function DialogHeader({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function DialogFooter({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): React.JSX.Element;
declare function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>): React.JSX.Element;

export { Dialog, DialogClose, DialogContent, type DialogContentProps, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };

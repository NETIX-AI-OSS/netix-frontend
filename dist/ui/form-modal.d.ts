import * as React$1 from 'react';

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

export { FormModal, type FormModalProps };

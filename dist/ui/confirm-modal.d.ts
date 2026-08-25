import * as React$1 from 'react';
import { ButtonVariant } from './button.js';
import 'class-variance-authority/types';
import 'class-variance-authority';

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

export { ConfirmModal, type ConfirmModalProps };

/**
 * Design System Components
 * 
 * Import all design system components from this central location.
 * All components follow consistent APIs and use design tokens.
 */

// Form Components
export { default as FormField } from './FormField';
export { default as Select } from './Select';
export type { SelectOption, SelectProps } from './Select';

// Button Components
export { default as Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';
export { default as ActionButton } from './ActionButton'; // Legacy - use Button instead

// Status & Feedback
export { default as StatusBadge, ShipmentStatusBadge, PaymentStatusBadge } from './StatusBadge';
export type { 
  StatusBadgeProps, 
  ShipmentStatus, 
  PaymentStatus, 
  GenericStatus, 
  StatusType 
} from './StatusBadge';

export { default as Alert } from './Alert';
export type { AlertProps, AlertSeverity, AlertVariant } from './Alert';

export { default as LoadingState } from './LoadingState';
export { default as EmptyState } from './EmptyState';

// Layout Components
export { default as StatsCard } from './StatsCard';
export { default as PageHeader } from './PageHeader';

// Overlay Components
export { default as Modal, ConfirmDialog } from './Modal';
export type { ModalProps, ConfirmDialogProps } from './Modal';

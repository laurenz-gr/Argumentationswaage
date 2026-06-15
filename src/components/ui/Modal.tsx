import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
}

export function Modal({
  title,
  description,
  open,
  onClose,
  children,
  actions,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop no-print"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="modal-title">{title}</h3>
        {description ? <p>{description}</p> : null}
        {children}
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

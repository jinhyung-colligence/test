import { Portal } from '@/utils/portal';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] ${className}`}>
        {children}
      </div>
    </Portal>
  );
}
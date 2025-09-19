import { Portal } from '@/utils/portal';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Modal({ isOpen, children, className = "", onClose }: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <Portal>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] ${className}`}
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl max-w-full max-h-full overflow-auto">
          {children}
        </div>
      </div>
    </Portal>
  );
}
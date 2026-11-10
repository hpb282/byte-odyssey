import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  const previous = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    const before = previous.current;
    const focusable = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, a[href], [tabindex="0"]',
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close.current();
      }
      if (event.key === 'Tab') {
        const all = focusable(),
          first = all[0],
          last = all.at(-1);
        if (!all.length) {
          event.preventDefault();
          ref.current?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || !ref.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || !ref.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (before?.isConnected) before.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`modal ${wide ? 'wide' : ''}`}
      >
        <div className="modal-heading">
          <h2 id="dialog-title">{title}</h2>
          <button className="icon-button" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

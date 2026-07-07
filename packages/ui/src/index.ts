import { createElement, type ReactNode } from 'react';

export function Button({ children }: { children: ReactNode }) {
  return createElement(
    'button',
    {
      style: {
        border: 'none',
        borderRadius: '999px',
        padding: '0.75rem 1.25rem',
        background: '#2563eb',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600,
      },
    },
    children,
  );
}

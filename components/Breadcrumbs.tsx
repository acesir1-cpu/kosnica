'use client';

import Link from 'next/link';
import { ROUTES } from '@/config/constants';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--body-text)' }}>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index === 0 && (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:underline transition-colors"
                style={{ color: 'var(--body-text)' }}
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="mx-1" style={{ color: 'var(--border-light)' }}>
                &gt;
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

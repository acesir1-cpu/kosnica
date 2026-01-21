'use client';

export type SortOption = 
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'reviews-desc'
  | 'name-asc'
  | 'seller-asc'
  | 'location-asc';

type ProductSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'default', label: 'Standardno sortiranje' },
  { value: 'price-asc', label: 'Cijena: najniža do najviša' },
  { value: 'price-desc', label: 'Cijena: najviša do najniža' },
  { value: 'rating-desc', label: 'Najbolje ocijenjeno' },
  { value: 'reviews-desc', label: 'Najviše recenzija' },
  { value: 'name-asc', label: 'Naziv: A-Z' },
  { value: 'seller-asc', label: 'Pčelar: A-Z' },
  { value: 'location-asc', label: 'Mjesto: A-Z' },
];

export default function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="text-sm font-medium"
        style={{
          color: 'var(--body-text)',
          fontFamily: 'var(--font-inter)',
        }}
      >
        Sortiraj:
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none px-4 py-2 pr-8 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all cursor-pointer"
          style={{
            backgroundColor: '#ffffff',
            borderColor: 'var(--border-light)',
            color: 'var(--dark-text)',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.875rem',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--honey-gold)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--body-text)' }}
        >
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

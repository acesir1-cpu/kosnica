'use client';

type ActiveFilter = {
  id: string;
  label: string;
  type: 'category' | 'additive' | 'season' | 'weight' | 'rating' | 'price' | 'location' | 'badge' | 'discount';
};

type ActiveFiltersProps = {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

export default function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span
        className="text-sm font-semibold"
        style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-inter)' }}
      >
        Aktivni filteri:
      </span>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          style={{
            backgroundColor: 'rgba(212, 167, 44, 0.1)',
            color: 'var(--dark-text)',
            fontFamily: 'var(--font-inter)',
            border: '1px solid rgba(212, 167, 44, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = 'var(--honey-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.2)';
          }}
        >
          <span>{filter.label}</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ))}
      {filters.length > 0 && (
        <button
          onClick={onClearAll}
          className="text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={{
            color: '#dc2626',
            fontFamily: 'var(--font-inter)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Obriši sve
        </button>
      )}
    </div>
  );
}

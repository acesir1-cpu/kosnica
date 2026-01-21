'use client';

export default function FeaturesBanner() {
  const features = [
    {
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Delivery truck with speed lines */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 17h8m-8 0a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2m-8 0a2 2 0 002 2h4a2 2 0 002-2M8 17V9m0 0h8"
          />
          <circle cx="7" cy="18" r="1.5" fill="currentColor" />
          <circle cx="17" cy="18" r="1.5" fill="currentColor" />
          {/* Speed lines */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2 12h2M2 14h2M2 16h2"
            opacity="0.5"
          />
        </svg>
      ),
      text: 'Brza i sigurna dostava',
      color: 'var(--honey-gold)',
    },
    {
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Credit card */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      text: 'Povrat novca osiguran',
      color: 'var(--honey-gold)',
    },
    {
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Shield with security pattern */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      text: 'Sigurno online plaćanje',
      color: 'var(--honey-gold)',
    },
    {
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Checkmark in circle */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      text: 'Kvalitet zagarantovan',
      color: 'var(--honey-gold)',
    },
  ];

  return (
    <section className="py-20" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group cursor-default"
            >
              <div
                className="mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ color: feature.color }}
              >
                {feature.icon}
              </div>
              <p
                className="text-sm font-medium transition-colors duration-300"
                style={{ color: 'var(--body-text)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = feature.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--body-text)';
                }}
              >
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for better scalability)
const store: RateLimitStore = {};

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max 5 requests per window

/**
 * Rate limiting middleware
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const key = `rate_limit_${ip}`;

  // Clean up old entries
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k];
    }
  });

  // Check if IP exists in store
  if (store[key]) {
    // Check if window has expired
    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
      return null; // Allow request
    }

    // Check if limit exceeded
    if (store[key].count >= MAX_REQUESTS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Previše zahtjeva. Molimo pokušajte ponovo kasnije.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((store[key].resetTime - now) / 1000)),
          },
        }
      );
    }

    // Increment count
    store[key].count++;
    return null; // Allow request
  }

  // First request from this IP
  store[key] = {
    count: 1,
    resetTime: now + RATE_LIMIT_WINDOW,
  };

  return null; // Allow request
}

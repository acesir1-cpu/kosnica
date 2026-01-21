import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { verifyPassword, generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

const USERS_FILE = join(process.cwd(), 'data', 'users.json');

type UsersData = {
  users: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    createdAt: string;
  }>;
  passwords: Record<string, string>;
};

function readUsers(): UsersData {
  try {
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reading users file:', error);
    }
    return { users: [], passwords: {} };
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email i lozinka su obavezni' },
        { status: 400 }
      );
    }

    const usersData = readUsers();
    const user = usersData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json(
        { success: false, error: 'Pogrešna email adresa ili lozinka' },
        { status: 401 }
      );
    }

    const savedPasswordHash = usersData.passwords[email.toLowerCase()];
    
    // Check if password is hashed (new format) or plain text (old format for migration)
    let passwordMatch = false;
    if (savedPasswordHash && savedPasswordHash.startsWith('$2')) {
      // bcrypt hash starts with $2
      passwordMatch = await verifyPassword(password, savedPasswordHash);
    } else {
      // Legacy plain text password (for existing users)
      // In production, you should migrate these to hashed passwords
      passwordMatch = savedPasswordHash === password;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Pogrešna email adresa ili lozinka' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Greška pri prijavljivanju' },
      { status: 500 }
    );
  }
}

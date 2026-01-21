import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { hashPassword, generateToken } from '@/lib/auth';
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

function writeUsers(data: UsersData): void {
  try {
    writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error writing users file:', error);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { firstName, lastName, email, password, phone } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Lozinka mora imati najmanje 6 karaktera' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Nevažeća email adresa' },
        { status: 400 }
      );
    }

    const usersData = readUsers();

    // Check if user already exists
    if (usersData.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Korisnik sa ovom email adresom već postoji' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save user with hashed password
    usersData.users.push(newUser);
    usersData.passwords[email.toLowerCase()] = hashedPassword;
    writeUsers(usersData);

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      token,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Registration error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

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

// Helper function to authenticate request
function authenticateRequest(request: NextRequest): { userId: number; email: string } | null {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

// GET - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Nije autorizovano' },
        { status: 401 }
      );
    }

    const usersData = readUsers();
    const user = usersData.users.find((u) => u.id === auth.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Korisnik nije pronađen' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get user error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Greška pri dobavljanju korisnika' },
      { status: 500 }
    );
  }
}

// PUT - Update authenticated user
export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Nije autorizovano' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ažuriranja su obavezna' },
        { status: 400 }
      );
    }

    const usersData = readUsers();
    const userIndex = usersData.users.findIndex((u) => u.id === auth.userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Korisnik nije pronađen' },
        { status: 404 }
      );
    }

    // Don't allow changing email (should be separate endpoint with validation)
    const { email, ...safeUpdates } = updates;

    // Update user
    usersData.users[userIndex] = {
      ...usersData.users[userIndex],
      ...safeUpdates,
    };

    writeUsers(usersData);

    return NextResponse.json({
      success: true,
      user: usersData.users[userIndex],
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update user error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Greška pri ažuriranju korisnika' },
      { status: 500 }
    );
  }
}

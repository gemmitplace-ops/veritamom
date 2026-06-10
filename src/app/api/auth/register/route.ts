import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'emailTaken' }, { status: 409 });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      return NextResponse.json({ error: 'usernameTaken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        username: data.username,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        isOnboardingComplete: true,
      },
    });

    // Fire-and-forget: add to Gemmit prospects
    const gemmitUrl = process.env.GEMMIT_INTERNAL_URL;
    const gemmitSecret = process.env.GEMMIT_INTERNAL_SECRET;
    if (gemmitUrl && gemmitSecret) {
      fetch(`${gemmitUrl}/api/internal/prospect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': gemmitSecret },
        body: JSON.stringify({ email: user.email, full_name: user.name }),
      }).catch(() => {}); // never block registration
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ user, token }, { status: 201 });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', details: error.issues }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'generic', detail: String(error) }, { status: 500 });
  }
}

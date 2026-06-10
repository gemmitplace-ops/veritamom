import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        passwordHash: true,
        isOnboardingComplete: true,
        language: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ user: safeUser, token });
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
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

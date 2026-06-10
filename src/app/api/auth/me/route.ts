import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const jwtUser = getUserFromRequest(request);
  if (!jwtUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: jwtUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      language: true,
      country: true,
      city: true,
      role: true,
      verifiedProfessionalTitle: true,
      pregnancyStatus: true,
      dueDate: true,
      childBirthdate: true,
      bio: true,
      isOnboardingComplete: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

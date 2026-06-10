import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Try to find by username first, then by id
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: params.id }, { id: params.id }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      country: true,
      city: true,
      role: true,
      verifiedProfessionalTitle: true,
      pregnancyStatus: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

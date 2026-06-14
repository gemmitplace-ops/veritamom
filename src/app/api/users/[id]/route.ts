import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: params.id }, { id: params.id }] },
    select: {
      id: true, name: true, username: true, avatarUrl: true,
      bio: true, country: true, city: true, role: true,
      verifiedProfessionalTitle: true, pregnancyStatus: true, createdAt: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let isFollowing = false;
  try {
    const caller = requireAuth(request);
    if (caller.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: caller.userId, followingId: user.id } },
      });
      isFollowing = !!follow;
    }
  } catch {
    // not logged in — isFollowing stays false
  }

  return NextResponse.json({ user, isFollowing });
}

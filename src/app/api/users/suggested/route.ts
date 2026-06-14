import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const caller = requireAuth(request);

    // IDs the current user already follows
    const following = await prisma.follow.findMany({
      where: { followerId: caller.userId },
      select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);
    followingIds.push(caller.userId); // exclude self

    const users = await prisma.user.findMany({
      where: { id: { notIn: followingIds } },
      select: {
        id: true, name: true, username: true, avatarUrl: true,
        role: true, verifiedProfessionalTitle: true,
        _count: { select: { followers: true } },
      },
      orderBy: { followers: { _count: 'desc' } },
      take: 5,
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}

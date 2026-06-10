import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (user.userId === params.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.userId, followingId: params.id } },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: user.userId, followingId: params.id } },
      });
      return NextResponse.json({ following: false });
    } else {
      await prisma.follow.create({
        data: { followerId: user.userId, followingId: params.id },
      });

      await prisma.notification.create({
        data: {
          userId: params.id,
          type: 'FOLLOW',
          title: 'New follower',
          body: `Someone started following you`,
          link: `/profile/${user.userId}`,
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

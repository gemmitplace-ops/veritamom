import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id, isModerated: false },
    include: {
      author: {
        select: {
          id: true, name: true, username: true, avatarUrl: true,
          role: true, verifiedProfessionalTitle: true, country: true,
        },
      },
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const currentUser = getUserFromRequest(request);
  let userVote = 0;
  if (currentUser) {
    const vote = await prisma.postVote.findUnique({
      where: { userId_postId: { userId: currentUser.userId, postId: params.id } },
    });
    userVote = vote?.value ?? 0;
  }

  return NextResponse.json({ post: { ...post, userVote } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (post.authorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

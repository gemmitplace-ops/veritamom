import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { targetId: params.id, targetType: 'POST', parentId: null, isModerated: false },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true, name: true, username: true, avatarUrl: true,
          role: true, verifiedProfessionalTitle: true, country: true,
        },
      },
      replies: {
        where: { isModerated: false },
        include: {
          author: {
            select: {
              id: true, name: true, username: true, avatarUrl: true,
              role: true, verifiedProfessionalTitle: true, country: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ comments });
}

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        body: data.body,
        authorId: user.userId,
        targetType: 'POST',
        targetId: params.id,
        postId: params.id,
        parentId: data.parentId,
      },
      include: {
        author: {
          select: {
            id: true, name: true, username: true, avatarUrl: true,
            role: true, verifiedProfessionalTitle: true, country: true,
          },
        },
      },
    });

    // Notify post/comment author (fire-and-forget)
    ;(async () => {
      try {
        if (data.parentId) {
          const parent = await prisma.comment.findUnique({ where: { id: data.parentId }, select: { authorId: true } });
          if (parent && parent.authorId !== user.userId) {
            await prisma.notification.create({
              data: { userId: parent.authorId, type: 'REPLY', title: `${comment.author.name} replied to your comment`, body: data.body.slice(0, 120), link: `/community/${params.id}` },
            });
          }
        } else {
          const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true, title: true } });
          if (post && post.authorId !== user.userId) {
            await prisma.notification.create({
              data: { userId: post.authorId, type: 'REPLY', title: `${comment.author.name} commented on your post`, body: data.body.slice(0, 120), link: `/community/${params.id}` },
            });
          }
        }
      } catch { /* ignore */ }
    })();

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) });

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { value } = voteSchema.parse(body);

    const existing = await prisma.postVote.findUnique({
      where: { userId_postId: { userId: user.userId, postId: params.id } },
    });

    if (existing) {
      if (value === 0) {
        await prisma.postVote.delete({
          where: { userId_postId: { userId: user.userId, postId: params.id } },
        });
        await prisma.post.update({
          where: { id: params.id },
          data: existing.value === 1
            ? { upvotes: { decrement: 1 } }
            : { downvotes: { decrement: 1 } },
        });
      } else if (existing.value !== value) {
        await prisma.postVote.update({
          where: { userId_postId: { userId: user.userId, postId: params.id } },
          data: { value },
        });
        await prisma.post.update({
          where: { id: params.id },
          data: value === 1
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { downvotes: { increment: 1 }, upvotes: { decrement: 1 } },
        });
      }
    } else if (value !== 0) {
      await prisma.postVote.create({
        data: { userId: user.userId, postId: params.id, value },
      });
      await prisma.post.update({
        where: { id: params.id },
        data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      });
    }

    return NextResponse.json({ vote: value });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

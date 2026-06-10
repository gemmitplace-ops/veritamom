import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'hot';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isModerated: false };
  if (category && category !== 'ALL') {
    where.category = category;
  }

  let orderBy: Record<string, unknown> = { createdAt: 'desc' };
  if (sort === 'top') orderBy = { upvotes: 'desc' };
  if (sort === 'hot') orderBy = { createdAt: 'desc' };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, orderBy],
      include: {
        author: {
          select: {
            id: true, name: true, username: true, avatarUrl: true,
            role: true, verifiedProfessionalTitle: true, country: true,
          },
        },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const currentUser = getUserFromRequest(request);
  const userVotes: Record<string, number> = {};

  if (currentUser) {
    const votes = await prisma.postVote.findMany({
      where: { userId: currentUser.userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true, value: true },
    });
    for (const v of votes) userVotes[v.postId] = v.value;
  }

  const postsWithVotes = posts.map((p) => ({
    ...p,
    userVote: userVotes[p.id] ?? 0,
  }));

  return NextResponse.json({ posts: postsWithVotes, total, page, limit });
}

const postSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().min(10).max(10000),
  category: z.enum(['QUESTION', 'WIN', 'CONCERN', 'PRODUCT_REVIEW', 'RECIPE']),
  language: z.enum(['EN', 'ZH', 'KO']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = postSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        category: data.category,
        language: data.language || 'EN',
        authorId: user.userId,
      },
      include: {
        author: {
          select: {
            id: true, name: true, username: true, avatarUrl: true,
            role: true, verifiedProfessionalTitle: true, country: true,
          },
        },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const conversations = await prisma.conversation.findMany({
      where: { members: { some: { userId: user.userId } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

const createSchema = z.object({
  userId: z.string().optional(),    // DM: recipient user ID
  isGroup: z.boolean().optional(),
  name: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    if (data.isGroup) {
      const allIds = [user.userId, ...(data.memberIds || [])];
      const memberIds = allIds.filter((id, idx) => allIds.indexOf(id) === idx);
      const conv = await prisma.conversation.create({
        data: {
          isGroup: true,
          name: data.name,
          members: { create: memberIds.map((uid) => ({ userId: uid })) },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
          },
          messages: { take: 1 },
        },
      });
      return NextResponse.json({ conversation: conv }, { status: 201 });
    }

    // DM: check for existing
    if (!data.userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: { every: { userId: { in: [user.userId, data.userId] } } },
        AND: [
          { members: { some: { userId: user.userId } } },
          { members: { some: { userId: data.userId } } },
        ],
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
        messages: { take: 1 },
      },
    });
    if (existing) return NextResponse.json({ conversation: existing });

    const conv = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: { create: [{ userId: user.userId }, { userId: data.userId }] },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
        messages: { take: 1 },
      },
    });
    return NextResponse.json({ conversation: conv }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

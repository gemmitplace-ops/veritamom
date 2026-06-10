import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    // Verify membership
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: user.userId } },
    });
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: user.userId } },
    });
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { body } = await request.json();
    if (!body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 });

    const message = await prisma.message.create({
      data: { body, senderId: user.userId, conversationId: params.id },
      include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

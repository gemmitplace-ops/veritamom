import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { username: { contains: q } },
      ],
    },
    select: { id: true, name: true, username: true, avatarUrl: true },
    take: 8,
  });

  return NextResponse.json({ users });
}

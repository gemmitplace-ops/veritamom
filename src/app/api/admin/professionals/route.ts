import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Users who filled in professionalTitle (applied) but are not yet VERIFIED_PROFESSIONAL
    const applicants = await prisma.user.findMany({
      where: {
        pregnancyStatus: 'PROFESSIONAL',
        role: { not: 'ADMIN' },
      },
      select: {
        id: true, name: true, username: true, email: true,
        role: true, verifiedProfessionalTitle: true,
        country: true, city: true, createdAt: true, avatarUrl: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ applicants });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

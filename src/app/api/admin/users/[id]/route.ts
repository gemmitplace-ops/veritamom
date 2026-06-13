import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendPublisherPromotionEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caller = requireAuth(request);
    if (caller.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { role } = await request.json();
    const allowed = ['MOTHER', 'PUBLISHER', 'VERIFIED_PROFESSIONAL'];
    if (!allowed.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const prevUser = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } });

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    // Send email when promoted to PUBLISHER
    if (role === 'PUBLISHER' && prevUser?.role !== 'PUBLISHER') {
      sendPublisherPromotionEmail(user.email, user.name).catch(() => {});
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

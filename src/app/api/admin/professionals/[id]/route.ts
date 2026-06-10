import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { action } = await request.json(); // 'approve' | 'reject'

    if (action === 'approve') {
      const updated = await prisma.user.update({
        where: { id: params.id },
        data: { role: 'VERIFIED_PROFESSIONAL' },
        select: { id: true, name: true, role: true, verifiedProfessionalTitle: true },
      });
      return NextResponse.json({ user: updated });
    }

    if (action === 'reject') {
      // Reset to MOTHER role and clear title
      const updated = await prisma.user.update({
        where: { id: params.id },
        data: { role: 'MOTHER', pregnancyStatus: 'PREGNANT', verifiedProfessionalTitle: null },
        select: { id: true, name: true, role: true },
      });
      return NextResponse.json({ user: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

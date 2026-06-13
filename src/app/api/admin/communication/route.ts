import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendBulkUpdateEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const caller = requireAuth(request);
    if (caller.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subject, body } = await request.json();
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      select: { email: true, name: true },
    });

    const results = await sendBulkUpdateEmail(users, subject.trim(), body.trim());

    return NextResponse.json({ ok: true, ...results, total: users.length });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { week: string } }
) {
  const week = parseInt(params.week);
  if (isNaN(week) || week < 4 || week > 40) {
    return NextResponse.json({ error: 'Invalid week' }, { status: 400 });
  }

  const milestone = await prisma.milestoneWeek.findUnique({ where: { week } });
  if (!milestone) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ milestone });
}

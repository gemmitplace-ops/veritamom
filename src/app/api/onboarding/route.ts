import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const onboardingSchema = z.object({
  language: z.enum(['EN', 'ZH', 'KO']),
  country: z.string().optional(),
  city: z.string().optional(),
  pregnancyStatus: z.enum(['PREGNANT', 'PARENT', 'TRYING', 'PROFESSIONAL']),
  dueDate: z.string().optional().nullable(),
  childBirthdate: z.string().optional().nullable(),
  verifiedProfessionalTitle: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const jwtUser = requireAuth(request);
    const body = await request.json();
    const data = onboardingSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: jwtUser.userId },
      data: {
        language: data.language,
        country: data.country,
        city: data.city,
        pregnancyStatus: data.pregnancyStatus,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        childBirthdate: data.childBirthdate ? new Date(data.childBirthdate) : null,
        verifiedProfessionalTitle: data.verifiedProfessionalTitle,
        isOnboardingComplete: true,
      },
      select: {
        id: true,
        isOnboardingComplete: true,
        language: true,
        pregnancyStatus: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

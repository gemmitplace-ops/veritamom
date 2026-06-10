import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generatePaperSummaries } from '@/lib/anthropic';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const paperSchema = z.object({
  title: z.string().min(1),
  citation: z.string().min(1),
  journalName: z.string().min(1),
  publishedYear: z.number().int(),
  fullPaperUrl: z.string().url().optional().nullable(),
  pdfPath: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  trimesterRelevance: z.string().optional(),
  isPublished: z.boolean().optional(),
  generateSummaries: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const papers = await prisma.researchPaper.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json({ papers });
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = paperSchema.parse(body);

    let summary: string | undefined;
    let summaryZh: string | undefined;
    let summaryKo: string | undefined;

    if (data.generateSummaries) {
      const summaries = await generatePaperSummaries(
        data.title,
        data.citation,
        data.journalName,
        data.publishedYear,
        data.fullPaperUrl ?? undefined
      );
      summary = summaries.summary;
      summaryZh = summaries.summaryZh;
      summaryKo = summaries.summaryKo;
    }

    const tagConnections = data.tags
      ? await Promise.all(
          data.tags.map(async (tagName) => {
            const slug = slugify(tagName);
            const tag = await prisma.tag.upsert({
              where: { slug },
              update: {},
              create: { name: tagName, slug },
            });
            return { tagId: tag.id };
          })
        )
      : [];

    const paper = await prisma.researchPaper.create({
      data: {
        title: data.title,
        citation: data.citation,
        journalName: data.journalName,
        publishedYear: data.publishedYear,
        fullPaperUrl: data.fullPaperUrl,
        pdfPath: data.pdfPath,
        trimesterRelevance: data.trimesterRelevance || 'ALL',
        isPublished: data.isPublished ?? false,
        summary,
        summaryZh,
        summaryKo,
        tags: { create: tagConnections },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({ paper }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic', message: (error as Error).message }, { status: 500 });
  }
}

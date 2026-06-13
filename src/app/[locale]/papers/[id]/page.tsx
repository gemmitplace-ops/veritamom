import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { PaperComments } from '@/components/research/PaperComments';

interface Props {
  params: { locale: string; id: string };
}

export async function generateMetadata({ params }: Props) {
  const paper = await prisma.researchPaper.findUnique({
    where: { id: params.id, isPublished: true },
  });
  if (!paper) return {};
  return {
    title: `${paper.title} | Veritamom`,
    description: paper.summary || paper.citation,
  };
}

export default async function PaperPage({ params }: Props) {
  const paper = await prisma.researchPaper.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { likes: true, saves: true } },
    },
  });

  if (!paper) notFound();

  const summary =
    params.locale === 'zh' ? paper.summaryZh || paper.summary
    : params.locale === 'ko' ? paper.summaryKo || paper.summary
    : paper.summary;

  return (
    <AppShell locale={params.locale}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Research
        </Link>

        <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Gold top bar */}
          <div className="h-1.5" style={{ backgroundColor: '#C9A84C' }} />

          <div className="p-6 md:p-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ color: '#A88C3A', backgroundColor: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <BookOpen size={10} /> Peer Reviewed
              </span>
              {paper.trimesterRelevance && paper.trimesterRelevance !== 'ALL' && (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: '#C9A84C' }}>
                  {paper.trimesterRelevance.split(',')[0]}
                </span>
              )}
              {paper.tags.map(({ tag }) => (
                <span key={tag.id} className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl md:text-3xl leading-snug mb-3" style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {paper.title}
            </h1>

            {/* Citation */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {paper.citation}
              <span className="mx-2 text-gray-300">·</span>
              <em>{paper.journalName}</em>
              <span className="mx-2 text-gray-300">·</span>
              {paper.publishedYear}
            </p>

            {/* AI Summary */}
            {summary && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FAF8F3', border: '1px solid rgba(201,168,76,0.2)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: '#A88C3A' }}>
                  Plain-English Summary
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <span>{paper._count.likes} likes</span>
              <span>{paper.viewCount} views</span>
            </div>

            {/* Read full paper */}
            {paper.fullPaperUrl && (
              <a
                href={paper.fullPaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#8B1A2B' }}
              >
                Read Full Paper <ExternalLink size={14} />
              </a>
            )}
          </div>
        </article>

        <PaperComments paperId={paper.id} />
      </div>
    </AppShell>
  );
}

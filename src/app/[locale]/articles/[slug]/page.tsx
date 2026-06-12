import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CheckCircle, TrendingUp, AlertCircle, BookOpen, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { locale: string; slug: string };
}

const confidenceConfig = {
  ESTABLISHED: { label: 'Established Evidence', icon: CheckCircle, color: '#2d7a4f', bg: '#edf7f0', border: '#a3d9b8' },
  EMERGING: { label: 'Emerging Research', icon: TrendingUp, color: '#b45309', bg: '#fef3e2', border: '#fbbf24' },
  DEBATED: { label: 'Actively Debated', icon: AlertCircle, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
};

export async function generateMetadata({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, isPublished: true },
  });
  if (!article) return {};
  return {
    title: `${article.title} | Veritamom`,
    description: article.metaDescription || article.tldr,
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.tldr,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      author: { select: { name: true, username: true } },
      citations: {
        include: {
          paper: {
            select: {
              id: true, title: true, journalName: true, publishedYear: true,
              citation: true, fullPaperUrl: true, summary: true,
            },
          },
        },
      },
    },
  });

  if (!article) notFound();

  await prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });

  const conf = confidenceConfig[article.confidenceLevel];
  const ConfIcon = conf.icon;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: article.title,
    description: article.metaDescription || article.tldr,
    url: `https://veritamom.com/${params.locale}/articles/${article.slug}`,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'Veritamom',
      url: 'https://veritamom.com',
    },
    citation: article.citations.map((c) => ({
      '@type': 'ScholarlyArticle',
      name: c.paper.title,
      isPartOf: { '@type': 'Periodical', name: c.paper.journalName },
      datePublished: String(c.paper.publishedYear),
      citation: c.paper.citation,
      ...(c.paper.fullPaperUrl && { url: c.paper.fullPaperUrl }),
    })),
    mainContentOfPage: {
      '@type': 'WebPageElement',
      cssSelector: 'article',
    },
  };

  return (
    <AppShell locale={params.locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <a href={`/${params.locale}`} className="hover:text-brand-crimson transition-colors">Home</a>
          <span>›</span>
          <span className="text-gray-600">Article</span>
        </nav>

        <article>
          {/* Hook */}
          <p className="text-sm font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: '#A88C3A' }}>
            {article.hook}
          </p>

          {/* Title */}
          <h1 className="font-serif text-3xl leading-tight mb-4" style={{ color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ color: conf.color, backgroundColor: conf.bg, borderColor: conf.border }}
            >
              <ConfIcon size={12} />
              {conf.label}
            </span>
            <span className="text-xs text-gray-400">
              By {article.author.name}
              {article.publishedAt && (
                <span> · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              )}
            </span>
            {article.citations.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <BookOpen size={11} />
                {article.citations.length} {article.citations.length === 1 ? 'source' : 'sources'} cited
              </span>
            )}
          </div>

          {/* TLDR box */}
          <div className="rounded-xl p-5 mb-8 border-l-4" style={{ backgroundColor: '#FAF8F3', borderLeftColor: '#8B1A2B' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: '#A88C3A' }}>
              The Short Answer
            </p>
            <p className="text-base text-gray-800 leading-relaxed font-medium">
              {article.tldr}
            </p>
          </div>

          {/* Body */}
          <div
            className="prose prose-gray max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-brand-crimson prose-strong:text-gray-900 mb-10"
            dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br/>') }}
          />

          {/* Citations */}
          {article.citations.length > 0 && (
            <section className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="font-serif text-lg mb-4 text-gray-800">Sources & Citations</h2>
              <div className="space-y-3">
                {article.citations.map((c, idx) => (
                  <div key={c.paper.id} className="flex gap-3 text-sm">
                    <span className="text-brand-gold font-bold flex-shrink-0 w-6 text-right">{idx + 1}.</span>
                    <div>
                      <p className="text-gray-800 font-medium">{c.paper.title}</p>
                      <p className="text-gray-500 text-xs">
                        {c.paper.citation} · <em>{c.paper.journalName}</em> · {c.paper.publishedYear}
                      </p>
                      {c.note && <p className="text-gray-500 text-xs mt-0.5 italic">{c.note}</p>}
                      {c.paper.fullPaperUrl && (
                        <a
                          href={c.paper.fullPaperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-crimson hover:underline mt-0.5"
                        >
                          View paper <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <div className="mt-10 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-700 dark:text-gray-300">Medical disclaimer:</strong> This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider before making decisions about your pregnancy or health.
            </p>
          </div>
        </article>
      </div>
    </AppShell>
  );
}

import { Link, useParams } from 'react-router';
import { Clock } from 'lucide-react';
import { Seo } from '../../seo/Seo';
import {
  articleSchema,
  baseGraph,
  breadcrumbSchema,
} from '../../seo/schema';
import {
  AnswerCapsule,
  FactRow,
  PageHero,
  Prose,
  RiskNotice,
} from '../../components/content/ContentPage';
import { INSIGHTS, insightBySlug, type Block } from '../../content/insights';
import NotFound from '../NotFound';

/**
 * Renders one editorial block.
 *
 * Headings carry stable ids so a section can be linked and cited directly —
 * an answer engine that quotes a passage can point at the exact anchor, and
 * readers arriving from one land where the quote came from.
 */
function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return <p>{block.text}</p>;

    case 'h2':
      return (
        <h2
          id={block.id}
          className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-10 mb-4 scroll-mt-24"
        >
          {block.text}
        </h2>
      );

    case 'h3':
      return (
        <h3
          id={block.id}
          className="text-xl font-semibold text-slate-900 mt-8 mb-3 scroll-mt-24"
        >
          {block.text}
        </h3>
      );

    case 'ul':
      return (
        <ul className="list-disc pl-6 space-y-2 mb-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="list-decimal pl-6 space-y-2 mb-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );

    case 'note':
      return (
        <aside
          role="note"
          className="not-prose rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5 mb-6 text-slate-700 leading-relaxed"
        >
          {block.text}
        </aside>
      );

    case 'facts':
      return (
        <dl className="not-prose rounded-2xl bg-white ring-1 ring-slate-200 p-6 mb-6">
          {block.rows.map((r) => (
            <FactRow key={r.label} label={r.label} value={r.value} note={r.note} />
          ))}
        </dl>
      );
  }
}

export default function InsightPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? insightBySlug(slug) : undefined;

  // An unknown slug renders the 404 page rather than an empty shell, so the
  // prerenderer and the crawler both see a real not-found response.
  if (!post) return <NotFound />;

  const path = `/insights/${post.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Insights', path: '/insights' },
    { name: post.title, path },
  ];

  const jsonLd = [
    baseGraph(
      articleSchema({
        headline: post.title,
        description: post.description,
        path,
        datePublished: post.published,
        dateModified: post.updated,
      }),
      breadcrumbSchema(crumbs),
    ),
  ];

  const related = INSIGHTS.filter((i) => i.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        path={path}
        type="article"
        jsonLd={jsonLd}
      />

      <PageHero title={post.title} crumbs={crumbs} updated={post.updated} />

      <Prose>
        <p className="not-prose flex items-center gap-4 text-sm text-slate-500 mb-8">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingMinutes} min read
          </span>
          <span>{post.topic}</span>
        </p>

        <AnswerCapsule>{post.answer}</AnswerCapsule>

        {post.body.map((block, i) => (
          <BlockView key={`${block.kind}-${i}`} block={block} />
        ))}

        <div className="mt-12">
          <RiskNotice />
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <h2
              id="related"
              className="text-xl font-bold text-slate-900 tracking-tight mb-4"
            >
              Related guides
            </h2>
            <ul className="not-prose space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/insights/${r.slug}`}
                    className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Prose>
    </>
  );
}

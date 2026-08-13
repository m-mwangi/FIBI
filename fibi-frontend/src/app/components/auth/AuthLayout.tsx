import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Leaf, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import logo from '../../../assets/fibi_logo.svg';

const PANEL_IMAGES = ['/images/capsule12.jpeg', '/images/solar2.jpg', '/images/avo3.jpg'];

const PILLARS = [
  {
    icon: Users,
    title: 'Fractional ownership',
    body: 'Pool capital with other investors and start from a low minimum.',
  },
  {
    icon: ShieldCheck,
    title: 'Vetted projects',
    body: 'Every listing is researched and verified before it goes live.',
  },
  {
    icon: TrendingUp,
    title: 'Passive income',
    body: 'Distributions from eco-lodges, solar, and agriculture as projects mature.',
  },
];

/** Shared split-screen shell for /login and /signup. */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  /** Signup needs a roomier form column than login. */
  wide?: boolean;
}) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setSlide((p) => (p + 1) % PANEL_IMAGES.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {PANEL_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ${
              i === slide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-950/55 to-emerald-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <img src={logo} alt="FIBI" className="h-auto w-44 brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-emerald-100 backdrop-blur-md">
            <Leaf className="h-3.5 w-3.5 text-emerald-300" />
            Kenyan land &amp; sustainability, together
          </p>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Invest together.
            <span className="block text-emerald-400">Profit together.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            FIBI turns vetted land projects into shares you can actually afford — with transparent
            funding progress, timelines, and returns.
          </p>

          <ul className="mt-10 space-y-5">
            {PILLARS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                  <p.icon className="h-5 w-5 text-emerald-300" />
                </span>
                <div>
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="text-sm leading-relaxed text-white/65">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex gap-2">
            {PANEL_IMAGES.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Background ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-8 bg-emerald-400' : 'w-1.5 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} FIBI</p>
        </div>
      </aside>

      {/* ---------- Form column ---------- */}
      <div className="relative flex min-h-screen flex-col">
        {/* Mobile brand header */}
        <div className="relative overflow-hidden bg-emerald-950 px-5 py-6 lg:hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${PANEL_IMAGES[slide]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-emerald-900/70" />
          <div className="relative flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="FIBI" className="h-auto w-28 brightness-0 invert" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100/90 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
            <header className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
            </header>

            {children}
          </div>
        </div>

        <div className="hidden px-8 pb-8 lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Consistent field chrome across both auth pages. */
export const authInputClass =
  'h-11 rounded-xl border-slate-200 bg-white text-[15px] shadow-sm transition-shadow placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20';

export const authLabelClass = 'text-sm font-medium text-slate-700';

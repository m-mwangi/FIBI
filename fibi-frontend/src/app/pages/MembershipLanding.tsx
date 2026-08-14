import { Link } from "react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Crown, Quote, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMembership } from "../context/MembershipContext";
import { featureLabel, tierLabel } from "@/lib/membership";
import { PlanGrid } from "../components/membership/PlanGrid";
import { MembershipStatusCard } from "../components/membership/MembershipStatus";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
];

const EXPERIENCE_IMAGES = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
];

const TESTIMONIALS = [
  {
    quote:
      "This is my reset zone. I get real focus time, high-level conversations, and practical support every week.",
    name: "Amina K",
    role: "Verified Member",
  },
  {
    quote:
      "The private events and founder calls are worth it on their own. You feel like you're building with insiders.",
    name: "Brian O",
    role: "Premium Member",
  },
];

const FAQ = [
  {
    q: "How do I apply?",
    a: "Submit the online application. The membership team reviews every application and emails you a decision. Once approved, you choose a tier and activate.",
  },
  {
    q: "When am I charged?",
    a: "Only after you're approved and choose a tier. Approval alone costs nothing, and no tier is granted until a payment settles.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel?",
    a: "Yes, all from the billing page. Upgrades take effect once payment settles. Cancelling stops future billing and you keep full access to the end of the period you already paid for.",
  },
  {
    q: "What happens when my membership expires?",
    a: "Access to member-only features and events ends at the period date. Your account and history stay intact, and you can renew at any time.",
  },
  {
    q: "Are there member-only events?",
    a: "Yes. Each event sets a minimum tier. You'll see upcoming events on the member hub, with full details and booking for the ones your tier covers.",
  },
];

export default function MembershipLanding() {
  const { isAuthenticated } = useAuth();
  const { membership, stage, plans, featureGates, latestApplication } = useMembership();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  // The cheapest paid plan anchors the hero, so the headline price tracks the
  // plans table instead of being a number typed into the page.
  const entryPlan = plans.filter((p) => p.monthlyPriceMinor > 0).sort(
    (a, b) => a.monthlyPriceMinor - b.monthlyPriceMinor
  )[0];

  const applyHref = isAuthenticated ? "/membership/apply" : "/login";

  return (
    <div className="min-h-screen bg-white">
      <section className="relative flex min-h-[78vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center text-white">
          <Badge className="border border-white/30 bg-white/15 text-white hover:bg-white/20">
            Application-only membership
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Become a FIBI Member
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Exclusive spaces, member-only events, and weekly founder calls — with every application
            reviewed so the room stays worth being in.
          </p>
          {entryPlan && (
            <p className="mt-3 text-sm text-white/70">
              Tiers from {tierLabel(entryPlan.tier)} · reviewed before activation
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={applyHref}>
              <Button className="bg-emerald-600 px-8 hover:bg-emerald-700">
                {isAuthenticated ? "Apply for membership" : "Log in to apply"}
              </Button>
            </Link>
            <a href="#plans">
              <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20">
                Compare tiers
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* A signed-in visitor sees their own standing before the marketing. */}
        {isAuthenticated && (
          <section className="mb-12">
            <MembershipStatusCard
              membership={membership}
              stage={stage}
              feedback={latestApplication?.adminFeedback}
            />
          </section>
        )}

        <section className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Apply",
                body: "Tell us your goals, the experiences you want, and how you'll contribute.",
              },
              {
                step: "2",
                title: "Get reviewed",
                body: "The membership team reviews fit and community alignment, then emails a decision.",
              },
              {
                step: "3",
                title: "Activate",
                body: "Choose your tier and pay. Access to spaces, events, and channels opens immediately.",
              },
            ].map((item) => (
              <Card key={item.step} className="text-left">
                <CardHeader>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                    {item.step}
                  </span>
                  <CardTitle className="mt-2 text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{item.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Application-only entry",
              body: "Every applicant is reviewed before any tier is granted, which is what keeps the community's quality and trust.",
            },
            {
              icon: Users,
              title: "Community-first value",
              body: "Verified groups, private channels, and events with peers who are building the same kinds of things.",
            },
            {
              icon: Crown,
              title: "Tiered progression",
              body: "Move up as you go, from member basics through to Investor+ deal flow — change tiers whenever you like.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">{item.body}</CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Your place to step away from the noise
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Fresh air, open space, and a focused community help reduce stress, improve clarity, and
            make work feel meaningful again.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCE_IMAGES.map((image) => (
              <div key={image} className="overflow-hidden rounded-2xl border">
                <img
                  src={image}
                  alt="Membership experience"
                  loading="lazy"
                  className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        <section id="plans" className="mt-16 scroll-mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Choose your tier</h2>
            <p className="mt-2 text-slate-600">
              Every tier is billed monthly. Applications are reviewed before activation.
            </p>
          </div>
          <div className="mt-8">
            <PlanGrid
              plans={plans}
              membership={membership}
              stage={stage}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </section>

        {/* What each gate actually requires, straight from the gate table the
            admin console edits — so this section cannot drift from reality. */}
        {featureGates.length > 0 && (
          <section className="mt-14">
            <Card>
              <CardHeader>
                <CardTitle>What each tier unlocks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {featureGates.map((gate) => (
                    <li key={gate.featureKey} className="flex items-start justify-between gap-3">
                      <span className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {featureLabel(gate.featureKey)}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {tierLabel(gate.minTier)}+
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="pt-6">
                <Quote className="mb-2 h-5 w-5 text-emerald-600" />
                <p className="text-slate-700">"{testimonial.quote}"</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="text-center text-3xl font-bold text-slate-900">Frequently asked</h2>
          <Accordion type="single" collapsible className="mx-auto mt-6 max-w-3xl">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-14">
          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <h3 className="text-2xl font-bold text-slate-900">Ready to join?</h3>
              <p className="max-w-xl text-slate-600">
                Applications take a few minutes. You'll hear back from the membership team by email.
              </p>
              <Link to={applyHref}>
                <Button className="bg-emerald-600 px-8 hover:bg-emerald-700">
                  {isAuthenticated ? "Start your application" : "Log in to apply"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

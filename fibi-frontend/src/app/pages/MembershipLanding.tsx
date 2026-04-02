import { Link } from "react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Crown, ShieldCheck, Star, Users, Quote } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMembership } from "../context/MembershipContext";
import { MEMBERSHIP_FEATURE_LABELS, MEMBERSHIP_PLANS } from "@/lib/membership";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

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

const PREMIUM_BENEFITS = [
  "Daily access to member spaces",
  "Weekly founder and industry calls",
  "Private member group chats",
  "Wellness and productivity guidance",
  "Member-only events and gatherings",
  "Priority reservations and guest passes",
];

export default function MembershipLanding() {
  const { isAuthenticated } = useAuth();
  const { membership } = useMembership();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[84vh] pt-20 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-white text-center">
          <Badge className="bg-white/15 border border-white/30 text-white hover:bg-white/20">
            100+ active members
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 tracking-tight">
            Become a FIBI In-Person Member
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-white/90 text-lg">
            Access exclusive spaces, member-only events, and weekly founder calls through an application-first
            membership built for quality community.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to={isAuthenticated ? "/membership/apply" : "/login"}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 px-8">
                {isAuthenticated ? "Apply for membership" : "Log in to apply"}
              </Button>
            </Link>
            <Link to="/member-hub">
              <Button variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                Explore member hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <section className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardHeader><CardTitle>1. Apply</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600">
                Submit your application and share your goals, interests, and contribution fit.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>2. Meet the Team</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600">
                We review fit and community alignment, then schedule your welcome call.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>3. Unlock Access</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600">
                Once approved, you unlock member spaces, events, and private channels.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mt-14">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Application-only entry
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Protect quality and trust by reviewing applicants before premium access is granted.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-emerald-600" />
                Community-first value
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Network in verified groups, private channels, and exclusive events with peers.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-emerald-600" />
                Tiered progression
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Unlock more benefits over time, from member basics to Investor+ deal flow.
            </CardContent>
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-bold text-slate-900 text-center">Your place to step away from the noise</h2>
          <p className="text-slate-600 text-center mt-3 max-w-3xl mx-auto">
            Fresh air, open space, and a focused community help reduce stress, improve clarity, and make work feel meaningful again.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {EXPERIENCE_IMAGES.map((image) => (
              <div key={image} className="rounded-2xl overflow-hidden border">
                <img src={image} alt="Membership experience" className="h-52 w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {EXPERIENCE_IMAGES.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full ${idx === 0 ? "w-8 bg-emerald-600" : "w-2 bg-slate-300"}`} />
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-4 gap-4 mt-14">
          {MEMBERSHIP_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={plan.highlighted ? "ring-2 ring-emerald-500 border-emerald-300" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && (
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-semibold text-slate-900">
                  ${plan.monthlyPrice}
                  <span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.features.length === 0 ? (
                  <p className="text-sm text-slate-500">Public access only</p>
                ) : (
                  plan.features.map((feature) => (
                    <p key={feature} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {MEMBERSHIP_FEATURE_LABELS[feature]}
                    </p>
                  ))
                )}
                <div className="pt-3">
                  <Link to={isAuthenticated ? "/membership/apply" : "/login"}>
                    <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                      {membership.tier === plan.tier ? "Current tier" : "Join " + plan.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-4">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="pt-6">
                <Quote className="h-5 w-5 text-emerald-600 mb-2" />
                <p className="text-slate-700">"{testimonial.quote}"</p>
                <p className="text-sm text-slate-900 font-semibold mt-3">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-14">
          <Card className="overflow-hidden border-emerald-200">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-10 bg-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Unlimited Access</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">Join the FIBI Membership</h3>
                <p className="text-slate-600 mt-3">
                  Access a curated community and premium resources under one membership.
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-6">
                  $59<span className="text-base text-slate-500 font-normal"> / month</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Application review required before activation.</p>
                <div className="mt-6">
                  <Link to={isAuthenticated ? "/membership/apply" : "/login"}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 px-8">
                      {isAuthenticated ? "Apply for Membership" : "Log in to Apply"}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-8 md:p-10 bg-emerald-50 border-t lg:border-t-0 lg:border-l border-emerald-100">
                <h4 className="text-lg font-semibold text-slate-900">Included Benefits</h4>
                <div className="space-y-2 mt-4">
                  {PREMIUM_BENEFITS.map((benefit) => (
                    <p key={benefit} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {benefit}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-emerald-600" />
                Trust and social proof
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 grid md:grid-cols-3 gap-4">
              <p>Verified member badges highlight trusted contributors in the community.</p>
              <p>Monthly member spotlights and testimonials help applicants understand value.</p>
              <p>Founder Q&A calls create direct access and a stronger insider experience.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12">
          <Card className="mb-8 bg-slate-900 text-white border-slate-800">
            <CardContent className="py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Prefer virtual access?</p>
                <h3 className="text-2xl font-semibold">Join weekly from anywhere</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Virtual membership includes live calls, recordings, and private online community channels.
                </p>
              </div>
              <Link to={isAuthenticated ? "/membership/apply" : "/login"}>
                <Button variant="outline" className="border-white text-white bg-transparent hover:bg-white/10">
                  Join Virtual Membership
                </Button>
              </Link>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold text-slate-900 text-center">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {[
              {
                q: "How do I apply?",
                a: "Start with the online application, then complete a short fit call with our membership team before final approval.",
              },
              {
                q: "What does membership include?",
                a: "Private events, founder sessions, member-only content, curated networking, and premium service benefits by tier.",
              },
              {
                q: "Are there member-only events?",
                a: "Yes. Approved members gain access to regular private events, workshops, and curated networking gatherings.",
              },
              {
                q: "Can I upgrade, downgrade, or cancel?",
                a: "Yes. Your membership lifecycle supports upgrades, downgrades, renewals, expirations, and cancellations.",
              },
              {
                q: "Do members also get virtual access?",
                a: "Yes. Higher tiers include virtual calls, Q&A sessions, and recordings in addition to in-person and platform benefits.",
              },
            ].map((item) => (
              <Card key={item.q}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{item.a}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

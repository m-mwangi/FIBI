import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useMembership } from "../context/MembershipContext";
import { MembershipStatusCard } from "../components/membership/MembershipStatus";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

/** Mirrors the server's floor, so the counter and the 400 agree. */
const MIN_ANSWER = 20;
const MAX_ANSWER = 2000;

const QUESTIONS = [
  {
    key: "motivation" as const,
    label: "Why do you want to join?",
    hint: "What are you hoping membership changes for you?",
    placeholder: "I'm building a climate-tech startup and want a room of people who've done it…",
  },
  {
    key: "interests" as const,
    label: "Which member experiences interest you most?",
    hint: "Events, founder sessions, the private channels, deal flow — tell us what you'd actually use.",
    placeholder: "Mostly the founder Q&As and the in-person workshops…",
  },
  {
    key: "contribution" as const,
    label: "How will you contribute to the community?",
    hint: "Members are chosen partly on what they bring, not only what they want.",
    placeholder: "I've run growth at two marketplaces and can help members with early distribution…",
  },
];

type FormState = { motivation: string; interests: string; contribution: string };

export default function MembershipApplication() {
  const navigate = useNavigate();
  const { applyForMembership, membership, stage, latestApplication } = useMembership();

  const [form, setForm] = useState<FormState>({ motivation: "", interests: "", contribution: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // An application already in flight, or already approved, has nothing to
  // submit — the form would only produce a 409.
  const locked = stage === "pending" || stage === "awaiting_payment" || membership.status === "active";

  const tooShort = (value: string) => value.trim().length > 0 && value.trim().length < MIN_ANSWER;
  const complete = QUESTIONS.every(({ key }) => form[key].trim().length >= MIN_ANSWER);

  const submit = async () => {
    setError("");
    setBusy(true);
    const res = await applyForMembership({
      motivation: form.motivation,
      interests: form.interests,
      communityContribution: form.contribution,
    });
    setBusy(false);
    if (!res.success) {
      setError(res.error ?? "Application failed.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-24">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          to="/membership"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to membership
        </Link>

        <div className="mt-4">
          <MembershipStatusCard
            membership={membership}
            stage={stage}
            feedback={latestApplication?.adminFeedback}
          />
        </div>

        {submitted ? (
          <Card className="mt-6 border-emerald-200">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">Application submitted</h2>
              <p className="max-w-md text-slate-600">
                The membership team reviews every application by hand. You'll get an email as soon
                as there's a decision — usually within a few days.
              </p>
              <div className="mt-2 flex gap-3">
                <Button variant="outline" onClick={() => navigate("/membership")}>
                  Back to membership
                </Button>
                <Link to="/dashboard">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Go to dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : locked ? (
          <Card className="mt-6">
            <CardContent className="py-10 text-center">
              <p className="text-slate-700">
                {stage === "pending"
                  ? "Your application is already under review — there's nothing more to submit."
                  : "You're already approved. Head to billing to pick your tier."}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to="/membership/billing">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Go to billing</Button>
                </Link>
                <Link to="/membership">
                  <Button variant="outline">Back to membership</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Membership application</CardTitle>
              <p className="text-sm text-slate-600">
                Three questions. Applications are read by a person, so specifics help far more than
                length.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              {QUESTIONS.map((question) => {
                const value = form[question.key];
                const short = tooShort(value);
                return (
                  <div key={question.key} className="space-y-2">
                    <Label className="text-base">{question.label}</Label>
                    <p className="text-xs text-slate-500">{question.hint}</p>
                    <Textarea
                      value={value}
                      maxLength={MAX_ANSWER}
                      placeholder={question.placeholder}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [question.key]: e.target.value }))
                      }
                      className={`min-h-[110px] ${short ? "border-amber-300" : ""}`}
                    />
                    <div className="flex justify-between text-xs">
                      <span className={short ? "text-amber-600" : "text-transparent"}>
                        At least {MIN_ANSWER} characters
                      </span>
                      <span className="text-slate-400">
                        {value.trim().length}/{MAX_ANSWER}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button
                  onClick={() => void submit()}
                  disabled={busy || !complete}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    "Submit application"
                  )}
                </Button>
                <Button variant="outline" onClick={() => navigate("/membership")}>
                  Cancel
                </Button>
                {!complete && (
                  <p className="self-center text-xs text-slate-500">
                    Answer all three questions to submit.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

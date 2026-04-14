import { useState } from "react";
import { useNavigate } from "react-router";
import { useMembership } from "../context/MembershipContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export default function MembershipApplication() {
  const navigate = useNavigate();
  const { applyForMembership, membership } = useMembership();
  const [motivation, setMotivation] = useState("");
  const [interests, setInterests] = useState("");
  const [contribution, setContribution] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess("");
    setBusy(true);
    const res = await applyForMembership({
      motivation,
      interests,
      communityContribution: contribution,
    });
    setBusy(false);
    if (!res.success) {
      setError(res.error ?? "Application failed.");
      return;
    }
    setSuccess("Application submitted. Admin will review and respond.");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Membership Application</CardTitle>
            <p className="text-sm text-slate-600">
              Applications are reviewed manually to keep the community high-quality and trusted.
            </p>
            <p className="text-xs text-slate-500">
              Current status: <span className="capitalize font-medium">{membership.applicationStatus}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <div className="space-y-2">
              <Label>Why do you want to join?</Label>
              <Textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="min-h-[96px]"
              />
            </div>

            <div className="space-y-2">
              <Label>What member experiences are you most interested in?</Label>
              <Textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="min-h-[96px]"
              />
            </div>

            <div className="space-y-2">
              <Label>How will you contribute to the community?</Label>
              <Textarea
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="min-h-[96px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => void submit()} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700">
                {busy ? "Submitting..." : "Submit application"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/membership")}>
                Back to membership
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

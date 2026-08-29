/**
 * The Cianda Polo & Forest City — master plan and its linked components.
 *
 * Source: "The Cianda Polo & Forest City — Complete Investor Presentation
 * (Final, 2026)". Base master plan by Artis Designs & Associates with Amolia
 * Properties; funding partner track, Fibi Investors Community.
 *
 * WHY THE NUMBERS LOOK LIKE THIS
 *
 * The deck is denominated in KES; every other listing on this platform is in
 * USD, and the marketplace only lets an investor compare minimums and targets
 * if they share a currency. So the funding targets here are the deck's own
 * capital line items converted at the deck's own rate of KES 129/USD, and the
 * KES figures are kept verbatim in the descriptions and features where an
 * investor will read them next to the deck itself.
 *
 * Section 9.1 gives eight capital lines, four of which (land, base
 * infrastructure) are site-wide rather than per-zone. Those two are spread
 * across the components by acreage — KES 23,439,200,000 over 924.4 acres, or
 * KES 25,356,123/acre — and each zone then carries its own upgrade line on
 * top. The components sum back to the deck's KES 25,839,200,000 total exactly;
 * see the assertion at the foot of this file, which runs on import.
 *
 * ROI: the deck states one project-level figure — ≈103.6% over the delivery
 * horizon, not per year. Scenario B recovers capital in years 3–4 and
 * completes in years 4–6, so 15.3% is the annualised equivalent over five
 * years, and that is what every entry carries. The deck does not break return
 * down by component and neither does this file: the amenity components (Dome,
 * racquet club, motocross) carry no direct unit-sale revenue at all, and their
 * recurring income is explicitly excluded from the 103.6%. Each of them says
 * so in its own description rather than showing an invented standalone yield.
 *
 * Images are placeholders. The Chukka Dome carries a real immersive-dome
 * interior, since a landscape said nothing about what that venue is; the rest
 * reuse the existing hero library. Replace all of them with renders from the
 * Artis master plan before this goes in front of investors.
 */

const KES_PER_USD = 129;

/** USD major units -> integer minor units, the money format the API speaks. */
const usd = (majorUnits) => BigInt(Math.round(majorUnits * 100));

const CIANDA_LOCATION = "Tigoni, Kiambu County";

/**
 * Shared across the whole master plan: quarterly reporting is the cadence the
 * deck proposes for Fibi investors (Section 11), and the annualised ROI is a
 * master-plan-level figure, not a per-component one.
 */
const MASTER_PLAN_ROI = 15.3;
const PAYOUT_FREQUENCY = "Quarterly";

const ciandaMasterPlan = {
  title: "The Cianda Polo & Forest City",
  location: CIANDA_LOCATION,
  category: "master-plan",
  minInvestmentMinor: usd(250_000),
  totalFundingMinor: usd(200_300_000),
  currentFundingMinor: 0n,
  currency: "USD",
  investorsCount: 0,
  projectedROI: MASTER_PLAN_ROI,
  payoutFrequency: PAYOUT_FREQUENCY,
  fundingDeadline: new Date("2027-03-31"),
  description:
    "A 924.4-acre master-planned equestrian residential city in Tigoni, 23km from Nairobi CBD along the Kiambu Road corridor. It pairs a fast-recovering diplomatic-housing revenue engine with an ultra-exclusive equestrian patron tier, against the comparables that define the category globally — Wellington FL and Emaar's Grand Polo Club, Dubai. Capital requirement KES 25.84B (≈USD 200.3M at KES 129/USD) against KES 52.6B projected gross revenue. Funding the full amount removes the original deck's single biggest execution risk: later phases waiting on presale velocity. The seven components below are the same development, funded and delivered in parallel.",
  features: [
    "924.4 acres in Tigoni, 23km from Nairobi CBD",
    "Anchored by the UN's confirmed $340M expansion of its Gigiri complex",
    "Muthaiga–Kiambu–Ndumberi dual carriageway EPC signed March 2026 (KES 38.7B)",
    "KES 52.6B projected gross revenue against KES 25.84B capital",
    "≈103.6% project-level ROI over the delivery horizon",
    "Seven linked components, funded in parallel rather than in sequence",
    "Base master plan: Artis Designs & Associates with Amolia Properties",
  ],
  imageUrl: "/images/hero3.png",
  images: ["/images/hero3.png", "/images/hero5.jpeg", "/images/hero7.png", "/images/hero12.jpeg"],
  status: "open",
  timeline: [
    { phase: "Investor syndication — Fibi Investors Community", status: "in_progress" },
    { phase: "Year 1 — Land acquisition and parallel infrastructure start", status: "upcoming" },
    { phase: "Year 2 — Vertical construction and sales launch across all tiers", status: "upcoming" },
    { phase: "Year 3–4 — First handovers and 100% capital recovery", status: "upcoming" },
    { phase: "Year 4–6 — Full delivery and handover to the estate HOA", status: "upcoming" },
  ],

  // Each component links back to this project through Project.parentId.
  components: [
    {
      title: "Cianda Diplomatic Belt",
      location: CIANDA_LOCATION,
      category: "residential",
      minInvestmentMinor: usd(100_000),
      totalFundingMinor: usd(108_110_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-03-31"),
      description:
        "550 acres of serviced residential product: 1,600 quarter-acre plots, 200 half-acre plots, 600 diplomatic apartments and 80 four-bedroom villas. This is the master plan's revenue engine — KES 43.6B of its KES 52.6B gross revenue — underwritten by the UN's Gigiri expansion and by commute times the new Muthaiga–Kiambu–Ndumberi dual carriageway cuts toward the diplomatic zone. Karen, Runda and Lower Kabete cannot offer this acreage or air quality any more; that is the demand this belt is built against.",
      features: [
        "1,600 quarter-acre serviced plots at KES 15M each",
        "200 half-acre serviced plots at KES 26M each",
        "600 diplomatic apartments (2 and 3 bed) at KES 18M average",
        "80 four-bedroom diplomatic villas at KES 45M each",
        "KES 43.6B gross revenue — 83% of the master plan total",
        "Demand anchored by the UN's $340M Gigiri complex expansion",
      ],
      imageUrl: "/images/hero8.jpg",
      images: ["/images/hero8.jpg", "/images/hero6.jpg"],
      status: "open",
      timeline: [
        { phase: "Land acquisition and titling", status: "upcoming" },
        { phase: "Bulk infrastructure and plot servicing", status: "upcoming" },
        { phase: "Off-plan sales launch across all tiers", status: "upcoming" },
        { phase: "Vertical construction — apartments and villas", status: "upcoming" },
        { phase: "First handovers", status: "upcoming" },
      ],
    },
    {
      title: "The Patrons' Enclave at Cianda",
      location: CIANDA_LOCATION,
      category: "estate-lots",
      minInvestmentMinor: usd(250_000),
      totalFundingMinor: usd(21_980_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-06-30"),
      description:
        "100 acres cut into no more than 40 estate lots of 2–2.5 acres, with a private gatehouse and its own access. The lot size is the whole point: Sarasota Polo Club runs 5–40 acres, and Wellington and Emaar's Grand Polo Club both use estate-scale lots with heavy landscape buffering rather than fences as the privacy mechanism. At genuine UHNW level 2–5 acres reads as an estate and sub-acre reads as a subdivision, however good the house on it is — which is why this replaces the original 1-acre plan.",
      features: [
        "No more than 40 estate lots, 2–2.5 acres each",
        "Private gatehouse and dedicated access road",
        "KES 150M per lot — KES 6B gross revenue",
        "Landscape buffering rather than perimeter fencing",
        "Provision for private helipads on individual lots",
        "Benchmarked against Wellington FL and Grand Polo Club, Dubai",
      ],
      imageUrl: "/images/hero12.jpeg",
      images: ["/images/hero12.jpeg", "/images/hero10.jpeg"],
      status: "open",
      timeline: [
        { phase: "Enclave land assembly", status: "upcoming" },
        { phase: "Privacy, gatehouse and access works", status: "upcoming" },
        { phase: "Lot titling and staged release", status: "upcoming" },
        { phase: "Patron placement", status: "upcoming" },
      ],
    },
    {
      title: "The Cianda Equestrian Core",
      location: CIANDA_LOCATION,
      category: "equestrian",
      minInvestmentMinor: usd(100_000),
      totalFundingMinor: usd(27_460_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-03-31"),
      description:
        "120 acres holding the Sovereign Equestrian Concept: a professional turf racecourse loop, regulation polo fields, cross-country trails, a riding academy and state-of-the-art stabling. A regulation field is 300 x 160 yards — about nine American football fields side by side — and a serious player keeps a string of 4–8 horses, because a horse plays only a few chukkas before it needs rest. That makes the stable, veterinary and recovery infrastructure the sport's real operating cost centre rather than set-dressing, and it is the first thing a serious buyer checks.",
      features: [
        "Regulation polo fields and a professional turf racecourse loop",
        "Individually climate-controlled stalls, not barn rows",
        "On-site equine veterinary clinic and ambulance, not a visiting service",
        "Equine treadmill and hydrotherapy recovery pool",
        "Resident training professional and a high-goal player as club patron",
        "Horse concierge: sourcing, conditioning and tournament logistics",
        "Polo-grade turf needs a 12–18 month grow-in before competitive play",
      ],
      imageUrl: "/images/hero9.jpeg",
      images: ["/images/hero9.jpeg", "/images/hero1.jpeg"],
      status: "open",
      timeline: [
        { phase: "Field grading, drainage and racecourse loop", status: "upcoming" },
        { phase: "Turf establishment — 12–18 month grow-in", status: "upcoming" },
        { phase: "Stables, veterinary clinic and riding academy", status: "upcoming" },
        { phase: "First tournament season", status: "upcoming" },
      ],
    },
    {
      title: "The Chukka Dome at Cianda",
      location: CIANDA_LOCATION,
      category: "entertainment",
      minInvestmentMinor: usd(50_000),
      totalFundingMinor: usd(9_300_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-09-30"),
      description:
        "A 60–80 seat immersive broadcast venue at the clubhouse — a chukka being a period of play in polo, which ties the room to the estate's identity. Cosm's public venues wrap 180 degrees around the audience at 12K+ resolution and cost $80–90M at 700–1,500 seats; this uses the same class of curved LED and engine technology at private clubhouse scale. Programming runs live football, F1 and polo, including same-day replay of the estate's own tournaments. Returns here are underwritten at the master-plan level: the Dome carries no unit-sale revenue of its own, and its event-hire income is deliberately excluded from the 103.6% project ROI.",
      features: [
        "60–80 tiered seats with private boxes",
        "Curved LED wall or partial dome, CX-engine-class AV — KES 900M–1.4B",
        "Deck, lounge, bar and fit-out — KES 250M–400M",
        "Same-day replay of the estate's own polo tournaments",
        "Event-hire revenue is upside, not counted in the master-plan ROI",
        "Budget is a planning-level scaling estimate, not yet a vendor quote",
      ],
      // A real immersive-dome interior — screen wrapping the audience above
      // tiered seating — rather than a landscape. See IMAGE-CREDITS.md: it is
      // a planetarium, not a Cosm venue, and not a render of this design.
      imageUrl: "/images/chukka-dome-1.jpg",
      images: ["/images/chukka-dome-1.jpg", "/images/chukka-dome-2.jpg"],
      status: "open",
      timeline: [
        { phase: "Direct quote from Cosm's private licensing team", status: "upcoming" },
        { phase: "AV specification and dome design", status: "upcoming" },
        { phase: "Clubhouse integration and build", status: "upcoming" },
        { phase: "Commissioning and first broadcast season", status: "upcoming" },
      ],
    },
    {
      title: "Cianda Racquet & Golf Club",
      location: CIANDA_LOCATION,
      category: "sports-leisure",
      minInvestmentMinor: usd(25_000),
      totalFundingMinor: usd(1_160_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-09-30"),
      description:
        "Padel, pickleball, tennis and a private short-game golf facility, sited together beside the clubhouse. The pairing is deliberate: padel — glass-walled, enclosed — is the status racquet sport among wealthy players across Europe and the Middle East, while pickleball is the equivalent boom sport in the same wealth bracket in the United States. Offering both signals an international buyer base rather than a regional one. Like the other amenity components, it is underwritten at master-plan level rather than on its own membership income.",
      features: [
        "2–4 tennis courts, grass and clay options",
        "Glass-walled padel courts",
        "Pickleball courts sited alongside padel",
        "Private short-game golf facility / 9-hole loop",
        "Clustered beside the clubhouse for a single leisure spine",
      ],
      imageUrl: "/images/hero10.jpeg",
      images: ["/images/hero10.jpeg"],
      status: "open",
      timeline: [
        { phase: "Court siting and design", status: "upcoming" },
        { phase: "Surfacing and enclosure works", status: "upcoming" },
        { phase: "Clubhouse integration", status: "upcoming" },
        { phase: "Member programming launch", status: "upcoming" },
      ],
    },
    {
      title: "Cianda Motocross & Quad Park",
      location: CIANDA_LOCATION,
      category: "sports-leisure",
      minInvestmentMinor: usd(25_000),
      totalFundingMinor: usd(1_550_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-12-31"),
      description:
        "A 15–20 acre dirt-bike and quad track inside the Eco-Sanctuary buffer, with substantial berm and tree separation from the stables and polo fields. That separation is a design non-negotiable rather than a preference: horses are highly sensitive to engine noise, so the acoustic siting study comes before the earthworks. Day-pass and event income is upside outside the master plan's stated ROI.",
      features: [
        "15–20 acre dedicated dirt-bike and quad-bike track",
        "Sited within the Eco-Sanctuary buffer",
        "Berm and tree acoustic separation from the Equestrian Core",
        "Day-pass revenue as upside, outside the master-plan ROI",
      ],
      imageUrl: "/images/hero4.png",
      images: ["/images/hero4.png"],
      status: "open",
      timeline: [
        { phase: "Acoustic and physical siting study", status: "upcoming" },
        { phase: "Track earthworks and separation berms", status: "upcoming" },
        { phase: "Pit area and facilities", status: "upcoming" },
        { phase: "Operations launch", status: "upcoming" },
      ],
    },
    {
      title: "Cianda Eco-Sanctuary & Estate Infrastructure",
      location: CIANDA_LOCATION,
      category: "eco-infrastructure",
      minInvestmentMinor: usd(100_000),
      totalFundingMinor: usd(30_740_000),
      currentFundingMinor: 0n,
      currency: "USD",
      investorsCount: 0,
      projectedROI: MASTER_PLAN_ROI,
      payoutFrequency: PAYOUT_FREQUENCY,
      fundingDeadline: new Date("2027-06-30"),
      description:
        "154.4 acres of forest buffer, dams and greenhouses, plus the estate's institutional spine — schools, a specialist hospital, a wellness and longevity clinic, and the commercial centre — which together carry KES 3B of the master plan's gross revenue on lease. This component also holds the aviation programme: a shared helipad at the clubhouse, provision for private pads on Patrons' Enclave lots, and the KES 50M airspace feasibility study. A fixed-wing airstrip is not feasible on this footprint — midsize business jets need 150–250+ acres, more than the entire Equestrian Core — so no aviation claim should be made to buyers before that study reports.",
      features: [
        "Forest buffer, dams and greenhouses across 154.4 acres",
        "School, specialist hospital and commercial centre leases — KES 3B",
        "Wellness and longevity clinic alongside the hospital lease",
        "Shared helipad at the clubhouse, private pads on Patrons' lots",
        "KES 50M aviation and airspace feasibility study",
        "Fixed-wing airstrip not feasible here — Northlands City is the fallback",
      ],
      imageUrl: "/images/hero2.jpeg",
      images: ["/images/hero2.jpeg", "/images/avo3.jpg"],
      status: "open",
      timeline: [
        { phase: "Aviation and airspace feasibility study", status: "upcoming" },
        { phase: "Forest buffer, dams and water works", status: "upcoming" },
        { phase: "School, hospital and commercial lease negotiations", status: "upcoming" },
        { phase: "Commercial centre delivery", status: "upcoming" },
      ],
    },
  ],
};

/**
 * The deck's Section 9.1 total. If a component's funding target is edited
 * without the master's moving to match, the two stop reconciling and the
 * master plan page starts contradicting its own component list — so fail at
 * import rather than seed a set of numbers that does not add up.
 */
const componentTotalMinor = ciandaMasterPlan.components.reduce(
  (sum, component) => sum + component.totalFundingMinor,
  0n
);

if (componentTotalMinor !== ciandaMasterPlan.totalFundingMinor) {
  throw new Error(
    `Cianda components total ${componentTotalMinor} minor units but the master plan asks for ` +
      `${ciandaMasterPlan.totalFundingMinor}. They must reconcile — see Section 9.1 of the deck.`
  );
}

module.exports = { ciandaMasterPlan, KES_PER_USD };

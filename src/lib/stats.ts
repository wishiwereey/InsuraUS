/**
 * Sourced industry statistics used on the landing page (and mirrored in the
 * README). Keep the wording faithful to the source; `caveat` is shown in small
 * print where the figure needs context.
 */

export interface SourcedStat {
  id: string;
  value: string;
  label: string;
  source: string;
  url: string;
  caveat?: string;
}

export const STATS: SourcedStat[] = [
  {
    id: "kff",
    value: "$6,850",
    label: "a year — what the average worker pays toward family health coverage, before any doctor visit (~$570 a month).",
    source: "KFF Employer Health Benefits Survey, 2025",
    url: "https://www.kff.org/health-costs/press-release/2025-employer-health-benefits-survey/",
  },
  {
    id: "literacy",
    value: "14%",
    label: "of insured Americans could correctly explain all four basics: deductible, copay, coinsurance and out-of-pocket maximum.",
    source: "Loewenstein et al., Journal of Health Economics, 2013",
    url: "https://www.cmu.edu/news/stories/archives/2013/august/aug1_understandinghealthinsurance.html",
  },
  {
    id: "overconfidence",
    value: "86%",
    label: "say they understand their insurance — yet 56% don't know a standard homeowners policy excludes flood damage.",
    source: "Trusted Choice / Big “I” consumer survey, 2024",
    url: "https://www.businesswire.com/news/home/20240618486693/en/Survey-Most-Americans-Do-Not-Fully-Understand-Insurance-Coverage...Yet-86-Say-They-Do",
    caveat: "Survey of ~400 U.S. consumers commissioned by independent agents.",
  },
  {
    id: "shopping",
    value: "57%",
    label: "of auto insurance customers shopped for a new policy in the past year — the highest in the study's 19-year history.",
    source: "J.D. Power U.S. Insurance Shopping Study, 2025",
    url: "https://www.insurancejournal.com/news/national/2025/05/02/822373.htm",
  },
];

export const DEDUCTIBLE_FACT = {
  text: "Raising a collision/comprehensive deductible from $200 to $1,000 can cut that part of the premium by 40% or more.",
  source: "Insurance Information Institute (as cited by Compare.com)",
  url: "https://www.compare.com/auto-insurance/resources/high-or-low-deductible",
};

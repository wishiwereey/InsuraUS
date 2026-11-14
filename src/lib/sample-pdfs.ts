import { DecPageBuilder, type CarrierBrand } from "./pdf/dec-page-builder";

/**
 * Generates realistic (but entirely fictional) US insurance documents for the
 * demo presets. Every number here is internally consistent so the Gemini audit
 * has real material to reason over — nothing about the *analysis* is hardcoded.
 *
 * Seeded "bloat" the auditor should find on its own:
 *  Miller (Austin, TX — $8,640/yr):
 *   - $250 collision/comprehensive deductibles on both cars (incl. a 2014 Civic worth ~$7k)
 *   - Towing & Labor on each car AND a "Premier Roadside Plus" endorsement (duplicate)
 *   - Identity theft coverage bought on BOTH the auto and home policies (duplicate)
 *   - Family PPO with very low utilization while a cheaper HSA plan + employer seed is offered
 *   - Supplemental accident plan stacked on a low-deductible PPO
 *   - No multi-policy bundle; monitored-alarm discount missing (certificate not on file)
 *  Rivera (San Diego, CA — $3,420/yr):
 *   - Collision + $250 comprehensive on a 2012 Mazda3 with ~$6,500 actual cash value
 *   - Liability at California minimums for a high-earning renter (underinsured)
 *   - Hybrid commuter not receiving low-mileage discount
 *   - Platinum PPO for a healthy single person with 1 visit last year
 */

export { SAMPLE_DOCS, isSampleId, type SampleId } from "./samples-meta";
import type { SampleId } from "./samples-meta";

// ---------------------------------------------------------------------------
// Brands (fictional)

const LONE_STAR: CarrierBrand = {
  name: "Lone Star Mutual Insurance Company",
  tagline: "Personal Auto  •  NAIC #00000 (specimen)  •  Domiciled in Texas",
  address: "PO Box 9100, Round Rock, TX 78680",
  phone: "1-800-555-0142",
  color: [30, 64, 175],
  formNumber: "LSM-TX-DEC 01 (07/24)",
};

const BLUEBONNET: CarrierBrand = {
  name: "Bluebonnet Health Plans",
  tagline: "Employer Group Medical  •  PPO Network: Bluebonnet Choice",
  address: "1200 Congress Ave, Austin, TX 78701",
  phone: "1-888-555-0177",
  color: [79, 70, 229],
  formNumber: "BHP-ENR-2026 (10/25)",
};

const HILL_COUNTRY: CarrierBrand = {
  name: "Hill Country Home & Casualty",
  tagline: "Homeowners Program  •  Texas Department of Insurance Form HO-3",
  address: "500 W 5th St, Austin, TX 78701",
  phone: "1-866-555-0119",
  color: [6, 95, 70],
  formNumber: "HCH HO-3 DEC (03/25)",
};

const PACIFIC_CREST: CarrierBrand = {
  name: "Pacific Crest Auto Insurance",
  tagline: "California Personal Auto  •  CA DOI License (specimen)",
  address: "4250 Executive Sq, La Jolla, CA 92037",
  phone: "1-877-555-0163",
  color: [14, 116, 144],
  formNumber: "PCA-CA-DEC 02 (01/25)",
};

const HARBOR: CarrierBrand = {
  name: "Harbor Mutual Renters Insurance",
  tagline: "HO-4 Tenant Program  •  California",
  address: "600 B St, San Diego, CA 92101",
  phone: "1-855-555-0108",
  color: [190, 18, 60],
  formNumber: "HMR HO-4 DEC (05/25)",
};

const GOLDEN_COAST: CarrierBrand = {
  name: "Golden Coast Health",
  tagline: "Large Group Medical  •  Platinum PPO Network",
  address: "1 Market St, San Francisco, CA 94105",
  phone: "1-800-555-0190",
  color: [180, 83, 9],
  formNumber: "GCH-SBC-PLT (09/25)",
};

const usd = (n: number, cents = true) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;

// ---------------------------------------------------------------------------
// Miller family — Austin, TX

async function millerAuto() {
  const b = await DecPageBuilder.create(LONE_STAR, "Auto Policy Declarations", "Texas Personal Auto Policy — Renewal");
  b.notice(
    "This Declarations Page, together with the Texas Personal Auto Policy form and any endorsements listed below, completes your policy. Please review it carefully and contact your agent if any information is incorrect.",
  );
  b.section("Policy Information");
  b.keyValues([
    ["Named Insured", "David R. Miller & Sarah L. Miller"],
    ["Policy Number", "LSM-TX-4471-208815"],
    ["Mailing Address", "4817 Barton Hills Dr, Austin, TX 78704"],
    ["Policy Period", "01/15/2026 to 01/15/2027 12:01 AM standard time"],
    ["Agent", "Travis County Insurance Group — Agency #TX-30471"],
    ["Transaction", "Renewal — Term 6 (customer since 2020)"],
    ["Payment Plan", "Monthly EFT — 12 installments of $230.00"],
    ["Prior Claims (5 yrs)", "None"],
  ]);

  b.section("Listed Drivers");
  b.table(
    ["Driver", "DOB", "License", "Relationship", "Violations / Accidents"],
    [
      ["David R. Miller", "03/11/1984", "TX ****8841", "Named Insured", "None"],
      ["Sarah L. Miller", "08/27/1986", "TX ****2290", "Spouse", "None"],
    ],
    { colWidths: [0.26, 0.15, 0.17, 0.18, 0.24] },
  );

  b.section("Described Vehicles");
  b.table(
    ["Veh", "Year / Make / Model", "VIN", "Use / Annual Miles", "Lienholder"],
    [
      ["1", "2021 Toyota Highlander XLE AWD", "5TDGZRBH1MS104582", "Commute / 11,000", "Toyota Motor Credit Corp"],
      ["2", "2014 Honda Civic LX Sedan", "19XFB2F59EE204871", "Pleasure / 6,500", "None — owned outright"],
    ],
    { colWidths: [0.06, 0.3, 0.24, 0.18, 0.22] },
  );

  b.section("Coverages, Limits & Premiums (12-Month Term)");
  b.table(
    ["Coverage", "Limits", "Deductible", "Veh 1 Premium", "Veh 2 Premium"],
    [
      ["Part A — Bodily Injury Liability", "$100,000 each person / $300,000 each accident", "—", usd(312), usd(290)],
      ["Part A — Property Damage Liability", "$100,000 each accident", "—", usd(168), usd(156)],
      ["Part C — Uninsured/Underinsured Motorist BI", "$100,000 / $300,000", "—", usd(96), usd(90)],
      ["Personal Injury Protection (PIP)", "$2,500 each person", "—", usd(64), usd(60)],
      ["Part D — Collision", "Actual Cash Value", "$250", usd(500), usd(372)],
      ["Part D — Comprehensive (Other Than Collision)", "Actual Cash Value", "$250", usd(214), usd(168)],
      ["Rental Reimbursement", "$40 per day / 30 days max", "—", usd(48), usd(48)],
      ["Towing & Labor", "$100 per disablement", "—", usd(24), usd(24)],
      ["Vehicle Subtotal", "", "", usd(1426), usd(1208)],
    ],
    { colWidths: [0.32, 0.3, 0.1, 0.14, 0.14], align: ["left", "left", "center", "right", "right"], boldLastRow: true },
  );

  b.section("Policy-Level Endorsements & Fees");
  b.table(
    ["Form", "Description", "Annual Premium"],
    [
      ["LSM-RSP-02", "Premier Roadside Plus — 24/7 towing up to 100 miles, lockout, jump-start, fuel delivery, flat tire service", usd(72)],
      ["LSM-IDS-01", "Identity Shield Add-On — identity theft restoration expenses up to $25,000", usd(44)],
      ["TX MVCPA", "Motor Vehicle Crime Prevention Authority fee ($5.00 per vehicle, state-mandated)", usd(10)],
    ],
    { colWidths: [0.16, 0.66, 0.18], align: ["left", "left", "right"] },
  );

  b.totalBox("Total 12-Month Policy Premium", usd(2760), "Includes all vehicles, endorsements and fees");

  b.section("Discounts Applied");
  b.bullets([
    "Multi-Car Discount (2 vehicles) — applied",
    "Claims-Free Discount (5 yrs) — applied",
    "Anti-Theft Device (Veh 1) — applied",
  ]);
  b.section("Discounts Available — Not Applied");
  b.bullets([
    "Multi-Policy (Home + Auto) Discount — up to 15% of auto premium. Requires an active Lone Star Mutual or affiliated homeowners policy. No affiliated property policy on file.",
    "Paperless & Paid-in-Full Discount — 6%. Current billing: monthly EFT with paper statements.",
    "Texas Defensive Driving Course Discount — 10% of liability premium for 3 years upon certificate submission (TDLR-approved course).",
  ]);

  b.pageBreak();
  b.section("Loss Payee / Additional Interest");
  b.paragraph("Vehicle 1: Toyota Motor Credit Corp, PO Box 105386, Atlanta, GA 30348 — Loss Payee. The lienholder requires Collision and Comprehensive coverage with deductibles not exceeding $1,000.");
  b.paragraph("Vehicle 2: No lienholder on file. Physical damage coverage on this vehicle is optional.");

  b.section("Vehicle Valuation Reference (for physical damage claims)");
  b.table(
    ["Vehicle", "Estimated Actual Cash Value*", "Odometer at Renewal"],
    [
      ["2021 Toyota Highlander XLE AWD", "$33,800", "48,210"],
      ["2014 Honda Civic LX Sedan", "$7,200", "131,940"],
    ],
    { colWidths: [0.45, 0.3, 0.25], align: ["left", "right", "right"] },
  );
  b.paragraph("*ACV estimates are provided for reference only and are not a guarantee of claim settlement. Total loss settlements are determined at the time of loss based on market value, less the applicable deductible.", { size: 7, italic: true, muted: true });

  b.section("Forms & Endorsements Attached");
  b.bullets([
    "PP 00 01 TX — Texas Personal Auto Policy (standard form)",
    "LSM-RSP-02 — Premier Roadside Plus Endorsement",
    "LSM-IDS-01 — Identity Shield Endorsement",
    "TX-PIP-ACK — Personal Injury Protection acceptance on file",
    "TX-UM-ACK — Uninsured/Underinsured Motorist acceptance on file",
  ]);

  b.section("Important Policy Conditions");
  b.paragraph("PART D — COVERAGE FOR DAMAGE TO YOUR AUTO. We will pay for direct and accidental loss to your covered auto, including its equipment, minus any applicable deductible shown in the Declarations. Our limit of liability for loss will be the lesser of the actual cash value of the stolen or damaged property, or the amount necessary to repair or replace the property with other property of like kind and quality.");
  b.paragraph("TOWING AND LABOR COSTS. We will pay towing and labor costs incurred each time your covered auto is disabled, up to the limit shown in the Declarations, provided labor is performed at the place of disablement. Premier Roadside Plus, if purchased, provides services through our contracted roadside network; benefits under both coverages are not cumulative for the same disablement.");
  b.paragraph("RENTAL REIMBURSEMENT. We will pay up to the daily limit shown for transportation expenses incurred when your covered auto is withdrawn from use for more than 24 hours due to a covered Part D loss.");
  b.paragraph("TEXAS MINIMUM FINANCIAL RESPONSIBILITY. Texas law requires liability limits of at least $30,000 per injured person, $60,000 per accident, and $25,000 property damage (30/60/25). Your limits exceed these minimums.");
  b.paragraph("CANCELLATION. You may cancel this policy at any time by notifying us. Unearned premium will be refunded on a pro-rata basis. A minimum earned premium of $25 applies.");
  b.signature("M. Hollis", "Authorized Representative, Lone Star Mutual Insurance Company");
  return b.finish();
}

async function millerHealth() {
  const b = await DecPageBuilder.create(BLUEBONNET, "Benefits Enrollment Confirmation", "Plan Year 2026 — Summary of Benefits & Coverage");
  b.notice(
    "This confirmation reflects the elections made during Open Enrollment (Nov 1 – Nov 22, 2025). Elections are binding for the plan year unless you experience a Qualifying Life Event. Coverage period: 01/01/2026 – 12/31/2026.",
  );
  b.section("Enrollment Details");
  b.keyValues([
    ["Subscriber", "David R. Miller (Employee ID 00418827)"],
    ["Employer / Group", "Capital Metro Engineering LLC — Group #BHP-77310"],
    ["Member ID", "BBN884120775-01"],
    ["Coverage Tier", "Employee + Family (4 members)"],
    ["Covered Members", "David (42), Sarah (40), Emma (11), Noah (8)"],
    ["Network", "Bluebonnet Choice PPO — Central Texas"],
  ]);

  b.section("Your Elected Benefits & Payroll Deductions");
  b.table(
    ["Benefit", "Plan", "Total Monthly Premium", "Employer Pays", "Your Monthly Cost"],
    [
      ["Medical", "Bluebonnet Choice PPO 500", "$2,140.00", "$1,852.00", "$288.00"],
      ["Supplemental Accident", "AccidentGuard Family (indemnity)", "$32.00", "$0.00", "$32.00"],
      ["Total", "", "$2,172.00", "$1,852.00", "$320.00"],
    ],
    { colWidths: [0.2, 0.3, 0.18, 0.15, 0.17], align: ["left", "left", "right", "right", "right"], boldLastRow: true },
  );
  b.totalBox("Your Annual Cost (payroll, pre-tax)", usd(3840), "$320.00 / month x 12");

  b.section("Medical Plan Cost Sharing — Bluebonnet Choice PPO 500");
  b.table(
    ["Benefit", "In-Network", "Out-of-Network"],
    [
      ["Annual Deductible", "$500 individual / $1,000 family", "$1,500 / $3,000"],
      ["Out-of-Pocket Maximum", "$4,000 individual / $8,000 family", "$10,000 / $20,000"],
      ["Coinsurance (after deductible)", "20%", "40%"],
      ["Preventive Care", "$0", "40% after deductible"],
      ["Primary Care Visit", "$25 copay", "40% after deductible"],
      ["Specialist Visit", "$50 copay", "40% after deductible"],
      ["Urgent Care", "$75 copay", "40% after deductible"],
      ["Emergency Room", "$350 copay, then 20% coinsurance", "$350 copay, then 20%"],
      ["Inpatient Hospital Stay", "20% after deductible", "40% after deductible"],
      ["Generic / Preferred / Specialty Rx", "$10 / $40 / 25% up to $250", "Not covered"],
    ],
    { colWidths: [0.32, 0.36, 0.32] },
  );

  b.section("Other Plans Offered by Your Employer (Not Elected)");
  b.table(
    ["Plan", "Your Monthly Cost (Family)", "Deductible (Family)", "OOP Max (Family)", "Employer HSA Contribution"],
    [
      ["Bluebonnet HSA Advantage 3400 (HDHP)", "$142.00", "$3,400", "$7,000", "$1,200 / year"],
      ["Bluebonnet Choice PPO 500 (elected)", "$288.00", "$1,000", "$8,000", "N/A"],
    ],
    { colWidths: [0.3, 0.18, 0.16, 0.16, 0.2], align: ["left", "right", "right", "right", "right"] },
  );
  b.paragraph("HSA Advantage 3400: after the deductible, plan pays 90% (10% coinsurance) in-network. Preventive care covered at 100% before deductible. HSA contributions are triple tax-advantaged; 2026 family contribution limit $8,750 (including employer contribution). Unused HSA funds roll over and are portable.", { size: 7.5 });

  b.pageBreak();
  b.section("Prior Plan Year Utilization Summary (01/01/2025 – 12/31/2025)");
  b.table(
    ["Member", "Office Visits", "Urgent / ER", "Rx Fills", "Allowed Amount", "Member Paid"],
    [
      ["David", "1 (preventive)", "0", "0", "$0.00", "$0.00"],
      ["Sarah", "2 (1 preventive, 1 PCP)", "0", "3 generic", "$412.00", "$55.00"],
      ["Emma", "2 (well-child, 1 PCP)", "1 urgent care", "1 generic", "$610.00", "$110.00"],
      ["Noah", "1 (well-child)", "0", "0", "$0.00", "$0.00"],
      ["Family Total", "6", "1", "4", "$1,022.00", "$165.00"],
    ],
    { colWidths: [0.14, 0.24, 0.14, 0.12, 0.18, 0.18], align: ["left", "left", "center", "center", "right", "right"], boldLastRow: true },
  );
  b.paragraph("Claims history is provided for your planning purposes. Bluebonnet Health Plans does not make plan recommendations.", { size: 7, italic: true, muted: true });

  b.section("Supplemental Accident Plan — AccidentGuard Family");
  b.paragraph("AccidentGuard pays fixed cash benefits directly to you for covered accidental injuries, regardless of other coverage: ER visit $150; fracture $250–$2,500 per schedule; hospital admission $1,000. Benefits are not paid for illness. Annual premium: $384.00. This is not major medical coverage and does not satisfy the individual coverage requirements of the ACA.");

  b.section("Important Information");
  b.bullets([
    "Preventive services required under the Affordable Care Act are covered with no cost sharing in-network.",
    "Out-of-pocket maximum includes deductible, coinsurance and copays. Premiums do not count toward the out-of-pocket maximum.",
    "Surprise billing protections under the federal No Surprises Act apply to emergency services and certain out-of-network care at in-network facilities.",
    "Qualifying Life Events (marriage, birth, loss of coverage, etc.) allow election changes within 30 days. Otherwise, the next opportunity to change plans is Open Enrollment for Plan Year 2027.",
  ]);
  b.paragraph("This Summary of Benefits and Coverage is only a summary. The Certificate of Coverage governs. Premium contributions are deducted pre-tax under the employer's Section 125 cafeteria plan.", { size: 7, italic: true, muted: true });
  return b.finish();
}

async function millerHome() {
  const b = await DecPageBuilder.create(HILL_COUNTRY, "Homeowners Policy Declarations", "Texas Homeowners — Form HO-3 (Special Form) — Renewal");
  b.section("Policy Information");
  b.keyValues([
    ["Named Insured", "David R. Miller & Sarah L. Miller"],
    ["Policy Number", "HCH-HO3-TX-00932716"],
    ["Residence Premises", "4817 Barton Hills Dr, Austin, TX 78704 (Travis County)"],
    ["Policy Period", "04/01/2026 to 04/01/2027 12:01 AM"],
    ["Mortgagee", "Frost Bank, ISAOA/ATIMA — Loan #7720018845"],
    ["Billing", "Escrow — paid by mortgagee"],
  ]);

  b.section("Rating Information");
  b.keyValues(
    [
      ["Year Built", "2003"],
      ["Construction", "Frame / brick veneer"],
      ["Square Feet", "2,450"],
      ["Roof", "Composition shingle — installed 2012"],
      ["Protection Class", "PC 2 — Austin Fire Dept"],
      ["Distance to Hydrant", "< 1,000 ft"],
      ["Protective Devices", "Central station burglar & fire alarm reported — monitoring certificate NOT on file"],
      ["Claims (5 yrs)", "None"],
      ["Wind/Hail Territory", "Travis County — Territory 4"],
    ],
    3,
  );

  b.section("Coverages & Limits");
  b.table(
    ["Section I — Property Coverages", "Limit of Liability"],
    [
      ["Coverage A — Dwelling (Replacement Cost)", "$485,000"],
      ["Coverage B — Other Structures", "$48,500"],
      ["Coverage C — Personal Property (Replacement Cost)", "$242,500"],
      ["Coverage D — Loss of Use", "$97,000"],
    ],
    { colWidths: [0.65, 0.35], align: ["left", "right"] },
  );
  b.table(
    ["Section II — Liability Coverages", "Limit of Liability"],
    [
      ["Coverage E — Personal Liability (each occurrence)", "$300,000"],
      ["Coverage F — Medical Payments to Others (each person)", "$5,000"],
    ],
    { colWidths: [0.65, 0.35], align: ["left", "right"] },
  );

  b.section("Deductibles");
  b.table(
    ["Peril", "Deductible"],
    [
      ["All Other Perils (AOP)", "$1,000"],
      ["Windstorm or Hail", "1% of Coverage A = $4,850"],
    ],
    { colWidths: [0.65, 0.35], align: ["left", "right"] },
  );

  b.section("Premium Summary");
  b.table(
    ["Item", "Annual Premium"],
    [
      ["Base Policy Premium (HO-3)", usd(1762)],
      ["HCH-WBU — Water Backup of Sewers or Drains ($10,000)", usd(95)],
      ["HCH-IDR — Identity Theft Restoration ($25,000)", usd(65)],
      ["HCH-EBK — Home Equipment Breakdown ($50,000)", usd(58)],
      ["HCH-SLN — Service Line Coverage ($10,000)", usd(60)],
      ["Total Annual Premium", usd(2040)],
    ],
    { colWidths: [0.75, 0.25], align: ["left", "right"], boldLastRow: true },
  );
  b.totalBox("Total Annual Premium", usd(2040), "Paid via mortgage escrow");

  b.pageBreak();
  b.section("Discounts");
  b.bullets([
    "Claims-Free (5+ years) — applied",
    "New Roof Credit (roof < 10 yrs) — not eligible (roof age 14 years)",
    "Protective Device Credit — up to 10% for central station monitored alarm. NOT APPLIED: monitoring certificate not received.",
    "Multi-Policy Discount — up to 12% with an affiliated Hill Country auto policy. NOT APPLIED: no affiliated auto policy.",
  ]);

  b.section("Endorsement Descriptions");
  b.paragraph("WATER BACKUP OF SEWERS OR DRAINS (HCH-WBU). Covers direct physical loss caused by water which backs up through sewers or drains or overflows from a sump pump. This peril is excluded under the base HO-3 form. Subject to the AOP deductible.");
  b.paragraph("IDENTITY THEFT RESTORATION (HCH-IDR). Reimburses expenses incurred to restore your identity following a stolen identity event, including notarization, lost wages and attorney fees, up to $25,000. Note: benefits are excess over any other identity theft coverage available to the insured.");
  b.paragraph("EQUIPMENT BREAKDOWN (HCH-EBK). Covers mechanical or electrical breakdown of home systems and appliances (HVAC, water heater, refrigerator) subject to a $500 deductible.");
  b.paragraph("SERVICE LINE (HCH-SLN). Covers repair of underground water, sewer, power and data lines on the residence premises, subject to a $500 deductible.");

  b.section("Key Exclusions & Conditions (Summary)");
  b.bullets([
    "Flood (rising surface water) is NOT covered. Flood insurance is available through the National Flood Insurance Program (NFIP) or private carriers. Residence is in FEMA Zone X (moderate-to-low risk).",
    "Earth movement, foundation settling, and wear and tear are excluded.",
    "Continuous or repeated seepage or leakage of water over 14 or more days is excluded.",
    "Loss settlement for roofs older than 15 years may be on an actual cash value basis per endorsement HCH-RFS (not currently attached).",
    "Mold remediation limited to $5,000 per policy period.",
  ]);
  b.paragraph("LOSS SETTLEMENT. Covered losses to the dwelling under Coverage A are settled at replacement cost without deduction for depreciation, provided the Coverage A limit is at least 80% of the full replacement cost of the dwelling at the time of loss. Estimated reconstruction cost at last inspection: $472,000.");
  b.paragraph("This policy is issued under the laws of the State of Texas. You may file a complaint with the Texas Department of Insurance at 1-800-252-3439 if you have a dispute you cannot resolve with us.", { size: 7, italic: true, muted: true });
  b.signature("R. Castaneda", "President, Hill Country Home & Casualty");
  return b.finish();
}

// ---------------------------------------------------------------------------
// Alex Rivera — San Diego, CA

async function riveraAuto() {
  const b = await DecPageBuilder.create(PACIFIC_CREST, "Auto Policy Declarations", "California Personal Auto Policy — Renewal");
  b.section("Policy Information");
  b.keyValues([
    ["Named Insured", "Alex J. Rivera"],
    ["Policy Number", "PCA-CA-1180-553907"],
    ["Mailing / Garaging Address", "3150 Adams Ave Apt 4B, San Diego, CA 92116"],
    ["Policy Period", "02/01/2026 to 02/01/2027 12:01 AM"],
    ["Payment Plan", "Monthly EFT — 12 x $165.00"],
    ["Good Driver Status (CIC §1861.025)", "Qualified"],
  ]);

  b.section("Driver & Vehicle");
  b.table(
    ["Driver", "Age", "Years Licensed", "Occupation", "Violations"],
    [["Alex J. Rivera", "29", "12", "Software Engineer", "None"]],
    { colWidths: [0.28, 0.1, 0.18, 0.26, 0.18] },
  );
  b.table(
    ["Year / Make / Model", "VIN", "Odometer", "Est. ACV", "Rated Use / Annual Miles"],
    [["2012 Mazda Mazda3 i Sport 4D", "JM1BL1V71C1612345", "128,400", "$6,500", "Commute 15+ mi / 12,000"]],
    { colWidths: [0.28, 0.22, 0.12, 0.12, 0.26], align: ["left", "left", "right", "right", "left"] },
  );
  b.paragraph("Rated annual mileage was carried forward from the 2021 application. Commute days per week on file: 5. Lienholder: None.", { size: 7.5, muted: true });

  b.section("Coverages, Limits & Premiums");
  b.table(
    ["Coverage", "Limits", "Deductible", "Annual Premium"],
    [
      ["Bodily Injury Liability", "$30,000 each person / $60,000 each accident", "—", usd(418)],
      ["Property Damage Liability", "$15,000 each accident", "—", usd(214)],
      ["Uninsured Motorist Bodily Injury", "$30,000 / $60,000", "—", usd(112)],
      ["Medical Payments", "$5,000 each person", "—", usd(68)],
      ["Collision", "Actual Cash Value", "$500", usd(742)],
      ["Comprehensive", "Actual Cash Value", "$250", usd(286)],
      ["Rental Car Reimbursement", "$50 per day / $1,500 max", "—", usd(64)],
      ["Roadside Assistance", "Towing to 15 miles, lockout, jump", "—", usd(36)],
      ["Policy Fee", "", "", usd(40)],
      ["Total Annual Premium", "", "", usd(1980)],
    ],
    { colWidths: [0.32, 0.38, 0.12, 0.18], align: ["left", "left", "center", "right"], boldLastRow: true },
  );
  b.totalBox("Total Annual Premium", usd(1980));

  b.section("Discounts");
  b.bullets([
    "Good Driver Discount (20%, required by California Insurance Code) — applied",
    "Low Mileage Discount (under 7,500 mi/yr) — NOT APPLIED. Rated at 12,000 miles. Submit odometer verification or telematics enrollment to qualify.",
    "Multi-Policy (Auto + Renters) — up to 10%. NOT APPLIED: no affiliated renters policy.",
    "Professional / Alumni Group Discount — available for qualifying employers; not on file.",
  ]);

  b.pageBreak();
  b.section("California Notices");
  b.paragraph("CALIFORNIA MINIMUM LIABILITY. Effective January 1, 2025, California minimum financial responsibility limits are $30,000 per person / $60,000 per accident bodily injury and $15,000 property damage (30/60/15). Your liability limits are AT the state minimum. Minimum limits may be insufficient to protect your assets or future wages if you cause a serious accident. Higher limits (e.g., 100/300/100) and personal umbrella policies are available.");
  b.paragraph("PHYSICAL DAMAGE. Collision and comprehensive coverage pay up to the actual cash value of the vehicle at the time of loss, minus your deductible. For a vehicle with an estimated ACV of $6,500, the maximum collision payout after the $500 deductible is approximately $6,000.");
  b.paragraph("ROADSIDE ASSISTANCE. Services are provided through our network vendor. Benefits are limited to 3 service calls per policy term.");
  b.section("Forms Attached");
  b.bullets(["PCA-PP 01 CA — California Personal Auto Policy", "PCA-RR 03 — Rental Reimbursement", "PCA-RS 02 — Roadside Assistance", "CA UM-Selection — Uninsured Motorist limits selection signed 02/2021"]);
  b.signature("J. Okafor", "Authorized Representative, Pacific Crest Auto Insurance");
  return b.finish();
}

async function riveraRenters() {
  const b = await DecPageBuilder.create(HARBOR, "Renters Policy Declarations", "Form HO-4 (Contents Broad Form) — New Business");
  b.section("Policy Information");
  b.keyValues([
    ["Named Insured", "Alex J. Rivera"],
    ["Policy Number", "HMR-HO4-CA-2209184"],
    ["Residence Premises", "3150 Adams Ave Apt 4B, San Diego, CA 92116"],
    ["Policy Period", "06/15/2026 to 06/15/2027"],
    ["Building Type", "Multi-family, 12 units, sprinklered"],
    ["Additional Interest", "North Park Residential LLC (Landlord) — certificate holder"],
  ]);
  b.section("Coverages");
  b.table(
    ["Coverage", "Limit", "Deductible"],
    [
      ["Coverage C — Personal Property (Replacement Cost)", "$15,000", "$500"],
      ["Coverage D — Loss of Use", "$4,500", "—"],
      ["Coverage E — Personal Liability", "$100,000", "—"],
      ["Coverage F — Medical Payments to Others", "$1,000", "—"],
      ["Scheduled Personal Property — Electronics Floater", "$4,000 (laptop, monitor, camera)", "$0"],
    ],
    { colWidths: [0.5, 0.32, 0.18], align: ["left", "right", "right"] },
  );
  b.section("Premium");
  b.table(
    ["Item", "Annual Premium"],
    [
      ["Base HO-4 Premium", usd(180)],
      ["Scheduled Electronics Floater", usd(60)],
      ["Total Annual Premium", usd(240)],
    ],
    { colWidths: [0.75, 0.25], align: ["left", "right"], boldLastRow: true },
  );
  b.totalBox("Total Annual Premium", usd(240), "Paid in full");
  b.section("Special Limits of Liability (Coverage C)");
  b.bullets([
    "Jewelry, watches, furs: $1,500 theft limit",
    "Money, bank notes, gift cards: $200",
    "Portable electronic equipment in a motor vehicle: $1,500",
    "Business property on premises: $2,500 (home office equipment used for employment)",
    "Earthquake and flood are excluded. California earthquake coverage for renters is available through the California Earthquake Authority.",
  ]);
  b.paragraph("Personal liability coverage protects you if you are legally responsible for injury to others or damage to their property, including damage to your landlord's building caused by fire or water you are responsible for. Umbrella policies generally require underlying liability of at least $300,000 on renters policies.", { size: 7.5 });
  b.signature("L. Moreno", "Underwriting Manager, Harbor Mutual Renters Insurance");
  return b.finish();
}

async function riveraHealth() {
  const b = await DecPageBuilder.create(GOLDEN_COAST, "Enrollment & Summary of Benefits", "Plan Year 2026 — Employer Group Coverage");
  b.section("Member & Plan");
  b.keyValues([
    ["Subscriber", "Alex J. Rivera"],
    ["Employer", "Northwind Cloud Systems, Inc. — Group #GCH-41207"],
    ["Member ID", "GCX7720458812"],
    ["Coverage Tier", "Employee Only"],
    ["Plan Elected", "Golden Coast Platinum PPO 0"],
    ["Coverage Period", "01/01/2026 – 12/31/2026"],
  ]);
  b.section("Plan Options Offered & Your Cost");
  b.table(
    ["Plan", "Your Monthly Cost", "Deductible", "OOP Max", "Employer HSA $"],
    [
      ["Platinum PPO 0 (ELECTED)", "$100.00", "$0", "$2,500", "—"],
      ["Gold HMO 250", "$35.00", "$250", "$3,500", "—"],
      ["Bronze HSA 3300", "$0.00", "$3,300", "$6,500", "$750 / yr"],
    ],
    { colWidths: [0.3, 0.18, 0.16, 0.16, 0.2], align: ["left", "right", "right", "right", "right"] },
  );
  b.totalBox("Your Annual Cost (pre-tax payroll)", usd(1200), "$100.00 / month x 12");
  b.section("Platinum PPO 0 — Cost Sharing (In-Network)");
  b.table(
    ["Service", "You Pay"],
    [
      ["Preventive care", "$0"],
      ["Primary care / Specialist", "$15 / $30 copay"],
      ["Urgent care", "$30 copay"],
      ["Emergency room", "$150 copay"],
      ["Inpatient stay", "10% coinsurance"],
      ["Generic / Brand Rx", "$5 / $25"],
    ],
    { colWidths: [0.6, 0.4] },
  );
  b.section("Gold HMO 250 & Bronze HSA 3300 — Key Differences");
  b.bullets([
    "Gold HMO 250: requires PCP referral for specialists; Golden Coast HMO network (all major San Diego systems). ER $250 copay; inpatient 20% after deductible.",
    "Bronze HSA 3300: all services except preventive subject to deductible, then 20% coinsurance. Eligible for Health Savings Account; employer contributes $750/yr. 2026 individual HSA limit $4,400.",
  ]);
  b.section("Your Prior-Year Utilization (2025)");
  b.table(
    ["Service", "Count", "Allowed Amount", "You Paid"],
    [
      ["Preventive visit", "1", "$285.00", "$0.00"],
      ["Other visits / Rx", "0", "$0.00", "$0.00"],
    ],
    { colWidths: [0.4, 0.15, 0.25, 0.2], align: ["left", "center", "right", "right"] },
  );
  b.paragraph("Golden Coast Health does not provide plan recommendations. This SBC is a summary only; the Evidence of Coverage governs. Premiums are deducted pre-tax under Section 125.", { size: 7, italic: true, muted: true });
  return b.finish();
}

const GENERATORS: Record<SampleId, () => Promise<Uint8Array>> = {
  "miller-auto": millerAuto,
  "miller-health": millerHealth,
  "miller-home": millerHome,
  "rivera-auto": riveraAuto,
  "rivera-renters": riveraRenters,
  "rivera-health": riveraHealth,
};

const cache = new Map<SampleId, Uint8Array>();

/** Generate (and memoize per server instance) a sample policy PDF. */
export async function generateSamplePdf(id: SampleId): Promise<Uint8Array> {
  const hit = cache.get(id);
  if (hit) return hit;
  const bytes = await GENERATORS[id]();
  cache.set(id, bytes);
  return bytes;
}

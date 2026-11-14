/**
 * Future value of investing `annualContribution` at the end of each year for
 * `years` years at `rate` (ordinary annuity). Used for the "5-Year Wealth
 * Impact" KPI: what redirected premium savings grow into at a 7% long-run
 * index-fund assumption.
 */
export function futureValueOfAnnualSavings(annualContribution: number, years = 5, rate = 0.07): number {
  if (annualContribution <= 0) return 0;
  return annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
}

/** Year-by-year balances for a sparkline. */
export function growthSeries(annualContribution: number, years = 5, rate = 0.07) {
  return Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    contributed: Math.max(0, annualContribution) * y,
    balance: futureValueOfAnnualSavings(annualContribution, y, rate),
  }));
}

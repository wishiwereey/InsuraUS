/**
 * Turns Vitest's JSON output + coverage summary into test-results/TEST_RESULTS.md.
 * Run via `npm run test:report`.
 */
import { readFile, writeFile } from "node:fs/promises";

const results = JSON.parse(await readFile("test-results/results.json", "utf8"));
const coverage = JSON.parse(await readFile("test-results/coverage/coverage-summary.json", "utf8"));

const rel = (p) => p.replace(`${process.cwd()}/`, "");
const pct = (m) => `${m.pct.toFixed(1)}%`;
const icon = (s) => (s === "passed" ? "✅" : s === "failed" ? "❌" : "⏭️");

const files = results.testResults.map((f) => ({
  file: rel(f.name),
  tests: f.assertionResults,
  passed: f.assertionResults.filter((t) => t.status === "passed").length,
  ms: Math.round((f.endTime ?? 0) - (f.startTime ?? 0)),
}));

const lines = [];
lines.push("# Test results");
lines.push("");
lines.push(`Generated ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC with \`npm run test:report\` (Vitest, Node ${process.version}).`);
lines.push("");
lines.push(
  `**${results.numPassedTests} / ${results.numTotalTests} tests passed** across ${results.numTotalTestSuites} suites` +
    (results.numFailedTests ? ` — **${results.numFailedTests} failed**` : "") +
    ".",
);
lines.push("");
lines.push("No Gemini API key is needed: the SDK is replaced by a fake client in `tests/gemini.test.ts`, and the other route tests stop at the billing/validation gate before any AI call.");
lines.push("");
lines.push("## Coverage (`src/lib`, `src/app/api`)");
lines.push("");
lines.push("| | Statements | Branches | Functions | Lines |");
lines.push("|---|---|---|---|---|");
const t = coverage.total;
lines.push(`| **Total** | ${pct(t.statements)} | ${pct(t.branches)} | ${pct(t.functions)} | ${pct(t.lines)} |`);
for (const [path, m] of Object.entries(coverage)) {
  if (path === "total") continue;
  lines.push(`| \`${rel(path).replace(/^src\//, "")}\` | ${pct(m.statements)} | ${pct(m.branches)} | ${pct(m.functions)} | ${pct(m.lines)} |`);
}
lines.push("");
lines.push("## What is tested");
lines.push("");
for (const f of files) {
  lines.push(`### \`${f.file}\` — ${f.passed}/${f.tests.length} passed`);
  lines.push("");
  for (const test of f.tests) {
    const group = test.ancestorTitles.join(" › ");
    lines.push(`- ${icon(test.status)} ${group ? `${group} › ` : ""}${test.title}`);
  }
  lines.push("");
}
lines.push("## Reproduce");
lines.push("");
lines.push("```bash\nnpm test              # run once\nnpm run test:report   # tests + coverage + this file + JUnit XML\n```");
lines.push("");

await writeFile("test-results/TEST_RESULTS.md", lines.join("\n"));
console.log(`Wrote test-results/TEST_RESULTS.md (${results.numPassedTests}/${results.numTotalTests} passed)`);
if (results.numFailedTests) process.exitCode = 1;

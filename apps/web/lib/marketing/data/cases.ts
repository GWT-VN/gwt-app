import { CASES_ELATION } from "./cases-elation";
import { CASES_REFS } from "./cases-refs";
import type { CaseStudy, Verdict } from "./cases-types";
import { CASES_VCB } from "./cases-vcb";
import { CASES_VCB_FAIL } from "./cases-vcb-fail";

export * from "./cases-types";

/** Toàn bộ ca đã chấm qua các buổi SECI. */
export const ALL_CASES: CaseStudy[] = [...CASES_VCB, ...CASES_VCB_FAIL, ...CASES_ELATION, ...CASES_REFS];

export function getCase(slug: string): CaseStudy | undefined {
  return ALL_CASES.find((c) => c.slug === slug);
}

export function countByVerdict(): Record<Verdict, number> {
  const out = { win: 0, fail: 0, fix: 0, drop: 0, ref: 0 };
  for (const c of ALL_CASES) out[c.verdict] += 1;
  return out;
}

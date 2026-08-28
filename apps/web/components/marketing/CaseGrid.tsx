"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VERDICT_LABEL, type CaseStudy, type Verdict } from "@/lib/marketing/data/cases-types";

const VERDICT_CLASS: Record<Verdict, string> = {
  win: "badge-win",
  fail: "badge-fail",
  fix: "pill-status",
  drop: "badge-fail",
  ref: "tag",
};

const BRANDS = ["Tất cả", "VCB", "Elation", "Tham khảo"] as const;

export default function CaseGrid({ cases }: { cases: CaseStudy[] }) {
  const [brand, setBrand] = useState<(typeof BRANDS)[number]>("Tất cả");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");

  const shown = useMemo(
    () =>
      cases.filter(
        (c) => (brand === "Tất cả" || c.brand === brand) && (verdict === "all" || c.verdict === verdict),
      ),
    [cases, brand, verdict],
  );

  const verdicts: (Verdict | "all")[] = ["all", "win", "fix", "fail", "drop", "ref"];

  return (
    <>
      <div className="toolbar">
        {BRANDS.map((b) => (
          <button key={b} className={`filter-chip${brand === b ? " on" : ""}`} onClick={() => setBrand(b)}>
            {b} <span style={{ opacity: 0.65 }}>{b === "Tất cả" ? cases.length : cases.filter((c) => c.brand === b).length}</span>
          </button>
        ))}
      </div>
      <div className="toolbar">
        {verdicts.map((v) => (
          <button key={v} className={`filter-chip${verdict === v ? " on" : ""}`} onClick={() => setVerdict(v)}>
            {v === "all" ? "Mọi kết quả" : VERDICT_LABEL[v]}{" "}
            <span style={{ opacity: 0.65 }}>
              {v === "all" ? cases.length : cases.filter((c) => c.verdict === v).length}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">Không có ca nào khớp bộ lọc này.</div>
      ) : (
        <div className="case-grid">
          {shown.map((c) => (
            <Link className="case" href={`/marketing/kho-case/${c.slug}`} key={c.slug} style={{ textDecoration: "none", display: "block" }}>
              <div className="ch">
                <span className={VERDICT_CLASS[c.verdict]}>{VERDICT_LABEL[c.verdict]}</span>
                <h3 style={{ color: "var(--ink)" }}>{c.title}</h3>
              </div>
              <div className="cv">
                <span className="chip mono" style={{ fontSize: ".64rem", marginRight: 6 }}>{c.code}</span>
                {c.brand} · {c.buoi}
                {c.paastScore ? ` · ${c.paastScore}` : ""}
              </div>
              <div className="cv" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>{c.verdictNote}</div>
              <p>{c.summary}</p>
              <div className="go" style={{ marginTop: 10 }}>Xem chi tiết →</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

import { costPerSdt } from "@/lib/marketing/ads-analysis";
import type { Judged } from "./DecisionPanel";
import { campLabel, CprPill, DecisionBadge, dec1, Delta, money, pct } from "./shared";

/** Camp đang chạy, xếp theo CPR so với chuẩn nhóm của nó — để WH và CTS/CTD so được với nhau. */
export default function RankingTable({
  judged,
  periodLabel,
  onOpen,
}: {
  judged: Judged[];
  periodLabel: string;
  onOpen: (key: string) => void;
}) {
  const rows = judged
    .filter((j) => j.verdict.decision !== "stale")
    .sort((a, b) => a.verdict.ratio! - b.verdict.ratio!);

  return (
    <>
      <p className="ads-muted ads-caption">
        Camp đang chạy kỳ {periodLabel}, xếp theo cost/result so với chuẩn nhóm (rẻ nhất lên đầu). Bấm một dòng để
        xem từng kỳ.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Camp</th>
              <th>Cost/result</th>
              <th>So chuẩn</th>
              <th>Kỳ trước</th>
              <th>Result/ngày</th>
              <th>SĐT</th>
              <th>Cost/SĐT</th>
              <th>Đề xuất</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ camp, verdict: v }, i) => {
              const diff = v.ratio! - 1;
              const perSdt = costPerSdt(v.latest);
              return (
                <tr key={camp.key} className="ads-row" onClick={() => onOpen(camp.key)}>
                  <td className="num-cell">{i + 1}</td>
                  <td className="td-title ad-name-col">
                    {campLabel(camp)}
                    {v.flags.length > 0 && <small className="ads-flag">{v.flags.join(" · ")}</small>}
                  </td>
                  <td className="num-cell"><CprPill cpr={v.cpr!} benchmark={v.benchmark} /></td>
                  <td className={`num-cell ${diff <= 0 ? "ads-delta-good" : "ads-delta-bad"}`}>
                    {diff <= 0 ? "−" : "+"}
                    {pct(Math.abs(diff))}
                  </td>
                  <td className="num-cell">
                    {v.prevCpr != null ? (
                      <>
                        {money(v.prevCpr)}
                        <Delta cur={v.cpr!} prev={v.prevCpr} goodWhenUp={false} />
                      </>
                    ) : (
                      <span className="ads-muted">mới</span>
                    )}
                  </td>
                  <td className="num-cell">{dec1(v.latest!.results / v.days!)}</td>
                  <td className="num-cell">{v.latest!.sdt ?? <span className="ads-muted">—</span>}</td>
                  <td className="num-cell">{perSdt != null ? money(perSdt) : <span className="ads-muted">—</span>}</td>
                  <td><DecisionBadge decision={v.decision} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

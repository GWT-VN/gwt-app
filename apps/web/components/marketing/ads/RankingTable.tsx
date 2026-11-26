import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";
import { costPerNewMessage, costPerOrder, costPerSdt } from "@/lib/marketing/ads-analysis";
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
      <TableWrap vien tabIndex={0} aria-label="Bảng xếp hạng quảng cáo">
        <Table variant="thuong" className="min-w-[640px]" aria-label="Bảng xếp hạng quảng cáo">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Camp</TableHead>
              <TableHead>Cost/result</TableHead>
              <TableHead>So chuẩn</TableHead>
              <TableHead>Kỳ trước</TableHead>
              <TableHead>Result/ngày</TableHead>
              <TableHead>New mess</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Cost/SĐT</TableHead>
              <TableHead>Khách mua</TableHead>
              <TableHead>Đề xuất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ camp, verdict: v }, i) => {
              const diff = v.ratio! - 1;
              const perSdt = costPerSdt(v.latest);
              return (
                <TableRow key={camp.key} className="ads-row" onClick={() => onOpen(camp.key)}>
                  <TableCell className="num-cell">{i + 1}</TableCell>
                  <TableCell className="td-title ad-name-col">
                    {campLabel(camp)}
                    {v.flags.length > 0 && <small className="ads-flag">{v.flags.join(" · ")}</small>}
                  </TableCell>
                  <TableCell className="num-cell"><CprPill cpr={v.cpr!} benchmark={v.benchmark} /></TableCell>
                  <TableCell className={`num-cell ${diff <= 0 ? "ads-delta-good" : "ads-delta-bad"}`}>
                    {diff <= 0 ? "−" : "+"}
                    {pct(Math.abs(diff))}
                  </TableCell>
                  <TableCell className="num-cell">
                    {v.prevCpr != null ? (
                      <>
                        {money(v.prevCpr)}
                        <Delta cur={v.cpr!} prev={v.prevCpr} goodWhenUp={false} />
                      </>
                    ) : (
                      <span className="ads-muted">mới</span>
                    )}
                  </TableCell>
                  <TableCell className="num-cell">{dec1(v.latest!.results / v.days!)}</TableCell>
                  <TableCell className="num-cell">
                    {v.latest!.newMessages ? (
                      <>
                        {v.latest!.newMessages}
                        <small className="ads-sub-num">{money(costPerNewMessage(v.latest)!)}/mess</small>
                      </>
                    ) : (
                      <span className="ads-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="num-cell">{v.latest!.sdt ?? <span className="ads-muted">—</span>}</TableCell>
                  <TableCell className="num-cell">{perSdt != null ? money(perSdt) : <span className="ads-muted">—</span>}</TableCell>
                  <TableCell className="num-cell">
                    {v.latest!.orders ? (
                      <>
                        <span className="sdt-val">{v.latest!.orders}</span>
                        <small className="ads-sub-num">{money(costPerOrder(v.latest)!)}/khách</small>
                      </>
                    ) : (
                      <span className="ads-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell><DecisionBadge decision={v.decision} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableWrap>
    </>
  );
}

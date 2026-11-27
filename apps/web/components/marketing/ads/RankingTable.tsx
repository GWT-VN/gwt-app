import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";
import { costPerNewMessage, costPerOrder, costPerSdt } from "@/lib/marketing/ads-analysis";
import type { Judged } from "./DecisionPanel";
import { NameButton, campLabel, CprPill, DecisionBadge, dec1, Delta, money, pct } from "./shared";

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
      <TableWrap vien role="region" tabIndex={0} aria-label="Bảng xếp hạng quảng cáo">
        <Table aria-label="Bảng xếp hạng quảng cáo">
          <TableHeader>
            <TableRow>
              <TableHead phai>#</TableHead>
              <TableHead>Camp</TableHead>
              <TableHead phai>Cost/result</TableHead>
              <TableHead phai>So chuẩn</TableHead>
              <TableHead phai>Kỳ trước</TableHead>
              <TableHead phai>Result/ngày</TableHead>
              <TableHead phai>New mess</TableHead>
              <TableHead phai>SĐT</TableHead>
              <TableHead phai>Cost/SĐT</TableHead>
              <TableHead phai>Khách mua</TableHead>
              <TableHead>Đề xuất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ camp, verdict: v }, i) => {
              const diff = v.ratio! - 1;
              const perSdt = costPerSdt(v.latest);
              return (
                <TableRow key={camp.key} className="cursor-pointer" onClick={() => onOpen(camp.key)}>
                  <TableCell phai>{i + 1}</TableCell>
                  <TableCell>
                    <NameButton onOpen={() => onOpen(camp.key)}>{campLabel(camp)}</NameButton>
                    {v.flags.length > 0 && <small className="ads-flag">{v.flags.join(" · ")}</small>}
                  </TableCell>
                  <TableCell phai><CprPill cpr={v.cpr!} benchmark={v.benchmark} /></TableCell>
                  <TableCell phai className={diff <= 0 ? "ads-delta-good" : "ads-delta-bad"}>
                    {diff <= 0 ? "−" : "+"}
                    {pct(Math.abs(diff))}
                  </TableCell>
                  <TableCell phai>
                    {v.prevCpr != null ? (
                      <>
                        {money(v.prevCpr)}
                        <Delta cur={v.cpr!} prev={v.prevCpr} goodWhenUp={false} />
                      </>
                    ) : (
                      <span className="ads-muted">mới</span>
                    )}
                  </TableCell>
                  <TableCell phai>{dec1(v.latest!.results / v.days!)}</TableCell>
                  <TableCell phai>
                    {v.latest!.newMessages ? (
                      <>
                        {v.latest!.newMessages}
                        <small className="ads-sub-num">{money(costPerNewMessage(v.latest)!)}/mess</small>
                      </>
                    ) : (
                      <span className="ads-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell phai>{v.latest!.sdt ?? <span className="ads-muted">—</span>}</TableCell>
                  <TableCell phai>{perSdt != null ? money(perSdt) : <span className="ads-muted">—</span>}</TableCell>
                  <TableCell phai>
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

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CONG_BO, HANG, type Fact } from "@/lib/wiki/kieu";

/** Bỏ dấu tiếng Việt để gõ không dấu vẫn tìm ra. */
function khongDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** Ô bảng có markdown (đậm, mã, link) — render inline, không bọc thẻ <p>. */
function O({ children }: { children: string }) {
  if (!children) return <span className="wiki-o-trong">—</span>;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ p: ({ children }) => <>{children}</> }}
      allowedElements={["p", "strong", "em", "code", "br", "del", "a"]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * Bảng tra dữ kiện `F-xxx`.
 *
 * Lọc chạy hoàn toàn ở client trên mảng đã nhúng sẵn — 184 dòng cho USH10, nhỏ hơn nhiều
 * so với chi phí một vòng gọi server cho mỗi lần gõ phím.
 */
export default function TraCuuFact({ facts, congBoBanDau }: { facts: Fact[]; congBoBanDau?: string }) {
  const [tim, setTim] = useState("");
  const [nhom, setNhom] = useState<string | null>(null);
  const [hang, setHang] = useState<string>("");
  const [congBo, setCongBo] = useState<string>(congBoBanDau ?? "");

  const nhomCo = useMemo(() => {
    const m = new Map<string, string>();
    facts.forEach((f) => m.set(f.nhom, f.tenNhom));
    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([gt, ten]) => ({ gt, nhan: `${gt}. ${ten}`, anMa: true }));
  }, [facts]);

  const hangCo = useMemo(
    () => [...new Set(facts.map((f) => f.hang).filter(Boolean))].sort(),
    [facts],
  );

  const ketQua = useMemo(() => {
    const q = khongDau(tim.trim());
    return facts.filter((f) => {
      if (nhom && f.nhom !== nhom) return false;
      if (hang && f.hang !== hang) return false;
      if (congBo && f.congBo !== congBo) return false;
      if (!q) return true;
      return khongDau(`${f.ma} ${f.duKien} ${f.giaTri} ${f.nguon}`).includes(q);
    });
  }, [facts, tim, nhom, hang, congBo]);

  const daLoc = Boolean(tim || nhom || hang || congBo);

  return (
    <>
      <div className="wiki-loc">
        <Input
          className="min-w-0 flex-[1_1_260px]"
          type="search"
          value={tim}
          onChange={(e) => setTim(e.target.value)}
          placeholder="Gõ mã (F-C17), tên dữ kiện, hoặc giá trị… — gõ không dấu vẫn ra"
          aria-label="Tìm dữ kiện"
        />

        <div className="w-full sm:w-44">
          <Combobox
            aria-label="Lọc theo nhóm dữ kiện"
            value={nhom}
            onValueChange={setNhom}
            options={nhomCo}
            placeholder={`Mọi nhóm (${facts.length})`}
            searchPlaceholder="Tìm nhóm dữ kiện…"
          />
        </div>

        <div className="w-full sm:w-44">
          <NativeSelect value={congBo} onChange={(e) => setCongBo(e.target.value)} aria-label="Lọc theo quyền công bố">
            <NativeSelectOption value="">Mọi quyền công bố</NativeSelectOption>
            {(["🟢", "🟡", "🔵", "🔴"] as const).map((n) => (
              <NativeSelectOption key={n} value={n}>
                {n} {CONG_BO[n].ten}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="w-full sm:w-44">
          <NativeSelect value={hang} onChange={(e) => setHang(e.target.value)} aria-label="Lọc theo hạng tin cậy">
            <NativeSelectOption value="">Mọi hạng</NativeSelectOption>
            {hangCo.map((h) => (
              <NativeSelectOption key={h} value={h}>
                Hạng {h}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {daLoc && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTim("");
              setNhom(null);
              setHang("");
              setCongBo("");
            }}
          >
            Bỏ lọc
          </Button>
        )}
      </div>

      <p className="wiki-dem" role="status">
        <b>{ketQua.length}</b> / {facts.length} dữ kiện
        {congBo && (
          <>
            {" "}· <span aria-hidden="true">{congBo}</span> {CONG_BO[congBo]?.giaiThich}
          </>
        )}
        {hang && HANG[hang] && <> · Hạng {hang}: {HANG[hang]}</>}
      </p>

      {ketQua.length === 0 ? (
        <Alert color="info">
          <AlertTitle>Không có dữ kiện nào khớp</AlertTitle>
          <AlertDescription>
            <b>Không có mã thì không được nói.</b> Có thể trả lời khách như sau.
            <i> “Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em kiểm tra rồi báo lại anh/chị.”</i>
          </AlertDescription>
        </Alert>
      ) : (
        <TableWrap vien role="region" tabIndex={0} aria-label="Bảng tra dữ kiện">
          <Table variant="thuong" className="wiki-bang min-w-[760px]" aria-label="Dữ kiện sản phẩm">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Mã</TableHead>
                <TableHead scope="col">Dữ kiện</TableHead>
                <TableHead scope="col">Giá trị</TableHead>
                <TableHead scope="col">Nguồn</TableHead>
                <TableHead scope="col">Hạng</TableHead>
                <TableHead scope="col">Công bố</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ketQua.map((f) => (
                <TableRow key={f.ma} id={f.ma} className={CONG_BO[f.congBo]?.lop}>
                  <th scope="row" className="mono">{f.ma}</th>
                  <TableCell className="whitespace-normal align-top"><O>{f.duKien}</O></TableCell>
                  <TableCell className="whitespace-normal align-top"><O>{f.giaTri}</O></TableCell>
                  <TableCell className="whitespace-normal align-top"><O>{f.nguon}</O></TableCell>
                  <TableCell title={HANG[f.hang] ?? ""}>{f.hang || <span className="wiki-o-trong">{f.hangGoc || "—"}</span>}</TableCell>
                  <TableCell title={CONG_BO[f.congBo]?.giaiThich ?? ""}>
                    <span aria-hidden="true">{f.congBo}</span>{" "}
                    <span className="wiki-cb-ten">{CONG_BO[f.congBo]?.ten ?? ""}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      )}
    </>
  );
}

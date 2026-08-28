"use client";

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
  const [nhom, setNhom] = useState<string>("");
  const [hang, setHang] = useState<string>("");
  const [congBo, setCongBo] = useState<string>(congBoBanDau ?? "");

  const nhomCo = useMemo(() => {
    const m = new Map<string, string>();
    facts.forEach((f) => m.set(f.nhom, f.tenNhom));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
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
        <input
          className="wiki-loc-tim"
          type="search"
          value={tim}
          onChange={(e) => setTim(e.target.value)}
          placeholder="Gõ mã (F-C17), tên dữ kiện, hoặc giá trị… — gõ không dấu vẫn ra"
          aria-label="Tìm dữ kiện"
        />

        <select value={nhom} onChange={(e) => setNhom(e.target.value)} aria-label="Lọc theo nhóm dữ kiện">
          <option value="">Mọi nhóm ({facts.length})</option>
          {nhomCo.map(([chu, ten]) => (
            <option key={chu} value={chu}>
              {chu}. {ten}
            </option>
          ))}
        </select>

        <select value={congBo} onChange={(e) => setCongBo(e.target.value)} aria-label="Lọc theo quyền công bố">
          <option value="">Mọi quyền công bố</option>
          {(["🟢", "🟡", "🔵", "🔴"] as const).map((n) => (
            <option key={n} value={n}>
              {n} {CONG_BO[n].ten}
            </option>
          ))}
        </select>

        <select value={hang} onChange={(e) => setHang(e.target.value)} aria-label="Lọc theo hạng tin cậy">
          <option value="">Mọi hạng</option>
          {hangCo.map((h) => (
            <option key={h} value={h}>
              Hạng {h}
            </option>
          ))}
        </select>

        {daLoc && (
          <button
            type="button"
            className="wiki-loc-xoa"
            onClick={() => {
              setTim("");
              setNhom("");
              setHang("");
              setCongBo("");
            }}
          >
            Bỏ lọc
          </button>
        )}
      </div>

      <p className="wiki-dem">
        <b>{ketQua.length}</b> / {facts.length} dữ kiện
        {congBo && (
          <>
            {" "}· <span aria-hidden="true">{congBo}</span> {CONG_BO[congBo]?.giaiThich}
          </>
        )}
        {hang && HANG[hang] && <> · Hạng {hang}: {HANG[hang]}</>}
      </p>

      {ketQua.length === 0 ? (
        <div className="notice">
          <span aria-hidden="true">🔍</span>
          <div>
            Không có dữ kiện nào khớp. <b>Không có mã thì không được nói</b> — dùng câu thoát:{" "}
            <i>“Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em
            kiểm tra rồi báo lại anh/chị.”</i>
          </div>
        </div>
      ) : (
        <div className="wiki-bang-bo">
          <table className="wiki-bang">
            <thead>
              <tr>
                <th scope="col">Mã</th>
                <th scope="col">Dữ kiện</th>
                <th scope="col">Giá trị</th>
                <th scope="col">Nguồn</th>
                <th scope="col">Hạng</th>
                <th scope="col">Công bố</th>
              </tr>
            </thead>
            <tbody>
              {ketQua.map((f) => (
                <tr key={f.ma} id={f.ma} className={CONG_BO[f.congBo]?.lop}>
                  <th scope="row" className="mono">{f.ma}</th>
                  <td><O>{f.duKien}</O></td>
                  <td><O>{f.giaTri}</O></td>
                  <td><O>{f.nguon}</O></td>
                  <td title={HANG[f.hang] ?? ""}>{f.hang || <span className="wiki-o-trong">{f.hangGoc || "—"}</span>}</td>
                  <td title={CONG_BO[f.congBo]?.giaiThich ?? ""}>
                    <span aria-hidden="true">{f.congBo}</span>{" "}
                    <span className="wiki-cb-ten">{CONG_BO[f.congBo]?.ten ?? ""}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

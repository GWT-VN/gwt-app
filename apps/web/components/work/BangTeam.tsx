'use client'

/**
 * Bảng team — mọi việc mình được xem, lọc theo team / người / trạng thái / từ khoá,
 * xem ở hai chế độ: Danh sách và Bảng (kanban theo trạng thái). Bám mockup GWT Work.
 *
 * Lọc chạy trên SERVER (RPC work_bang_team) chứ không lọc trong trình duyệt: quyền xem
 * do work.visible_task_ids() quyết định, client không được cầm việc mình không có quyền.
 */
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { bangTeam, doiTrangThai, keoTha, type ViecTeamRow, type NenTang } from '@/app/work/actions'
import { TRANG_THAI, NHAN_TRANG_THAI, nhanHan, thuTuMoi } from '@/lib/work'
import { DongViec } from './DongViec'
import { ChiTietViec } from './ChiTietViec'
import { FormTaoViec } from './FormTaoViec'
import { ThanhHangLoat } from './ThanhHangLoat'
import { Chip, ChongAvatar, Nut, oNhap, MAU_UT_VAR, MAU_TRANG_THAI } from './ui'

type Che = 'list' | 'board'

export function BangTeam({ rowsBanDau, nenTang }: { rowsBanDau: ViecTeamRow[]; nenTang: NenTang }) {
  const router = useRouter()
  const [rows, setRows] = useState(rowsBanDau)
  const [che, setChe] = useState<Che>('list')
  const [teamId, setTeamId] = useState<string>('')
  const [assignee, setAssignee] = useState<string>('')
  const [q, setQ] = useState('')
  const [mo, setMo] = useState<number | null>(null)
  const [loi, setLoi] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [chon, setChon] = useState<Set<number>>(new Set())
  const [thongBao, setThongBao] = useState<string | null>(null)
  /** Thẻ đang được nhấc lên, và chỗ nó sẽ rơi xuống. */
  const [dangKeo, setDangKeo] = useState<number | null>(null)
  const [choTha, setChoTha] = useState<{ cot: string; viTri: number } | null>(null)
  /*
    Bản ref của `dangKeo`, đặt NGAY trong onDragStart.
    `setDangKeo` là state nên chỉ thấy được ở lần dựng lại sau; mà `dragover`
    có thể nổ trước lần dựng đó. Handler nào đọc state sẽ thấy `null` và bỏ qua
    `preventDefault()` — mà thiếu preventDefault thì trình duyệt TỪ CHỐI thả,
    im lặng. Ref đọc/ghi đồng bộ nên không có khe hở đó.
    State vẫn giữ, vì phần vẽ (tô cột đích, làm mờ thẻ) cần dựng lại mới thấy.
  */
  const dangKeoRef = useRef<number | null>(null)
  const oLoi = useRef<HTMLParagraphElement>(null)

  /** Việc của một cột, đã xếp theo thứ tự người dùng tự kéo. */
  function cotCua(status: string) {
    return rows
      .filter((v) => v.status === status)
      .sort((a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.priority - b.priority || a.id - b.id)
  }

  /**
   * @param idTuData id đọc từ dataTransfer. React state `dangKeo` là đường
   *   chính, cái này là lưới đỡ: state có thể đã bị dọn (dragend chạy trước
   *   drop ở vài trình duyệt), còn dataTransfer thì đi kèm chính lượt kéo đó.
   */
  function thaXuong(cot: string, viTri: number, idTuData?: number | null) {
    const id = dangKeoRef.current ?? dangKeo ?? idTuData ?? null
    dangKeoRef.current = null
    setDangKeo(null); setChoTha(null)
    if (id == null) return
    // Bỏ chính thẻ đang kéo ra khỏi danh sách trước khi tính hàng xóm, nếu không
    // kéo trong cùng một cột sẽ tính vị trí so với chính nó.
    const ds = cotCua(cot).filter((v) => v.id !== id)
    const cu = rows.find((v) => v.id === id)
    const truoc = viTri > 0 ? ds[viTri - 1]?.sort_order : undefined
    const sau = ds[viTri]?.sort_order
    const moi = thuTuMoi(truoc ?? undefined, sau ?? undefined)
    if (cu && cu.status === cot && (cu.sort_order ?? 0) === moi) return  // không đổi gì

    // Cập nhật ngay trên màn hình rồi mới gọi server: kéo xong mà thẻ nhảy về chỗ
    // cũ chờ mạng thì cảm giác như thao tác trượt.
    setRows((r) => r.map((v) => (v.id === id ? { ...v, status: cot, sort_order: moi } : v)))
    start(async () => {
      const kq = await keoTha(id, cot, moi)
      if (!kq.ok) {
        // Server từ chối: thẻ bị kéo về chỗ cũ. Nếu KHÔNG lôi lời báo lỗi vào
        // tầm mắt thì cú kéo trông hệt như "không có gì xảy ra" — đúng cái bẫy
        // CEO dính 24/08, khi bảng dài và ô báo lỗi nằm tít trên đầu trang.
        setLoi(kq.loi); nap()
        requestAnimationFrame(() =>
          oLoi.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
        return
      }
      setLoi(null)
      nap()
    })
  }

  function doiChon(id: number, c: boolean) {
    setChon((cu) => {
      const moi = new Set(cu)
      if (c) moi.add(id); else moi.delete(id)
      return moi
    })
  }

  /** Nạp lại theo bộ lọc hiện tại — gọi sau mỗi lần lọc hoặc ghi. */
  function nap(moi?: { team?: string; ai?: string; tu?: string }) {
    const t = moi?.team ?? teamId
    const a = moi?.ai ?? assignee
    const k = moi?.tu ?? q
    start(async () => {
      try {
        setRows(await bangTeam({
          team_id: t ? Number(t) : null,
          assignee: a || null,
          q: k.trim() || null,
        }))
        setLoi(null)
      } catch (e) {
        setLoi(e instanceof Error ? e.message : 'Không tải được danh sách')
      }
    })
  }

  function doi(id: number, status: string) {
    start(async () => {
      try {
        await doiTrangThai(id, status)
        setRows(await bangTeam({
          team_id: teamId ? Number(teamId) : null,
          assignee: assignee || null,
          q: q.trim() || null,
        }))
        setLoi(null)
      } catch (e) {
        setLoi(e instanceof Error ? e.message : 'Không đổi được trạng thái')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={teamId}
          onChange={(e) => { setTeamId(e.target.value); nap({ team: e.target.value }) }}
          style={{ ...oNhap, fontWeight: 600, color: 'var(--ink-2)' }}
          aria-label="Lọc theo team"
        >
          <option value="">Mọi team</option>
          {nenTang.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <select
          value={assignee}
          onChange={(e) => { setAssignee(e.target.value); nap({ ai: e.target.value }) }}
          style={{ ...oNhap, fontWeight: 600, color: 'var(--ink-2)' }}
          aria-label="Lọc theo người"
        >
          <option value="">Mọi người</option>
          {nenTang.nhan_su.map((s) => <option key={s.id} value={s.id}>{s.ten}</option>)}
        </select>

        <form onSubmit={(e) => { e.preventDefault(); nap() }} className="flex gap-1.5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tiêu đề, mã việc…"
            style={{ ...oNhap, minWidth: 200 }}
            aria-label="Tìm việc"
          />
          <Nut type="submit">Tìm</Nut>
        </form>

        <span className="flex-1" />

        <div
          className="flex overflow-hidden"
          style={{ border: '1px solid var(--border-strong)', borderRadius: 9 }}
          role="group"
          aria-label="Chế độ xem"
        >
          {(['list', 'board'] as Che[]).map((c) => (
            <button
              key={c}
              onClick={() => setChe(c)}
              aria-pressed={che === c}
              style={{
                padding: '7px 13px', fontSize: 13, fontWeight: 600,
                background: che === c ? 'var(--accent)' : 'var(--surface)',
                color: che === c ? '#fff' : 'var(--ink-2)',
              }}
            >{c === 'list' ? 'Danh sách' : 'Bảng'}</button>
          ))}
        </div>
      </div>

      <FormTaoViec
        nenTang={nenTang}
        teamMacDinh={teamId ? Number(teamId) : null}
        onXong={() => { nap(); router.refresh() }}
      />

      {loi && (
        <p
          ref={oLoi}
          className="px-3 py-2 rounded-lg"
          style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-wash)', border: '1px solid var(--red)' }}
        >{loi}</p>
      )}
      {thongBao && (
        <p
          className="px-3 py-2 rounded-lg"
          style={{ fontSize: 13, color: 'var(--green)', background: 'var(--green-wash)', border: '1px solid var(--green)' }}
        >{thongBao}</p>
      )}

      {rows.length === 0 ? (
        <div
          className="p-8 text-center"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 11, boxShadow: 'var(--shadow)', color: 'var(--muted)', fontSize: 13.5,
          }}
        >
          Không có việc nào khớp bộ lọc.
        </div>
      ) : che === 'list' ? (
        <>
        <label className="flex items-center gap-2 px-1" style={{ fontSize: 12, color: 'var(--muted)' }}>
          <input
            type="checkbox"
            checked={rows.length > 0 && rows.every((v) => chon.has(v.id))}
            onChange={(e) => setChon(e.target.checked ? new Set(rows.map((v) => v.id)) : new Set())}
            style={{ width: 14, height: 14, accentColor: 'var(--accent)' }}
          />
          Chọn tất cả {rows.length} việc đang hiện
        </label>
        <ul
          className="overflow-hidden list-none p-0 m-0"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 11, boxShadow: 'var(--shadow)',
          }}
        >
          {rows.map((v, i) => (
            <DongViec
              key={v.id} v={v} pending={pending}
              onDoiTrangThai={doi} onMo={setMo} cuoi={i === rows.length - 1}
              dangChon={chon.has(v.id)} onChon={doiChon}
            />
          ))}
        </ul>
        </>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-start">
          {TRANG_THAI.map((cot) => {
            const cua = cotCua(cot.v)
            const laDich = choTha?.cot === cot.v
            return (
              <section
                key={cot.v}
                className="flex flex-col gap-2.5 p-2.5"
                onDragOver={(e) => {
                  // Đọc REF, không đọc state: state có thể chưa kịp cập nhật ở
                  // lần dragover đầu, và bỏ lỡ preventDefault là mất luôn lượt thả.
                  if (dangKeoRef.current == null) return
                  e.preventDefault()                       // không chặn thì trình duyệt từ chối thả
                  e.dataTransfer.dropEffect = 'move'
                  if (!laDich) setChoTha({ cot: cot.v, viTri: cua.filter((v) => v.id !== dangKeoRef.current).length })
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const t = Number(e.dataTransfer.getData('text/plain'))
                  thaXuong(cot.v, choTha?.viTri ?? 0, Number.isFinite(t) && t > 0 ? t : null)
                }}
                style={{
                  background: laDich ? 'var(--surface-3)' : 'var(--surface-2)',
                  border: `1px solid ${laDich ? 'var(--accent-ink)' : 'var(--border)'}`,
                  borderRadius: 11,
                  /*
                    Cột RỖNG phải vẫn là đích thả cho ra hồn. Trước đây grid để
                    `items-start` và cột không có chiều cao tối thiểu, nên cột rỗng
                    co lại chỉ còn cái tiêu đề — cao chừng 38px, trong khi thẻ đang
                    kéo cao gấp đôi. Người dùng nhắm THẺ vào cột, nhưng thứ trình
                    duyệt xét là CON TRỎ, mà con trỏ thì rơi ra ngoài cái hộp tí
                    xíu đó. Không trúng đích thì `drop` không nổ, và vì không nổ nên
                    cũng chẳng có lỗi nào để báo — y hệt "không có gì xảy ra".
                  */
                  minHeight: 132,
                }}
              >
                <h3 className="flex items-center gap-2 m-0.5" style={{ fontSize: 12.5, fontWeight: 650 }}>
                  <span
                    className="flex-none"
                    style={{ width: 8, height: 8, borderRadius: 3, background: MAU_TRANG_THAI[cot.v] }}
                  />
                  {cot.nhan}
                  <span className="mono ml-auto" style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>
                    {cua.length}
                  </span>
                </h3>

                {cua.map((v) => {
                  const han = nhanHan(v.due_at)
                  const conLai = cua.filter((x) => x.id !== dangKeo)
                  const viTriTrong = conLai.findIndex((x) => x.id === v.id)
                  const vachTren = laDich && choTha?.viTri === viTriTrong && v.id !== dangKeo
                  return (
                    <div key={v.id} className="flex flex-col gap-2.5">
                    {vachTren && (
                      // Vạch chỉ chỗ thẻ sẽ rơi. Không có nó thì kéo là đoán mò.
                      <span style={{ height: 2, borderRadius: 2, background: 'var(--accent-ink)' }} />
                    )}
                    {/*
                      Thẻ là <div role="button">, KHÔNG phải <button>. Safari và
                      Firefox không cho `draggable` chạy tử tế trên form control —
                      thẻ không nhấc lên được, mà cũng chẳng báo gì. Đổi sang div
                      thì mất kích hoạt bằng bàn phím của <button>, nên trả lại
                      bằng tay ở onKeyDown bên dưới (Enter/Space mở việc).
                    */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${v.title} — cột ${cot.nhan}. Alt+mũi tên trái/phải để chuyển cột.`}
                      draggable
                      onDragStart={(e) => {
                        dangKeoRef.current = v.id       // đồng bộ, dragover đọc được ngay
                        setDangKeo(v.id)
                        e.dataTransfer.effectAllowed = 'move'
                        // Firefox KHÔNG khởi động lượt kéo nào nếu kho dữ liệu
                        // rỗng — không setData là kéo không nhúc nhích ở đó.
                        // Chrome/Safari dễ tính hơn, nên lỗi này ẩn rất lâu.
                        e.dataTransfer.setData('text/plain', String(v.id))
                      }}
                      onDragEnd={() => { dangKeoRef.current = null; setDangKeo(null); setChoTha(null) }}
                      onDragOver={(e) => {
                        const keo = dangKeoRef.current
                        if (keo == null || keo === v.id) return
                        e.preventDefault()
                        e.stopPropagation()
                        const o = e.currentTarget.getBoundingClientRect()
                        const nuaTren = e.clientY < o.top + o.height / 2
                        const j = cua.filter((x) => x.id !== keo).findIndex((x) => x.id === v.id)
                        if (j >= 0) setChoTha({ cot: cot.v, viTri: nuaTren ? j : j + 1 })
                      }}
                      onClick={() => setMo(v.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMo(v.id); return }
                        // Alt+←/→ chuyển cột — đường dùng bàn phím, trả nốt món nợ
                        // ghi từ 22/08. Alt để không giẫm lên phím cuộn trang.
                        if (!e.altKey) return
                        const iCot = TRANG_THAI.findIndex((c) => c.v === cot.v)
                        const iMoi = e.key === 'ArrowLeft' ? iCot - 1
                                   : e.key === 'ArrowRight' ? iCot + 1 : -1
                        if (iMoi < 0 || iMoi >= TRANG_THAI.length) return
                        e.preventDefault()
                        dangKeoRef.current = v.id
                        thaXuong(TRANG_THAI[iMoi].v, cotCua(TRANG_THAI[iMoi].v).length)
                      }}
                      className="w-full text-left flex flex-col gap-2.5"
                      style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderLeft: `3px solid ${MAU_UT_VAR[v.priority] ?? 'var(--border-strong)'}`,
                        borderRadius: 9, padding: '11px 12px', boxShadow: 'var(--shadow)',
                        opacity: dangKeo === v.id ? .4 : 1,
                        cursor: 'grab',
                      }}
                    >
                      <span style={{ fontWeight: 560, fontSize: 13.5, letterSpacing: '-.006em', lineHeight: 1.35 }}>
                        {v.title}
                      </span>
                      {(v.team_name || han) && (
                        <span className="flex items-center gap-2 flex-wrap">
                          {v.team_name && <Chip chamMau={v.team_color ?? 'var(--faint)'}>{v.team_name}</Chip>}
                          {han && (
                            <span
                              className="so"
                              style={{
                                fontSize: 11.5, fontWeight: 600,
                                color: han.startsWith('Quá hạn') ? 'var(--red)'
                                  : han === 'Hôm nay' ? 'var(--amber)' : 'var(--muted)',
                              }}
                            >{han}</span>
                          )}
                        </span>
                      )}
                      <span className="flex items-center justify-between gap-2">
                        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)' }}>
                          {v.ref} · P{v.priority}
                        </span>
                        <ChongAvatar nguoi={v.assignees.map((a) => ({ ten: a.ten, role: a.role }))} toiDa={2} co={22} />
                      </span>
                    </div>
                    </div>
                  )
                })}
                {/* Vạch cuối cột — thả xuống dưới cùng. */}
                {laDich && choTha?.viTri === cua.filter((x) => x.id !== dangKeo).length && (
                  <span style={{ height: 2, borderRadius: 2, background: 'var(--accent-ink)' }} />
                )}

                {cua.length === 0 && (
                  // Chiếm hết chỗ trống của cột: vừa là chữ giải thích, vừa là
                  // vùng thả nhìn thấy được. Đang kéo thì nó hiện viền đứt để nói
                  // "thả vào đây được" — trước đây cột rỗng không có tín hiệu nào.
                  <p
                    className="flex-1 flex items-center justify-center text-center px-1"
                    style={{
                      fontSize: 11.5, margin: 0, minHeight: 74, borderRadius: 9,
                      border: dangKeo != null ? '1.5px dashed var(--accent-ink)' : '1.5px dashed transparent',
                      color: dangKeo != null ? 'var(--accent-ink)' : 'var(--faint)',
                    }}
                  >
                    {dangKeo != null
                      ? 'Thả vào đây'
                      : `Không có việc ${NHAN_TRANG_THAI[cot.v].toLowerCase()}.`}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      )}

      {pending && <p style={{ fontSize: 12, color: 'var(--faint)' }}>Đang tải…</p>}

      {chon.size > 0 && (
        <ThanhHangLoat
          ids={[...chon]}
          nenTang={nenTang}
          onBoChon={() => setChon(new Set())}
          onXong={(tb) => { setThongBao(tb); setChon(new Set()); nap(); router.refresh() }}
        />
      )}
      {chon.size > 0 && <div style={{ height: 72 }} aria-hidden />}

      {mo !== null && (
        <ChiTietViec
          /*
            key BẮT panel gắn lại khi đổi việc. Không có nó thì ô tiêu đề / mô tả /
            hạn (dùng defaultValue, tức ô KHÔNG kiểm soát) giữ nguyên giá trị việc
            cũ — React chỉ áp defaultValue lúc gắn. Nguy hơn: bản nháp bình luận
            còn sót lại và gửi nhầm sang việc vừa mở.
          */
          key={mo}
          taskId={mo}
          nenTang={nenTang}
          onDong={() => setMo(null)}
          onDoi={() => nap()}
        />
      )}
    </div>
  )
}

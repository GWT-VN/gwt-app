'use client'

/**
 * "Bảng team" v2 — ghép Data view DS theo canvas WorkBangTeam (CEO duyệt 23/11): DataViewToolbar (tìm bo tròn, + Việc
 * mới = mở dòng "+ Việc mới" tạo tại chỗ ở tab Mọi việc — CEO 25/11 bỏ hộp Tạo việc, tab Mọi người · Gấp, ⚙ + dạng xem) · FilterBar (chip điều kiện + "Thêm team" · "Thêm người") · Table /
 * ListView / KanbanBoard · thanh hàng loạt mặt nổi (`ThanhHangLoatViec`). Lọc / sắp / tab ở URL (docs/CHUAN-FILTER.md):
 * `tab`, `q`, `nguoi` (staff id, phẩy), `tt` (trạng thái, phẩy), `team` (team id, phẩy), `cot`/`chieu`. Dữ liệu + quyền
 * qua server action (app/work/actions.ts); lọc chạy trên các việc RPC đã cho xem. Ô / Table / Kanban: DangXemViec.
 *
 * ponytail: tab "Lâu không đụng" + cột "Cập nhật" chưa làm — `work_bang_team` chưa trả `updated_at`.
 */
import { KhungXemViec, useXemViec } from './KhungXemViec'
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, UserPlus, UsersThree } from '@phosphor-icons/react/ssr'
import { boDau, hrefBoLoc, KhungChon, OChonO, OTimKiem, ThanhDaChon, ThanhDangLoc } from '@/bang'
import type { NenTang, ViecTeamRow } from '@/app/work/actions'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DongThem, type DongThemRef } from '@/components/ui/dong-them'
import { CaiDatHienThi, DataViewToolbar, TrangDuLieu, type DangXem } from '@/components/ui/data-view-toolbar'
import { ListView, NhanDau, NutMoMa, type CotDanhSach } from '@/components/ui/list-view'
import { BangTrangThai } from '@/components/ui/table'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MucLoc } from '@/components/ui/tieu-de-cot'
import { useCotBang } from '@/components/ui/use-cot-bang'
import { nhanChip, soNgayToiHan } from '@/lib/work'
import { GOI_Y_THEM, NguoiChinh, taoNhanhViec, TT } from './chung'
import {
  BangViec,
  COT_TEAM as COT,
  docSap,
  KanbanViec,
  NGHIA,
  soNgayKhongDung,
  soSanh,
  TEN_COT,
  useOViec,
  type Sap,
} from './DangXemViec'
import { ChonMuc, ThanhHangLoatViec } from './HangLoat'

type Tab = 'moi' | 'gap' | 'lau'
const TAB: { v: Tab; ten: string }[] = [
  { v: 'moi', ten: 'Mọi người' },
  { v: 'gap', ten: 'Gấp' },
  { v: 'lau', ten: 'Lâu không đụng' },
]
/** Ngưỡng "Lâu không đụng" (canvas WkBangLau): chưa xong và ≥ 14 ngày không ai sửa / ghi nhật ký / bình luận. */
const NGAY_LAU = 14
const XONG = new Set(['done', 'cancelled'])
/** Gấp = chưa xong và (P1 hoặc quá hạn / hạn hôm nay) — chip FilterBar của canvas. */
const laGap = (v: ViecTeamRow) =>
  !XONG.has(v.status) && (v.priority === 1 || (!!v.due_at && soNgayToiHan(v.due_at) <= 0))

const laLau = (v: ViecTeamRow) => !XONG.has(v.status) && (soNgayKhongDung(v) ?? 0) >= NGAY_LAU

const ganVoi = (v: Pick<ViecTeamRow, 'team_name' | 'links' | 'sub_n'>) =>
  [v.team_name, v.links?.[0] ? nhanChip(v.links[0]).ten : v.sub_n ? `${v.sub_n} việc con` : '']
    .filter(Boolean)
    .join(' · ')
const chuoiTim = (v: ViecTeamRow) =>
  boDau(
    [
      v.ref,
      v.title,
      v.creator_ten,
      ...(v.links ?? []).map((l) => nhanChip(l).ten),
      ...v.assignees.map((a) => a.ten),
    ].join(' '),
  )
const dsUrl = (s: string | null) => (s ? s.split(',').filter(Boolean) : [])
/** Khoá ô chọn team = TÊN: ComboboxPanel hiện `gt` làm cột mã khi khác `nhan` — mã kỹ thuật (`ky_thuat`) không cho người xem. */
const gtTeam = (t: NenTang['teams'][number]) => t.name

export function BangTeam({
  rows,
  nenTang,
  onMo,
}: {
  rows: ViecTeamRow[]
  nenTang: NenTang
  /** Mở thẻ xem nhanh / chi tiết (màn nối). */
  onMo?: (id: number) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const spRo = useSearchParams()
  const sp = new URLSearchParams(spRo.toString())
  const [dangXem, setDangXem] = useState<DangXem>('bang')
  const xemViec = useXemViec()
  const c = useCotBang(COT, { url: true })
  const moViec = (id: number) => {
    xemViec.mo(id)
    onMo?.(id)
  }
  const { options, idCua, tenCua, lamMoi, o } = useOViec(nenTang, moViec, c.doRong.nguoi)
  const themRef = useRef<DongThemRef>(null)
  // Bấm nút chính khi đang ở tab khác: đổi tab trước, dòng thêm dựng xong mới mở (ref, không setState trong effect).
  const moSau = useRef(false)

  // ── URL → điều kiện ──
  const tab: Tab = TAB.find((t) => t.v === sp.get('tab'))?.v ?? 'moi'
  const q = sp.get('q') ?? ''
  const nguoiLoc = dsUrl(sp.get('nguoi'))
  const ttLoc = dsUrl(sp.get('tt')).filter((t) => TT.some((x) => x.gt === t))
  const teamLoc = dsUrl(sp.get('team'))
    .map(Number)
    .filter((id) => nenTang.teams.some((t) => t.id === id))
  // "+ Việc mới" chỉ ở tab Mọi việc KHÔNG lọc: việc vừa tạo (mình là Chính, không team, Cần làm, chưa gấp/lâu) phải
  // hiện ngay — đang lọc người/trạng thái/team/từ khoá thì nó lọt khỏi màn sau toast "Đã tạo" (review 25/11).
  const choThem = tab === 'moi' && !q && !nguoiLoc.length && !ttLoc.length && !teamLoc.length
  const { cotUrl, sap } = docSap(sp, { cot: tab === 'gap' ? 'han' : tab === 'lau' ? 'cn' : 'uu', tang: true })

  const datUrl = (sua: Record<string, string | null>) => {
    const p = new URLSearchParams(sp)
    for (const [k, gt] of Object.entries(sua)) {
      if (gt) p.set(k, gt)
      else p.delete(k)
    }
    p.delete('trang')
    router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false })
  }
  const datSap = (s: Sap | null) =>
    datUrl({
      cot: s?.cot ?? null,
      chieu: s ? (s.tang ? 'asc' : 'desc') : null,
    })

  useEffect(() => {
    if (!choThem || !moSau.current) return
    moSau.current = false
    themRef.current?.mo()
  }, [choThem])
  const taoTai = async (ten: string, status?: string) => {
    const ok = await taoNhanhViec(ten, status)
    if (ok) lamMoi()
    return ok
  }

  // ── Lọc + sắp ──
  const tim = boDau(q.trim())
  const nguon = { moi: rows, gap: rows.filter(laGap), lau: rows.filter(laLau) }
  const dong = nguon[tab]
    .filter(
      (v) =>
        (!tim || chuoiTim(v).includes(tim)) &&
        (!nguoiLoc.length || v.assignees.some((a) => nguoiLoc.includes(a.staff_id))) &&
        (!ttLoc.length || ttLoc.includes(v.status)) &&
        (!teamLoc.length || (v.team_id != null && teamLoc.includes(v.team_id))),
    )
    .sort(soSanh(sap))
  const thamSo = {
    tab,
    q: q || undefined,
    nguoi: nguoiLoc.join(',') || undefined,
    tt: ttLoc.join(',') || undefined,
    team: teamLoc.join(',') || undefined,
    cot: cotUrl ?? undefined,
    chieu: cotUrl ? (sap.tang ? 'asc' : 'desc') : undefined,
    // Màn không phân trang → dòng nào biến khỏi màn (sửa tại chỗ sang Xong ở tab Gấp…) thì bỏ chọn hết, để thao tác
    // hàng loạt không sửa ngầm dòng đã khuất (gói bang/ giữ lựa chọn khi lật trang — ở đây không có trang để lật).
    hien: dong.map((v) => v.id).join(','),
  }

  const dieuKien = [
    tab === 'gap' && {
      nhan: 'Gấp',
      giaTri: 'quá hạn + hạn hôm nay + P1',
      href: hrefBoLoc(pathname, sp, 'tab'),
    },
    tab === 'lau' && {
      nhan: 'Lâu không đụng',
      giaTri: `chưa xong · ${NGAY_LAU} ngày không cập nhật`,
      href: hrefBoLoc(pathname, sp, 'tab'),
    },
    q && { nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, sp, 'q') },
    nguoiLoc.length > 0 && {
      nhan: 'Người làm',
      giaTri: nguoiLoc.map(tenCua).join(', '),
      href: hrefBoLoc(pathname, sp, 'nguoi'),
    },
    ttLoc.length > 0 && {
      nhan: 'Trạng thái',
      giaTri: ttLoc.map((t) => TT.find((x) => x.gt === t)!.nhan).join(', '),
      href: hrefBoLoc(pathname, sp, 'tt'),
    },
    teamLoc.length > 0 && {
      nhan: 'Team',
      giaTri: teamLoc.map((id) => nenTang.teams.find((t) => t.id === id)!.name).join(', '),
      href: hrefBoLoc(pathname, sp, 'team'),
    },
  ].filter((d): d is { nhan: string; giaTri: string; href: string } => !!d)

  const tuyChonTt = TT.filter((t) => rows.some((v) => v.status === t.gt)).map((t) => ({
    giaTri: t.gt,
    nhan: t.nhan,
    color: t.color as MucLoc['color'],
  }))
  const teamCon = nenTang.teams.filter((t) => !teamLoc.includes(t.id))

  const cotDs: CotDanhSach<ViecTeamRow>[] = [
    {
      id: 'viec',
      ten: 'Việc',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      o: (v) => (
        <>
          <OChonO khoa={String(v.id)} moTa={`việc ${v.ref}`} />
          <NhanDau gon>{o(v, 'uu')}</NhanDau>
          <NutMoMa ma={v.ref} />
          {o(v, 'viec')}
        </>
      ),
    },
    {
      id: 'gan',
      ten: 'Team · gắn với',
      rong: 'minmax(0,1fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (v) => <span className="min-w-0 truncate text-muted-foreground">{ganVoi(v)}</span>,
    },
    {
      id: 'tt',
      ten: 'Trạng thái',
      rong: '120px',
      dienThoai: 'duoiPhai',
      o: (v) => o(v, 'tt'),
    },
    {
      id: 'han',
      ten: 'Hạn',
      rong: '104px',
      phai: true,
      dienThoai: 'trenPhai',
      o: (v) => o(v, 'han'),
    },
    {
      id: 'chinh',
      ten: 'Chính',
      rong: '40px',
      anKhiHep: true,
      o: (v) => <NguoiChinh nguoi={v.assignees} />,
    },
  ]

  const xem =
    // Kanban ở chỗ được thêm: luôn vẽ đủ cột (kể cả chưa có việc) — tạo thẳng vào cột, tạo xong focus không rơi.
    dangXem === 'kanban' && choThem ? (
      <KanbanViec dong={dong} rows={rows} phu={ganVoi} moViec={moViec} lamMoi={lamMoi} onTao={taoTai} themRef={themRef} />
    ) : rows.length === 0 ? (
      <BangTrangThai
        trangThai="rongThat"
        tieuDe="Chưa có việc nào"
        moTa="Việc bạn được xem sẽ hiện ở đây. Tạo việc đầu tiên bằng nút + Việc mới."
      />
    ) : dong.length === 0 && tab === 'lau' && dieuKien.length === 1 ? (
      // Chỉ có điều kiện của tab → đây là tin TỐT, không phải "lọc sai".
      <BangTrangThai
        trangThai="rongThat"
        tieuDe="Không có việc nào bị bỏ quên"
        moTa={`Mọi việc chưa xong đều được cập nhật trong ${NGAY_LAU} ngày qua.`}
      />
    ) : dong.length === 0 ? (
      <BangTrangThai
        trangThai="rongLoc"
        tieuDe="Không có việc nào khớp bộ lọc"
        moTa="Thử bỏ bớt điều kiện ở thanh lọc."
        onXoaLoc={() => router.replace(pathname, { scroll: false })}
      />
    ) : dangXem === 'kanban' ? (
      <KanbanViec
        dong={dong}
        rows={rows}
        phu={ganVoi}
        moViec={moViec}
        lamMoi={lamMoi}
      />
    ) : dangXem === 'danh-sach' ? (
      <ListView aria-label="Bảng team" cot={cotDs} dong={dong} khoa={(v) => String(v.id)} onMo={(v) => moViec(v.id)} />
    ) : (
      <BangViec
        dong={dong}
        c={c}
        sap={sap}
        onSap={datSap}
        loc={{ tuyChon: tuyChonTt, daChon: ttLoc, onDoi: (gt) => datUrl({ tt: gt.join(',') || null }) }}
        o={o}
      />
    )

  return (
    <KhungXemViec ds={dong} nenTang={nenTang}>
      <TrangDuLieu>
        <CauHinhBangDs
          giaoDien={{ ...O_TIM_PILL, ...CHON_BANG }}
          thanhHangLoat="surface"
          tenCot={TEN_COT}
          nghiaSapXep={NGHIA}
        >
          <DataViewToolbar
            tieuDe="Bảng team"
            dem={{ thay: dong.length, tong: rows.length }}
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Tìm tiêu đề, mã việc, khách…" aria-label="Tìm việc" />
              </Suspense>
            }
            nutChinh={
              <Button
                onClick={() => {
                  if (choThem) return themRef.current?.mo()
                  // Đổi về tab Mọi việc + bỏ lọc (giữ sắp xếp) để việc vừa tạo hiện ngay; dòng dựng xong mới mở.
                  moSau.current = true
                  datUrl({ tab: null, q: null, nguoi: null, tt: null, team: null })
                }}
              >
                <Plus aria-hidden="true" />
                Việc mới
              </Button>
            }
            tabs={
              <Tabs value={tab} onValueChange={(t) => datUrl({ tab: t === 'moi' ? null : t })}>
                <TabsList variant="pill" aria-label="Nhóm việc">
                  {TAB.map((t) => (
                    <TabsTrigger key={t.v} value={t.v}>
                      {t.ten}{' '}
                      <TabsCount color={t.v === 'gap' && nguon.gap.length ? 'danger' : undefined}>
                        {nguon[t.v].length}
                      </TabsCount>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            caiDat={
              <CaiDatHienThi
                dangXem={dangXem}
                onDoiXem={setDangXem}
                cot={COT}
                cotAn={c.an}
                onCotAn={(an) => COT.forEach((x) => c.anHien(x.id, !an.includes(x.id)))}
                sapXep={sap}
                onSapXep={datSap}
              />
            }
            dangXem={dangXem}
            onDoiXem={setDangXem}
            xemNhanh={xemViec.id != null}
            onXemNhanh={(bat) => (bat ? dong[0] && xemViec.mo(dong[0].id) : xemViec.dong())}
          />

          <ThanhDangLoc
            dieuKien={dieuKien}
            hienThi={dong.length}
            tong={rows.length}
            nhan="việc"
            sapXep={cotUrl ? { ...sap, macDinh: false } : undefined}
            phai={
              <>
                {teamCon.length > 0 && (
                  <ChonMuc
                    nhan="Lọc theo team"
                    side="bottom"
                    goiY="Gõ tên team…"
                    options={teamCon.map((t) => ({ gt: gtTeam(t), nhan: t.name }))}
                    onChon={(m) => {
                      const t = nenTang.teams.find((x) => gtTeam(x) === m.gt)
                      if (t) datUrl({ team: [...teamLoc, t.id].join(',') })
                    }}
                    nut={
                      <Button variant="outline" size="sm">
                        <UsersThree aria-hidden="true" />
                        Thêm team
                      </Button>
                    }
                  />
                )}
                <ChonMuc
                  nhan="Lọc theo người làm"
                  side="bottom"
                  options={options.filter((m) => !nguoiLoc.includes(idCua(m.gt) ?? ''))}
                  onChon={(m) => {
                    const id = idCua(m.gt)
                    if (id) datUrl({ nguoi: [...nguoiLoc, id].join(',') })
                  }}
                  nut={
                    <Button variant="outline" size="sm">
                      <UserPlus aria-hidden="true" />
                      Thêm người
                    </Button>
                  }
                />
              </>
            }
          />

          <KhungChon
            khoaTrang={dong.map((v) => String(v.id))}
            tong={dong.length}
            bat={dangXem !== 'kanban'}
            thamSo={thamSo}
          >
            {xem}
            {/* Kanban có "+ Việc mới" ở chân từng cột. */}
            {choThem && dangXem !== 'kanban' && (
              <DongThem
                ref={themRef}
                kieu={dangXem === 'bang' && dong.length ? 'bang' : 'ds'}
                nhan="Việc mới"
                placeholder={GOI_Y_THEM}
                onTao={(ten) => taoTai(ten)}
              />
            )}
            <ThanhDaChon nhan="việc">
              <ThanhHangLoatViec nenTang={nenTang} xong={lamMoi} />
            </ThanhDaChon>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </KhungXemViec>
  )
}

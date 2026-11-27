'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { thGhim } from '@/components/ui/table-styles'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { DataViewToolbar } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { useHangTab } from '@/components/HangTab'
import { hrefBoLoc, KhungChon, OTimKiem, ThanhDangLoc } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import type { TabView } from '@/app/actions'
import { TAB_NV, TRANG_THAI_NV, TRUONG_NV } from '@/app/nhan-vien/truong-nhan-vien'
import { cn } from '@/lib/utils'

import { useRef, useState, useTransition, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  capMatKhauMoi, demThamChieuNhanSu, doiTenNhanVien, guiLaiMatKhau, suaNhanVien, xoaNhanSu,
} from '@/lib/nen-tang/nhan-su'
import { moTaThamChieu } from '@/lib/nen-tang/nhan-su-luat'
import { MatKhauVuaCap } from './MatKhauVuaCap'
import {
  HO_SO_VAI_TRO, NHAN_BO_PHAN, NHAN_VAI_TRO, VAI_TRO,
  apDungLoaiTruCapBac, apDungLoaiTruKhiTick, type BoPhan, type VaiTro,
} from '@/lib/nen-tang/vai-tro'

export type DongNhanVien = {
  id: string
  ten: string
  vai_tro: string[]
  email: string | null
  hoat_dong: boolean
}

/** Tiêu đề cột phải ngắn — 13 cột mà viết đủ chữ thì bảng rộng gấp ba màn hình. */
const TEN_COT: Record<VaiTro, string> = {
  ceo: 'CEO',
  admin: 'Toàn quyền',
  quan_tri_ht: 'Hệ thống',
  kt_giam_doc: 'GĐ',
  ky_thuat: 'NV',
  ctv_lap_dat: 'CTV',
  cs_manager: 'Trưởng',
  cs: 'NV',
  sua_ds_nguoi: 'Sửa',
  sales_manager: 'Trưởng',
  sales: 'NV',
  marketing: 'MKT',
  kho: 'Kho',
  ke_toan: 'KT',
  tai_chinh: 'TC',
}

/** Băng nhóm bộ phận ở hàng tiêu đề trên cùng. */
const NHOM: { boPhan: BoPhan; vaiTro: VaiTro[] }[] = []
for (const v of VAI_TRO) {
  const bp = HO_SO_VAI_TRO[v].boPhan
  const cuoi = NHOM[NHOM.length - 1]
  if (cuoi && cuoi.boPhan === bp) cuoi.vaiTro.push(v)
  else NHOM.push({ boPhan: bp, vaiTro: [v] })
}

/** Lọc ▸ trường: giá trị chọn của Trạng thái / Vai trò. */
const TRUONG_LOC: TruongLoc[] = TRUONG_NV.map((x) => ({
  ...x,
  tuyChon: x.id === 'tt' ? TRANG_THAI_NV : VAI_TRO.map((v) => ({ giaTri: v, nhan: NHAN_VAI_TRO[v] })),
}))

/**
 * Nhân viên — đầu + tab + Lọc theo khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md); THÂN là MA TRẬN
 * người × vai trò (tick là lưu) nên giữ bảng nhóm cột theo bộ phận, không cột co dãn / ẩn / đổi chỗ như bảng danh sách.
 * Lọc chạy ở server (app/nhan-vien/page.tsx), ở đây chỉ dựng nút Lọc + chip. Cột Người dính trái khi kéo ngang.
 */
export function BangNhanVien({
  ds, toiId, choXoa = false, choMatKhau = false, tong, tabRieng = [], quyenTabChung = false, demTab, nutChinh, ghiChu,
}: {
  ds: DongNhanVien[]; toiId: string; choXoa?: boolean; choMatKhau?: boolean
  tong: number; tabRieng?: TabView[]; quyenTabChung?: boolean; demTab?: Record<string, number>
  nutChinh?: ReactNode; ghiChu?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const q = params.get('q')
  const dk = docTatCa(params, TRUONG_LOC)
  const { nut: refNutLoc, chip: refChipLoc } = useMoLoc()
  const tenGt = (t: TruongLoc) => (g: string) => t.tuyChon?.find((x) => x.giaTri === g)?.nhan ?? g
  const hangTab = useHangTab({
    bang: 'nhan_vien_tab',
    coDinh: TAB_NV,
    tabRieng,
    demTab,
    quyenTabChung,
    nhan: 'nhân viên',
    khu: 'Hệ thống',
    viDuTen: 'VD: Kho + Kế toán',
    dieuKien: [
      ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
      ...dk.map((d) => {
        const t = TRUONG_LOC.find((x) => x.id === d.truong)!
        const n = nhanChip(d, t.ten, tenGt(t))
        return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
      }),
    ],
  })
  function datLoc(id: string, d: DieuKienLoc | null) {
    const tiep = new URLSearchParams(params.toString())
    const gt = ghiDieuKien(d, TRUONG_LOC.find((x) => x.id === id)!.kieu)
    if (gt == null) tiep.delete(id)
    else tiep.set(id, gt)
    const s = tiep.toString()
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }
  const dieuKien = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...dk.map((d) => {
      const t = TRUONG_LOC.find((x) => x.id === d.truong)!
      return { nhan: t.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={t} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]

  // KHÔNG khoá ô lúc lưu — dù chỉ khoá một dòng. Người dùng bấm 3-4 vai trò liên
  // tiếp cho cùng một người là chuyện thường; khoá là nuốt mất cú bấm thứ 2 trở đi
  // (đúng triệu chứng "tick loạn xạ"). Thay bằng: hiện ngay + gửi lưu ngay.
  //
  // Bấm nhanh sinh nhiều lượt lưu chồng nhau, phản hồi có thể về không đúng thứ
  // tự. luot.current đánh số từng lượt theo dòng: phản hồi của lượt CŨ về muộn sẽ
  // bị bỏ qua, chỉ lượt MỚI NHẤT được quyền xoá trạng thái tạm hoặc báo lỗi.
  const [ghiDe, setGhiDe] = useState<Record<string, VaiTro[]>>({})
  const [dangLuu, setDangLuu] = useState<Record<string, boolean>>({})
  const [loi, setLoi] = useState<Record<string, string>>({})
  const [xong, setXong] = useState<Record<string, string>>({})
  const luot = useRef<Record<string, number>>({})
  // Mật khẩu vừa cấp hiện Ở TRÊN BẢNG chứ không trong ô Trạng thái: ô đó rộng
  // chưa tới 200px, nhét mật khẩu + hai nút chép vào là vỡ bảng.
  const [mkVuaCap, setMkVuaCap] = useState<{ email: string; matKhau: string } | null>(null)
  // id -> đang chờ admin bấm xác nhận xoá. Hỏi lại là bắt buộc: xoá không hoàn tác được.
  const [hoiXoa, setHoiXoa] = useState<Record<string, boolean>>({})
  const [, batDau] = useTransition()

  const vaiTroCua = (nv: DongNhanVien) => ghiDe[nv.id] ?? (nv.vai_tro as VaiTro[])

  function boGhiDe(id: string) {
    setGhiDe((g) => Object.fromEntries(Object.entries(g).filter(([k]) => k !== id)))
  }

  /** Hiện NGAY trên giao diện, lưu ngầm; hỏng thì bật về cũ kèm lỗi ngay tại dòng. */
  function luu(id: string, lacQuan: VaiTro[] | null, chay: () => Promise<{ ok: boolean; error?: string }>) {
    const cuaToi = (luot.current[id] ?? 0) + 1
    luot.current[id] = cuaToi

    if (lacQuan) setGhiDe((g) => ({ ...g, [id]: lacQuan }))
    setDangLuu((d) => ({ ...d, [id]: true }))
    setLoi((l) => Object.fromEntries(Object.entries(l).filter(([k]) => k !== id)))

    batDau(async () => {
      const r = await chay()
      // Lượt cũ về muộn: bỏ qua hoàn toàn, nếu không nó sẽ xoá mất thao tác mới hơn.
      if (luot.current[id] !== cuaToi) return
      setDangLuu((d) => ({ ...d, [id]: false }))
      if (!r.ok) setLoi((l) => ({ ...l, [id]: r.error ?? 'Không lưu được.' }))
      boGhiDe(id)
    })
  }

  function tick(nv: DongNhanVien, v: VaiTro) {
    const hienTai = vaiTroCua(nv)
    const moi = hienTai.includes(v)
      ? apDungLoaiTruCapBac(hienTai.filter((x) => x !== v))
      : apDungLoaiTruKhiTick(hienTai, v)
    luu(nv.id, moi, () => suaNhanVien(nv.id, { vai_tro: moi }))
  }

  return (
    <KhungChon khoaTrang={[]} tong={tong} bat={false} thamSo={{}}>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
      <DataViewToolbar
        tieuDe="Nhân viên"
        timKiem={<OTimKiem placeholder="Tên, email…" aria-label="Tìm nhân viên" />}
        nutChinh={nutChinh}
        tabs={hangTab.tabs}
        dangXem="bang"
        loc={<NutLoc ref={refNutLoc} truong={TRUONG_LOC} dieuKien={dk} onDoi={datLoc} />}
      />
      <ThanhDangLoc dieuKien={dieuKien} hienThi={ds.length} tong={tong} nhan="nhân viên" anSoDong
        hrefXoaLoc={hrefBoLoc(pathname, params, 'q', ...TRUONG_NV.map((x) => x.id))} />
      {mkVuaCap && <MatKhauVuaCap email={mkVuaCap.email} matKhau={mkVuaCap.matKhau} />}

      <TableWrap tabIndex={0} role="region" aria-label="Vùng cuộn bảng nhân viên">
        <Table variant="thuong" aria-label="Nhân viên theo bộ phận">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className={cn(thGhim, 'z-2')}>Người</TableHead>
              {NHOM.map((n) => (
                <TableHead key={n.boPhan} scope="colgroup" colSpan={n.vaiTro.length} className="text-center">
                  {NHAN_BO_PHAN[n.boPhan]}
                </TableHead>
              ))}
              <TableHead scope="col">Trạng thái</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className={cn(thGhim, 'z-2')} />
              {VAI_TRO.map((v) => (
                <TableHead key={v} scope="col" title={NHAN_VAI_TRO[v]} className="text-center font-normal">
                  {TEN_COT[v]}
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {ds.map((nv) => {
              const vaiTro = vaiTroCua(nv)
              const dangChay = dangLuu[nv.id] ?? false
              return (
                <TableRow key={nv.id} className={cn(!nv.hoat_dong && 'text-muted-foreground', dangChay && 'opacity-70')}>
                  <TableCell ghim className="h-auto py-2 align-top">
                    <Input
                      aria-label={`Tên nhân viên ${nv.email ?? nv.ten}`}
                      defaultValue={nv.ten}
                      disabled={dangChay}
                      onBlur={(e) => {
                        const t = e.target.value.trim()
                        if (t && t !== nv.ten) luu(nv.id, null, () => doiTenNhanVien(nv.id, t))
                      }}
                      className="w-44"
                    />
                    <div className="mt-0.5 max-w-44 truncate font-mono text-xs text-muted-foreground">
                      {nv.email ?? <span className="text-(--color-text-warning)">chưa có email</span>}
                      {nv.id === toiId && <span className="ml-1 text-muted-foreground">← bạn</span>}
                    </div>
                    {vaiTro.length === 0 && (
                      <div className="text-xs text-(--color-text-warning)">chưa gán vai trò</div>
                    )}
                    {loi[nv.id] && (
                      <div className="mt-0.5 max-w-44 whitespace-normal text-xs text-(--color-text-danger)">{loi[nv.id]}</div>
                    )}
                  </TableCell>

                  {VAI_TRO.map((v) => (
                    <TableCell key={v} className="text-center">
                      <Checkbox
                        aria-label={`${nv.email ?? nv.ten} — ${NHAN_VAI_TRO[v]}`}
                        checked={vaiTro.includes(v)}
                        onCheckedChange={() => tick(nv, v)}
                      />
                    </TableCell>
                  ))}

                  <TableCell className="h-auto space-y-1 py-2">
                    <Button
                      type="button" variant={nv.hoat_dong ? 'outline' : 'secondary'} size="sm"
                      disabled={dangChay}
                      onClick={() => luu(nv.id, null, () => suaNhanVien(nv.id, { hoat_dong: !nv.hoat_dong }))}
                    >
                      {nv.hoat_dong ? 'Đang hoạt động' : 'Đã khoá'}
                    </Button>
                    <div>
                      <Button
                        type="button" variant="ghost" size="xs"
                        disabled={dangChay || !nv.email}
                        title={nv.email ? 'Gửi email đặt lại mật khẩu' : 'Chưa có email'}
                        onClick={() => {
                          setXong((x) => Object.fromEntries(Object.entries(x).filter(([k]) => k !== nv.id)))
                          luu(nv.id, null, async () => {
                            const r = await guiLaiMatKhau(nv.id)
                            if (r.ok) setXong((x) => ({ ...x, [nv.id]: 'Đã gửi email đặt lại mật khẩu.' }))
                            return r
                          })
                        }}
                      >
                        gửi lại mật khẩu
                      </Button>
                    </div>
                    {choMatKhau && (
                      <div>
                        <Button
                          type="button" variant="ghost" size="xs"
                          disabled={dangChay || !nv.email}
                          title={nv.email
                            ? 'Đặt mật khẩu ban đầu mới và bắt họ đổi ở lần đăng nhập tới'
                            : 'Chưa có email'}
                          onClick={() => {
                            setXong((x) => Object.fromEntries(Object.entries(x).filter(([k]) => k !== nv.id)))
                            setMkVuaCap(null)
                            luu(nv.id, null, async () => {
                              const r = await capMatKhauMoi(nv.id)
                              if (r.ok) setMkVuaCap({ email: r.email, matKhau: r.matKhau })
                              return r
                            })
                          }}
                        >
                          cấp mật khẩu mới
                        </Button>
                      </div>
                    )}

                    {choXoa && nv.id !== toiId && (
                      <div>
                        {hoiXoa[nv.id] ? (
                          <span className="text-xs text-(--color-text-danger)">
                            Xoá hẳn?{' '}
                            <Button
                              type="button" variant="destructive" size="xs" disabled={dangChay}
                              onClick={() => {
                                setHoiXoa((h) => ({ ...h, [nv.id]: false }))
                                // Xoá người nào thì dọn luôn ô mật khẩu của người đó,
                                // không thì màn hình còn khoe mật khẩu của một tài khoản
                                // vừa bị xoá — nhìn là tưởng chưa xoá được.
                                setMkVuaCap((m) => (m && m.email === nv.email ? null : m))
                                luu(nv.id, null, () => xoaNhanSu(nv.id))
                              }}
                            >
                              xoá
                            </Button>{' '}
                            <Button
                              type="button" variant="ghost" size="xs"
                              onClick={() => setHoiXoa((h) => ({ ...h, [nv.id]: false }))}
                            >
                              huỷ
                            </Button>
                          </span>
                        ) : (
                          <Button
                            type="button" variant="ghost" size="xs" className="text-(--color-text-danger-ghost)"
                            disabled={dangChay}
                            title="Chỉ xoá được người chưa có dữ liệu gì trong hệ thống"
                            onClick={() => {
                              // Đếm TRƯỚC khi hỏi: câu "xoá hẳn?" chỉ nên hiện khi
                              // thật sự xoá được, còn không thì nói luôn vì sao không.
                              luu(nv.id, null, async () => {
                                const r = await demThamChieuNhanSu(nv.id)
                                if (!r.ok) return r
                                if (r.chan.length > 0) {
                                  return {
                                    ok: false,
                                    error: `Còn ${moTaThamChieu(r.chan)} — không xoá được, chỉ nên KHOÁ.`,
                                  }
                                }
                                setHoiXoa((h) => ({ ...h, [nv.id]: true }))
                                return { ok: true }
                              })
                            }}
                          >
                            xoá
                          </Button>
                        )}
                      </div>
                    )}

                    {xong[nv.id] && (
                      <div className="text-xs text-(--color-text-success)">{xong[nv.id]}</div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableWrap>
      </div>
      {!ds.length && (
        <EmptyState size="sm" kieu={dieuKien.length ? 'loc' : 'that'}
          tieuDe={dieuKien.length ? 'Không có nhân viên nào khớp' : 'Chưa có nhân viên'}
          moTa={dieuKien.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : undefined} />
      )}
      {ghiChu}

      <p className="text-xs text-muted-foreground">
        Kéo ngang để thấy hết bộ phận — cột người luôn dính bên trái. Di chuột vào tên cột để xem
        tên vai trò đầy đủ. Trong cùng một bộ phận, ô bạn <b>vừa bấm</b> là ô thắng: đang Trưởng CSKH
        mà bấm NV CSKH thì thành nhân viên. Khoá một người là họ mất đường vào ngay lần tải trang kế
        tiếp, kể cả email <code className="mx-1 text-xs">@gwt.vn</code>. Sửa tên xong bấm ra ngoài ô là lưu.
      </p>

      {choXoa && (
        <p className="text-xs text-muted-foreground">
          <b>Khoá</b> và <b>xoá</b> khác nhau: khoá là chặn đường vào, mọi ticket và việc của họ còn
          nguyên — dùng cho người nghỉ việc. Xoá là bỏ hẳn khỏi hệ thống, <b>chỉ làm được khi họ chưa
          có dữ liệu gì</b>, dành đúng cho ca gõ nhầm email lúc mời. Xoá thì mất luôn cả tài khoản
          đăng nhập của email đó.
        </p>
      )}
    </KhungChon>
  )
}

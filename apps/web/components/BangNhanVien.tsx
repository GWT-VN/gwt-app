'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

import { useRef, useState, useTransition } from 'react'
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

/** Cột Tên + Trạng thái dính bên trái khi kéo ngang — luôn biết đang tick cho ai. */
const GHIM = 'sticky left-0 z-20 bg-inherit border-r'

export function BangNhanVien({
  ds, toiId, choXoa = false, choMatKhau = false,
}: { ds: DongNhanVien[]; toiId: string; choXoa?: boolean; choMatKhau?: boolean }) {
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
    <div className="space-y-2">
      {mkVuaCap && <MatKhauVuaCap email={mkVuaCap.email} matKhau={mkVuaCap.matKhau} />}

      <TableWrap vien tabIndex={0} aria-label="Nhân viên theo bộ phận">
        <Table variant="thuong" aria-label="Nhân viên theo bộ phận">
          <TableHeader className="text-muted-foreground">
            <TableRow className="bg-muted">
              <TableHead className={`${GHIM} bg-muted text-left px-3 py-2 font-medium border-b`}>Người</TableHead>
              {NHOM.map((n) => (
                <TableHead
                  key={n.boPhan}
                  colSpan={n.vaiTro.length}
                  className="px-2 py-1.5 text-xs font-medium border-b border-l text-center whitespace-nowrap"
                >
                  {NHAN_BO_PHAN[n.boPhan]}
                </TableHead>
              ))}
              <TableHead className="px-3 py-2 font-medium border-b border-l text-left">Trạng thái</TableHead>
            </TableRow>
            <TableRow className="bg-muted/70">
              <TableHead className={`${GHIM} bg-muted/70 border-b`} />
              {VAI_TRO.map((v) => (
                <TableHead
                  key={v}
                  title={NHAN_VAI_TRO[v]}
                  className="px-2 py-1.5 text-[11px] font-normal text-muted-foreground border-b border-l text-center whitespace-nowrap"
                >
                  {TEN_COT[v]}
                </TableHead>
              ))}
              <TableHead className="border-b border-l" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {ds.map((nv) => {
              const vaiTro = vaiTroCua(nv)
              const dangChay = dangLuu[nv.id] ?? false
              const nen = nv.hoat_dong ? 'bg-card' : 'bg-muted/70'
              return (
                <TableRow
                  key={nv.id}
                  className={`${nen} ${nv.hoat_dong ? '' : 'text-muted-foreground'} ${dangChay ? 'opacity-70' : ''}`}
                >
                  <TableCell className={`${GHIM} ${nen} px-3 py-2 border-b align-top`}>
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
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-44">
                      {nv.email ?? <span className="text-(--color-text-warning)">chưa có email</span>}
                      {nv.id === toiId && <span className="ml-1 text-muted-foreground">← bạn</span>}
                    </div>
                    {vaiTro.length === 0 && (
                      <div className="text-[11px] text-(--color-text-warning)">chưa gán vai trò</div>
                    )}
                    {loi[nv.id] && (
                      <div className="text-[11px] text-(--color-text-danger) mt-0.5 max-w-44">{loi[nv.id]}</div>
                    )}
                  </TableCell>

                  {VAI_TRO.map((v) => (
                    <TableCell key={v} className="px-2 py-2 border-b border-l text-center">
                      <Checkbox
                        aria-label={`${nv.email ?? nv.ten} — ${NHAN_VAI_TRO[v]}`}
                        checked={vaiTro.includes(v)}
                        onCheckedChange={() => tick(nv, v)}
                      />
                    </TableCell>
                  ))}

                  <TableCell className="px-3 py-2 border-b border-l whitespace-nowrap space-y-1">
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
                          <span className="text-[11px] text-(--color-text-danger)">
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
                      <div className="text-[11px] text-(--color-text-success)">{xong[nv.id]}</div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableWrap>

      <p className="text-xs text-muted-foreground">
        Kéo ngang để thấy hết bộ phận — cột người luôn dính bên trái. Di chuột vào tên cột để xem
        tên vai trò đầy đủ. Trong cùng một bộ phận, ô bạn <b>vừa bấm</b> là ô thắng: đang Trưởng CSKH
        mà bấm NV CSKH thì thành nhân viên. Khoá một người là họ mất đường vào ngay lần tải trang kế
        tiếp, kể cả email <code className="mx-1 text-[11px]">@gwt.vn</code>. Sửa tên xong bấm ra ngoài ô là lưu.
      </p>

      {choXoa && (
        <p className="text-xs text-muted-foreground">
          <b>Khoá</b> và <b>xoá</b> khác nhau: khoá là chặn đường vào, mọi ticket và việc của họ còn
          nguyên — dùng cho người nghỉ việc. Xoá là bỏ hẳn khỏi hệ thống, <b>chỉ làm được khi họ chưa
          có dữ liệu gì</b>, dành đúng cho ca gõ nhầm email lúc mời. Xoá thì mất luôn cả tài khoản
          đăng nhập của email đó.
        </p>
      )}
    </div>
  )
}

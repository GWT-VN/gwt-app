'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { uploadThuMuc } from './actions'

const tien = (n: number) => Math.round(n).toLocaleString('vi-VN')

/**
 * Upload CẢ THƯ MỤC NEXIA gửi hằng tháng (file cổng thuế Mua vào/Bán ra × Chi tiết/Tổng quan, từ T9/2026).
 * Chọn xong TỰ gửi, giống FormUpload (một hành động, một nút). Kỳ lấy theo ngày lập hoá đơn; ở màn kỳ thì
 * gửi kèm `ky` để server chặn nhầm tháng.
 *
 * Hai ô file ẩn cùng name="files": thư mục (webkitdirectory) hoặc chọn nhiều file lẻ. Chọn ô này thì xoá
 * ô kia — không thì lần chọn cũ còn nằm trong form và bị gửi kèm.
 */
export function FormThuMuc(props: { ky?: string }) {
  const [kq, act, dang] = useActionState(uploadThuMuc, null)
  const formRef = useRef<HTMLFormElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<HTMLInputElement>(null)
  const [ten, setTen] = useState<string | null>(null)

  // React không có prop kiểu cho webkitdirectory → gắn thuộc tính tay.
  useEffect(() => { dirRef.current?.setAttribute('webkitdirectory', ''); dirRef.current?.setAttribute('directory', '') }, [])

  const chon = (o: HTMLInputElement | null, khac: HTMLInputElement | null) => {
    if (!o) return
    if (khac) khac.value = ''
    o.value = '' // chọn lại đúng thư mục vừa lỗi thì onChange vẫn bắn
    o.click()
  }
  const daChon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ds = e.target.files
    if (!ds || ds.length === 0) return
    const dau = ds[0].webkitRelativePath?.split('/')[0]
    setTen(dau || `${ds.length} file`)
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={act} className="space-y-2 rounded-xl border border-[#3f8a6a]/40 bg-white p-3 shadow-sm">
      {props.ky ? <input type="hidden" name="ky" value={props.ky} /> : null}
      <input ref={dirRef} type="file" name="files" multiple className="hidden" tabIndex={-1} onChange={daChon} />
      <input ref={filesRef} type="file" name="files" multiple accept=".xlsx" className="hidden" tabIndex={-1} onChange={daChon} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={dang} onClick={() => chon(dirRef.current, filesRef.current)}
          className="rounded bg-[#3f8a6a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#35745a] disabled:opacity-50">
          {dang ? 'Đang xử lý…' : props.ky ? 'Upload lại thư mục NEXIA' : 'Chọn thư mục NEXIA tháng'}
        </button>
        <button type="button" disabled={dang} onClick={() => chon(filesRef.current, dirRef.current)} className="text-sm text-[#3f8a6a] underline disabled:opacity-50">
          hoặc chọn các file .xlsx
        </button>
        {dang && ten ? <span className="text-sm text-slate-500">{ten}</span> : null}
      </div>
      <p className="text-xs text-slate-500">
        Thư mục NEXIA gửi: <b>Mua vào</b> + <b>Bán ra</b>, mỗi bên file <i>Chi tiết</i> (bắt buộc) và <i>Tổng quan</i> (để đối chiếu tổng tiền).
        {props.ky ? null : ' Kỳ lấy theo ngày lập hoá đơn.'}
      </p>

      {!dang && kq?.ok ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-900">
          <div className="font-medium">
            Kỳ {kq.ky}: thêm {kq.upload.inserted} · cập nhật {kq.upload.updated} · giữ {kq.upload.kept} · cảnh báo {kq.upload.canhBao}
            {kq.upload.thieu > 0 ? ` · ${kq.upload.thieu} dòng của lần trước không còn` : ''}
          </div>
          <div>Mua vào: {kq.tomTat.vao.soDong} dòng · {kq.tomTat.vao.soHd} HĐ · {tien(kq.tomTat.vao.tong)} đ</div>
          <div>Bán ra: {kq.tomTat.ra.soDong} dòng · {kq.tomTat.ra.soHd} HĐ · {tien(kq.tomTat.ra.tong)} đ</div>
          <div>
            Đối chiếu Tổng quan: {kq.tomTat.doiChieu === 'khop' ? '✓ khớp cả hai chiều' : kq.tomTat.doiChieu === 'mot_phan' ? 'chỉ có một file Tổng quan (đã khớp)' : 'không có file Tổng quan — chưa đối chiếu'}
          </div>
          {kq.tomTat.boQua.length ? <div className="text-xs text-slate-600">Bỏ qua: {kq.tomTat.boQua.join(', ')}</div> : null}
          {!kq.coBia ? <div className="text-xs text-amber-700">Chưa có mẫu sheet bìa trên Storage — file xuất không kèm checklist NEXIA.</div> : null}
          {kq.luuGocLoi ? <div className="text-xs text-amber-700">{kq.luuGocLoi} file gốc không lưu được lên Storage (dữ liệu kỳ vẫn đã nhập).</div> : null}
          {props.ky ? null : <Link href={`/ke-toan/hoa-don/${kq.ky}`} className="mt-1 inline-block font-medium text-[#3f8a6a] underline">Mở kỳ {kq.ky} →</Link>}
        </div>
      ) : null}
      {!dang && kq && !kq.ok ? (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          <div className="font-medium">{kq.error}</div>
          {kq.loi?.length ? <ul className="ml-4 list-disc">{kq.loi.map((l, i) => <li key={i}>{l}</li>)}</ul> : null}
        </div>
      ) : null}
    </form>
  )
}

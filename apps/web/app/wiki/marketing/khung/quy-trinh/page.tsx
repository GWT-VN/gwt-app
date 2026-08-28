import Link from "next/link";
import { PROCESS_DOCS } from "@/lib/marketing/content";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Quy trình sản xuất" };

export default function Page() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Khung ④ — Sản xuất</div>
        <h1>Quy trình sản xuất</h1>
        <p>
          Hai quy trình chuẩn của team — render thẳng từ <code>Work GWT/Quy trình/</code>, không chép lại. Người mới
          đọc hết hai file này là chạy được trọn một video.
        </p>
      </div>

      <div className="notice">
        <Icon.warn />
        <div>
          Nguyên tắc xuyên suốt: <b>bước sau không sửa được lỗi bước trước.</b> Kịch bản sai thì editor giỏi mấy cũng
          không cứu được.
        </div>
      </div>

      <div className="grid grid-2">
        {PROCESS_DOCS.map((d) => (
          <Link className="card link" href={`/wiki/marketing/khung/quy-trinh/${d.slug}`} key={d.slug}>
            <div className="card-ic"><Icon.film /></div>
            <h3>{d.title}</h3>
            <p>{d.blurb}</p>
            <div className="go">Mở →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

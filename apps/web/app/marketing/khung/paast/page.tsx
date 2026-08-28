import { AXES, PAAST } from "@/lib/marketing/data/frameworks";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Khung PAAST" };

export default function Page() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Khung ② — Chất lượng</div>
        <h1>Khung chấm PAAST</h1>
        <p>Thẻ chấm 5 chữ để đánh giá và viết từng video. Mỗi chữ gắn một bộ khung con. Đủ 5 chữ = video khoẻ.</p>
      </div>

      <div className="paast">
        {PAAST.map((p) => (
          <div className={`pcol ${p.cls}`} key={p.sub}>
            <div className="ph">
              <div className="pl">{p.k}</div>
              <div>
                <div className="pt">{p.t}</div>
                <div className="ps">{p.sub}</div>
              </div>
            </div>
            <ul>
              {p.items.map(([k, v]) => (
                <li key={`${p.sub}-${v}`}><span className="lk">{k}</span><span>{v}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="page-head" style={{ marginTop: 10 }}>
        <h1 style={{ fontSize: "1.25rem" }}>3 trục nhận xét một video</h1>
        <p>Áp dụng sau khi có sản phẩm, để cùng học hỏi — mỗi trục một câu hỏi.</p>
      </div>
      <div className="axis">
        {AXES.map((ax) => (
          <div className="ax" key={ax.name}>
            <h4><span className="dot" style={{ background: ax.dot }} />{ax.name}</h4>
            <p>{ax.q}</p>
            <ol>{ax.items.map((i) => <li key={i}>{i}</li>)}</ol>
          </div>
        ))}
      </div>

      <div className="notice">
        <Icon.check />
        <div>
          <b>Sắp có:</b> skill <span className="chip mono">cham_video_paast</span> — đưa link video (đối thủ / tham
          khảo / của bạn) → tự chấm P·A·A·S·T + chỉ chỗ fail + gợi ý sửa theo Luật sửa content.
        </div>
      </div>
    </section>
  );
}

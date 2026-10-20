import AdsResultsView from "@/components/marketing/AdsResultsView";
import { ADS_WEEKS, getLatestWeek } from "@/lib/marketing/data/ads-results";

export const metadata = { title: "Kết quả Ads" };

export default function Page() {
  const latest = getLatestWeek();
  const activeCount = latest.ads.filter((a) => a.status === "active" || a.status === "new").length;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Dữ liệu ads · Facebook</div>
        <h1>Kết quả chạy Ads</h1>
        <p>
          Theo dõi chi phí và hiệu quả từng campaign Facebook Ads
          {` — ${activeCount} camp đang chạy kỳ ${latest.label}, ${ADS_WEEKS.length} kỳ đã ghi nhận`}.
          Cost/Result = Chi phí ÷ Số message. Mỗi creative (video gốc) có thể chạy nhiều camp — tắt rồi lên lại là camp mới.
        </p>
      </div>
      <AdsResultsView weeks={ADS_WEEKS} />
    </section>
  );
}

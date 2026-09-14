import AdsResultsView from "@/components/marketing/AdsResultsView";
import { ADS_WEEKS, getLatestWeek } from "@/lib/marketing/data/ads-results";

export const metadata = { title: "Kết quả Ads" };

export default function Page() {
  const latest = getLatestWeek();
  const activeCount = latest.ads.filter((a) => a.costPerResult != null).length;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Dữ liệu ads · Facebook</div>
        <h1>Kết quả chạy Ads hàng tuần</h1>
        <p>
          Theo dõi chi phí và hiệu quả từng campaign Facebook Ads
          {` — ${activeCount} ads đang chạy, ${ADS_WEEKS.length} tuần đã ghi nhận`}.
          Chi phí tính theo đơn vị 1.000 đồng, Cost/Result = Chi phí ÷ Số message.
        </p>
      </div>
      <AdsResultsView weeks={ADS_WEEKS} />
    </section>
  );
}

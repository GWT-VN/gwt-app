// Kiểu dữ liệu cho engine phân loại kế toán (lát 1: rule-based; lát 2 sẽ thêm học từ corrections).

// Một luật phân loại lưu ở bảng accounting.rules — pattern đã chuẩn hoá (norm() hoặc sd()) theo kind.
export type Luat = { id?: number; kind: 'supplier' | 'keyword' | 'product_name'; pattern: string; targetCode: string; condition: string | null; priority: number; origin: 'rule_excel' | 'override_json' | 'history' | 'app'; active: boolean }

// Một mã trong catalog hàng hoá (gương từ Masterdata). capHai/capBa = "Danh mục cấp 2/3" (dùng cho nhóm SP đầu ra).
export type MucCatalog = { ma: string; ten: string; tinhChat: string; capHai?: string; capBa?: string }

// Nhóm sản phẩm đầu ra, suy từ danh mục cấp 2/3.
export type NhomSP = 'POE' | 'POU-Countertop' | 'POU-Undersink' | 'Others'

// Một dòng kênh bán hàng theo MST (gương public.dim_channel).
export type MucKenh = { mst: string | null; companyName: string | null; channelL1: string; channelL2: string }

// Một mã khoản mục chi phí (KMCP) — gương public.expense_category.
export type MucKmcp = { ma: string; ten: string; tkNoDefault: string }

// Độ tin cậy kết quả phân loại engine trả về cho một dòng hoá đơn.
export type DoTinCay = 'cao' | 'trung binh' | 'can review' | 'khong ro'

// Kết quả engine phân loại một dòng hoá đơn đầu vào.
export type KetQuaDauVao = { kind: 'goods' | 'muahang' | 'kmcp' | 'unknown'; code: string; codeName: string; tkNo: string; tkCo: string; vat1331: string; conf: DoTinCay; reason: string; nguon: string }

// Kết quả engine phân loại một dòng hoá đơn đầu ra.
export type KetQuaDauRa = { code: string; codeName: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; reason: string; customerCode: string; productGroup: NhomSP | ''; channelL1: string; channelL2: string; dealerName: string }

// Thống kê học từ corrections (RPC ke_toan_thong_ke_hoc) — ngưỡng tính ở SQL, engine chỉ tra.
export type ThongKeHoc = { ncc: Record<string, string>; prefix: Record<string, string> }

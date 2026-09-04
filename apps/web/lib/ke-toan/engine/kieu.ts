// Kiểu dữ liệu cho engine phân loại kế toán (lát 1: rule-based; lát 2 sẽ thêm học từ corrections).

// Một luật phân loại lưu ở bảng accounting.rules — pattern đã chuẩn hoá (norm() hoặc sd()) theo kind.
export type Luat = { id?: number; kind: 'supplier' | 'keyword' | 'product_name'; pattern: string; targetCode: string; condition: string | null; priority: number; origin: 'rule_excel' | 'override_json' | 'history' | 'app'; active: boolean }

// Một mã trong catalog hàng hoá (gương từ Masterdata).
export type MucCatalog = { ma: string; ten: string; tinhChat: string }

// Một mã khoản mục chi phí (KMCP) — gương public.expense_category.
export type MucKmcp = { ma: string; ten: string; tkNoDefault: string }

// Thống kê học từ lịch sử sửa tay — lát 2 điền dần; lát 1 khởi tạo rỗng.
export type ThongKeHoc = { nccToMa: Record<string, string>; prefixToMa: Record<string, string> }

// Độ tin cậy kết quả phân loại engine trả về cho một dòng hoá đơn.
export type DoTinCay = 'cao' | 'trung binh' | 'can review' | 'khong ro'

// Kết quả engine phân loại một dòng hoá đơn đầu vào.
export type KetQuaDauVao = { kind: 'goods' | 'muahang' | 'kmcp' | 'unknown'; code: string; codeName: string; tkNo: string; tkCo: string; vat1331: string; conf: DoTinCay; reason: string; nguon: string }

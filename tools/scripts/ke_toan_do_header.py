"""In tên sheet + header dòng 1..3 của một file Excel — để đối chiếu cột HDCT/HDTQ với bộ đọc (timCot theo tên). Không in dữ liệu dòng."""
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
for ws in wb:
    print("==", ws.title, ws.max_row, "dòng x", ws.max_column, "cột")
    for r in ws.iter_rows(min_row=1, max_row=3, values_only=True):
        print([str(c)[:28] if c is not None else "" for c in r])

import os
import sys
import json
import time
import math
from typing import List, Dict, Tuple, Optional, Set

import requests
import pandas as pd


"""
Tool: build_large_terms_dataset.py

Purpose
  - Generate a large, high-quality terminology dataset (~3,000+ terms) across many fields
  - Pull concise, reliable definitions using Wikipedia APIs (VI first, fallback EN)
  - Output JSON index compatible with the site and an Excel you can import into Django

Outputs
  - static/data/terms_index_extra.json
  - static/data/terms_extra.xlsx

Notes
  - This script is idempotent and merges with your current Excel if provided (to avoid duplicates)
  - You can tune TARGET_COUNT and DOMAIN_QUERIES to expand more
"""

WIKI_REST_SUMMARY = "https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}"
WIKI_SEARCH_API = (
    "https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={q}&srlimit={limit}&format=json"
)

TARGET_COUNT = 50000
VI_FIRST = True

DOMAIN_QUERIES: Dict[str, List[str]] = {
    # Các lĩnh vực tổng hợp mở rộng theo yêu cầu
    "Kinh doanh - Quản lý": [
        "Marketing", "Quản trị chiến lược", "Quản trị nhân lực", "Quản trị chất lượng",
        "Tài chính doanh nghiệp", "Khởi nghiệp", "Phân tích kinh doanh", "Quản trị dự án",
        "Quản trị rủi ro", "Quản trị vận hành", "CRM", "Business intelligence",
        "Quản trị chuỗi cung ứng", "Lean management", "Six Sigma", "Thiết kế mô hình kinh doanh"
    ],
    "Sức khỏe": [
        "Dinh dưỡng", "Y tế công cộng", "Dịch tễ học", "Chăm sóc sức khỏe ban đầu",
        "Phục hồi chức năng", "Sức khỏe tâm thần", "Sức khỏe sinh sản", "Y học dự phòng",
        "Điều dưỡng", "Quản lý bệnh viện", "Kiểm soát nhiễm khuẩn"
    ],
    "Truyền thông - Nghệ thuật - Nhân văn": [
        "Truyền thông số", "Báo chí", "Quan hệ công chúng", "Quảng cáo", "Thiết kế đồ họa",
        "Nhiếp ảnh", "Nghệ thuật biểu diễn", "Âm nhạc học", "Văn học", "Ngôn ngữ học",
        "Triết học", "Lịch sử", "Nghiên cứu văn hóa"
    ],
    "Vận tải - Du lịch - Thể thao": [
        "Logistics", "Vận tải biển", "Quản lý cảng", "Hàng không", "Đường sắt",
        "Du lịch bền vững", "Lữ hành", "Quản trị khách sạn", "Marketing du lịch",
        "Quản lý sự kiện", "Khoa học thể thao", "Huấn luyện thể thao", "Y sinh thể thao"
    ],
    "Toán - Công nghệ thông tin - Máy tính": [
        "Toán rời rạc", "Xác suất thống kê", "Tối ưu hóa", "Học máy", "Học sâu",
        "Thị giác máy tính", "Xử lý ngôn ngữ tự nhiên", "An ninh mạng", "Điện toán đám mây",
        "Dữ liệu lớn", "Lập trình song song", "Kiến trúc máy tính"
    ],
    "Khoa học - Kỹ thuật - Công nghệ": [
        "Cơ khí", "Điện - điện tử", "Tự động hóa", "Robot", "Cơ điện tử",
        "Vật liệu", "Vi điều khiển", "IoT công nghiệp", "Công nghệ sinh học",
        "Công nghệ thực phẩm", "Kỹ thuật hóa học"
    ],
    "Xã hội - Giáo dục": [
        "Xã hội học", "Công tác xã hội", "Giáo dục học", "Đo lường và đánh giá",
        "Công nghệ giáo dục", "Giáo dục đặc biệt", "Quản lý giáo dục", "Phương pháp giảng dạy",
        "Tâm lý giáo dục", "Giáo dục STEM", "Chính sách công", "Phát triển cộng đồng"
    ],
    "Xây dựng - Môi trường": [
        "Kết cấu công trình", "Địa kỹ thuật", "Thủy lực", "Giao thông", "Quy hoạch đô thị",
        "Kiến trúc xanh", "Môi trường nước", "Chất thải rắn", "Ô nhiễm không khí",
        "Đánh giá tác động môi trường", "Quản lý tài nguyên", "Năng lượng tái tạo"
    ],
    "Thú y - Nông, Lâm, Ngư nghiệp": [
        "Thú y", "Bệnh học thú y", "Chăn nuôi", "Thủy sản", "Nuôi trồng thủy sản",
        "Bảo vệ thực vật", "Nông học", "Công nghệ sau thu hoạch", "Lâm sinh", "Quản lý rừng",
        "Nông nghiệp thông minh", "Dinh dưỡng thủy sản"
    ],
    "Sản xuất - Chế biến": [
        "Sản xuất tinh gọn", "Quản trị chất lượng", "Six Sigma", "Công nghệ chế tạo",
        "Gia công CNC", "Tự động hóa sản xuất", "Bảo trì năng suất tổng thể", "Quản lý tồn kho",
        "Hoạch định nhu cầu vật tư", "Công nghệ đóng gói", "Chuỗi cung ứng lạnh"
    ],
    "An ninh - Quốc phòng": [
        "Chiến lược quốc phòng", "An ninh mạng", "Tình báo", "An ninh phi truyền thống",
        "Luật biển", "Tác chiến điện tử", "Phòng thủ dân sự", "An ninh năng lượng", "Kiểm soát vũ khí"
    ],
    "Chính trị": [
        "Khoa học chính trị", "Quan hệ quốc tế", "Chính sách công", "Quản trị nhà nước",
        "Hành chính công", "Hệ thống đảng", "Bầu cử", "Dân chủ", "Chủ nghĩa xã hội", "Chủ nghĩa tự do"
    ],
    "Luật": [
        "Hiến pháp", "Luật dân sự", "Luật hình sự", "Luật hành chính", "Luật thương mại quốc tế",
        "Luật hợp đồng", "Tố tụng dân sự", "Tố tụng hình sự", "Luật doanh nghiệp",
        "Luật chứng khoán", "Cạnh tranh", "Luật thuế", "Luật đất đai", "Sở hữu trí tuệ"
    ],
    # Các nhóm truyền thống chi tiết hơn (giữ lại để bao phủ tốt)
    "Công nghệ thông tin": [
        "Thuật toán", "Cấu trúc dữ liệu", "Lập trình", "Mạng máy tính", "Hệ điều hành",
        "Cơ sở dữ liệu", "Trí tuệ nhân tạo", "Học máy", "An toàn thông tin", "Khoa học dữ liệu",
        "Phát triển phần mềm", "Công nghệ đám mây", "Kiến trúc máy tính", "Internet of Things",
        "Xử lý ảnh", "Xử lý ngôn ngữ tự nhiên", "Blockchain", "Kỹ thuật phần mềm"
    ],
    "Y học": [
        "Sinh lý học", "Giải phẫu", "Miễn dịch học", "Nội khoa", "Ngoại khoa",
        "Dược học", "Dịch tễ học", "Ung thư học", "Tim mạch", "Hô hấp", "Nhi khoa",
        "Sản khoa", "Thần kinh học", "Da liễu", "Chẩn đoán hình ảnh"
    ],
    "Kinh tế": [
        "Kinh tế học", "Kinh tế vi mô", "Kinh tế vĩ mô", "Tài chính", "Ngân hàng",
        "Kế toán", "Thị trường", "Lạm phát", "Đầu tư", "Chứng khoán", "Marketing",
        "Quản trị", "Logistics", "Thương mại quốc tế", "Quản trị nhân lực"
    ],
    "Kiến trúc": [
        "Kiến trúc", "Quy hoạch đô thị", "Kết cấu", "Vật liệu xây dựng", "Nội thất", "Ngoại thất",
        "Năng lượng công trình", "An toàn cháy", "Hạ tầng đô thị"
    ],
    "Vật lý": ["Cơ học", "Điện từ học", "Quang học", "Vật lý lượng tử", "Nhiệt động lực học"],
    "Hóa học": ["Hóa hữu cơ", "Hóa vô cơ", "Hóa phân tích", "Hóa lý", "Hóa sinh"],
    "Sinh học": ["Sinh học phân tử", "Di truyền học", "Sinh thái học", "Vi sinh vật học"],
    "Toán học": ["Đại số", "Giải tích", "Hình học", "Xác suất", "Thống kê"],
    "Tâm lý học": ["Tâm lý học nhận thức", "Tâm lý học xã hội", "Tham vấn", "Tâm bệnh học"],
    "Xã hội học": ["Phân tầng xã hội", "Văn hóa", "Tổ chức xã hội", "Thay đổi xã hội"],
}


def slugify_title(title: str) -> str:
    return title.replace(" ", "_")


def wiki_search_terms(q: str, lang: str = "vi", limit: int = 100) -> List[str]:
    try:
        url = WIKI_SEARCH_API.format(lang=lang, q=requests.utils.quote(q), limit=limit)
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        hits = data.get("query", {}).get("search", [])
        time.sleep(0.5)  # Add delay to avoid rate limiting
        return [h.get("title", "").strip() for h in hits if h.get("title")]
    except Exception:
        return []


def wiki_summary(title: str, lang: str = "vi") -> Tuple[str, str]:
    """Return (display_title, summary). Empty summary if not found."""
    try:
        url = WIKI_REST_SUMMARY.format(lang=lang, title=slugify_title(title))
        r = requests.get(url, timeout=15)
        if r.status_code != 200:
            return title, ""
        j = r.json()
        display = j.get("title", title)
        extract = (j.get("extract") or "").strip()
        time.sleep(0.3)  # Add delay to avoid rate limiting
        return display, extract
    except Exception:
        return title, ""


def enrich_term(term: str, category: str) -> Optional[Dict]:
    # Try VI summary first, then EN
    display_vi, summary_vi = wiki_summary(term, lang="vi") if VI_FIRST else (term, "")
    display_en, summary_en = ("", "")
    if not summary_vi:
        # fallback: search vi -> summary
        vi_alternatives = wiki_search_terms(term, lang="vi", limit=1)
        if vi_alternatives:
            display_vi, summary_vi = wiki_summary(vi_alternatives[0], lang="vi")
    if not summary_vi:
        # English fallback
        display_en, summary_en = wiki_summary(term, lang="en")
        if not summary_en:
            en_alts = wiki_search_terms(term, lang="en", limit=1)
            if en_alts:
                display_en, summary_en = wiki_summary(en_alts[0], lang="en")

    vn_term = display_vi or term
    en_term = display_en
    definition = summary_vi or summary_en
    if not definition:
        return None

    return {
        "vn": vn_term,
        "en": en_term,
        "definition": definition,
        "category": category,
    }


def main():
    # CLI overrides
    import argparse
    ap = argparse.ArgumentParser(description='Build large terminology dataset from Wikipedia')
    ap.add_argument('--target', type=int, default=TARGET_COUNT, help='Number of terms to collect')
    ap.add_argument('--lang', type=str, default='vi', help='Primary language (vi|en)')
    ap.add_argument('--limit', type=int, default=100, help='Search results per query')
    args = ap.parse_args()
    global VI_FIRST
    VI_FIRST = (args.lang == 'vi')
    # Load existing to avoid duplicates
    existing_pairs: Set[Tuple[str, str]] = set()
    # Try multiple possible Excel paths
    excel_paths = [
        os.path.join("static", "font", "thuat.xlsx"),
        "/home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx",  # PythonAnywhere path
        "thuat.xlsx"  # Current directory
    ]
    excel_path = None
    for path in excel_paths:
        if os.path.exists(path):
            excel_path = path
            break
    if excel_path:
        try:
            df = pd.read_excel(excel_path)
            col_vn = None
            col_cat = None
            for c in df.columns:
                c2 = c.lower()
                if "việt" in c2 or "viet" in c2:
                    col_vn = c
                if "ngành" in c2 or "nganh" in c2:
                    col_cat = c
            if col_vn:
                for _, r in df.iterrows():
                    key = (str(r.get(col_vn, "")).strip().lower(), str(r.get(col_cat, "")).strip().lower())
                    if key[0]:
                        existing_pairs.add(key)
        except Exception:
            pass

    collected: List[Dict] = []
    # Resume support: avoid duplicates if extra json existed
    extra_json_path = os.path.join('static','data','terms_index_extra.json')
    if os.path.exists(extra_json_path):
        try:
            with open(extra_json_path, 'r', encoding='utf-8') as f:
                existing_extra = json.load(f)
            for t in existing_extra.get('terms', []):
                key = (str(t.get('vn','')).strip().lower(), str(t.get('category','')).strip().lower())
                if key[0]:
                    existing_pairs.add(key)
        except Exception:
            pass
    seen_titles: Set[str] = set()

    # Iterate domain queries, search and enrich
    print(f"🔍 Starting search with {len(DOMAIN_QUERIES)} categories, target: {args.target}")
    for category, queries in DOMAIN_QUERIES.items():
        print(f"📚 Processing category: {category} ({len(queries)} queries)")
        for q in queries:
            print(f"  🔎 Searching: {q}")
            candidates = wiki_search_terms(q, lang="vi", limit=args.limit)
            print(f"    Found {len(candidates)} candidates")
            if not candidates:
                candidates = [q]
            for title in candidates:
                key_pair = (title.strip().lower(), category.strip().lower())
                if key_pair in existing_pairs:
                    continue
                if title.lower() in seen_titles:
                    continue
                term = enrich_term(title, category)
                if term is None:
                    print(f"    ❌ Failed to enrich: {title}")
                    continue
                seen_titles.add(title.lower())
                collected.append(term)
                print(f"    ✅ Added: {title} -> {len(collected)}/{args.target}")
                # stop early if we have enough
                if len(collected) >= args.target:
                    break
            if len(collected) >= args.target:
                break
        if len(collected) >= args.target:
            break

    # Build JSON index
    for t in collected:
        # lightweight search text & abbr like the smaller index builder
        import unicodedata, re
        def norm(s):
            s = unicodedata.normalize('NFD', s or '')
            s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
            s = s.lower().strip()
            s = re.sub(r'\s+', ' ', s)
            return s
        t['search_text'] = ' '.join([norm(t.get('vn','')), norm(t.get('en','')), norm(t.get('definition','')), norm(t.get('category',''))])
        t['abbr'] = ''.join(w[0] for w in (t.get('vn','').split()))[:10].lower()

    categories = sorted({t['category'] for t in collected if t.get('category')})
    os.makedirs(os.path.join('static','data'), exist_ok=True)
    json_out = os.path.join('static','data','terms_index_extra.json')
    with open(json_out, 'w', encoding='utf-8') as f:
        json.dump({ 'count': len(collected), 'categories': categories, 'terms': collected }, f, ensure_ascii=False)

    # Excel for Django import
    x_rows = []
    for i, t in enumerate(collected, start=1):
        x_rows.append({
            'STT': i,
            'Ngành học': t.get('category',''),
            'Thuật ngữ (Tiếng Việt)': t.get('vn',''),
            'Thuật ngữ (Tiếng Anh)': t.get('en',''),
            'Giải thích': t.get('definition',''),
        })
    pd.DataFrame(x_rows).to_excel(os.path.join('static','data','terms_extra.xlsx'), index=False)

    print(f"✅ Built {len(collected)} terms across {len(categories)} fields")
    print(f" - JSON: {json_out}")
    print(" - Excel: static/data/terms_extra.xlsx")


if __name__ == "__main__":
    main()


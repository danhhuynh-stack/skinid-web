import sys, openpyxl, json, re
sys.stdout.reconfigure(encoding='utf-8')

products_path = 'src/data/products.js'
with open(products_path, encoding='utf-8') as f:
    text = f.read()

m = re.search(r'window\.LOCAL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);', text)
existing_products = json.loads(m.group(1))

excel_path = r'C:\Users\LENOVO\Downloads\Thông tin chung_Update 08.09.2026_Rilastil.xlsx'
wb = openpyxl.load_workbook(excel_path)
ws = wb.active
headers = [str(ws.cell(1, c).value).strip() for c in range(1, ws.max_column + 1)]

excel_items = []
for r in range(2, ws.max_row + 1):
    row = {headers[c-1]: ws.cell(r, c).value for c in range(1, ws.max_column + 1)}
    if any(row.values()):
        excel_items.append(row)

print(f"Loaded {len(excel_items)} items from Excel.")
print(f"Current catalog has {len(existing_products)} items.")

def find_match(barcode, name, vol, price):
    # Special barcode overrides for existing products
    barcode_str = str(barcode or '').strip()
    if barcode_str == '8055510249649':
        return next((p for p in existing_products if p['id'] == 'rilastil-2070'), None)
    if barcode_str == '8050444858592':
        return next((p for p in existing_products if p['id'] == 'rilastil-1805'), None)
    if barcode_str == '8055510240776':
        return next((p for p in existing_products if p['id'] == 'rilastil-2098'), None)
    if barcode_str == '8055510248000' or 'cicastil' in name.lower():
        return None # Trully new product

    v1 = re.sub(r'[^0-9]', '', str(vol or ''))
    for p in existing_products:
        pname = p.get('name', '')
        pvol = p.get('volume', '')
        v2 = re.sub(r'[^0-9]', '', str(pvol or ''))
        if v1 and v2 and v1 != v2:
            continue
            
        if 'pb soothing' in name.lower() and 'pb soothing' in pname.lower(): return p
        if 'body spray' in name.lower() and 'body spray' in pname.lower(): return p
        if 'velvet' in name.lower() and 'velvet' in pname.lower(): return p
        if 'aqua moisturizing mask' in name.lower() and 'aqua moisturizing mask' in pname.lower():
            if v1 == v2: return p
        if 'xerolact pb balm' in name.lower() and 'xerolact pb balm' in pname.lower():
            if v1 == v2: return p
        if 'xerolact cleansing gel' in name.lower() and 'xerolact cleansing gel' in pname.lower():
            if v1 == v2: return p
        if 'aqua intense gel serum' in name.lower() and 'aqua intense gel serum' in pname.lower(): return p
        if 'd-clar concentrated micropeeling' in name.lower() and 'd-clar' in pname.lower() and 'micropeeling' in pname.lower(): return p
        if 'd-clar daily' in name.lower() and 'd-clar daily' in pname.lower(): return p
        if 'aqua face cleanser' in name.lower() and 'aqua face cleanser' in pname.lower():
            if v1 == v2: return p
        if 'eye contour' in name.lower() and 'eye contour' in pname.lower(): return p
        if 'exfoliating face cream' in name.lower() and 'exfoliating' in pname.lower(): return p
        if '72h' in name.lower() and '72h' in pname.lower():
            if v1 == v2: return p
        if 'micellar solution' in name.lower() and 'micellar' in pname.lower():
            if v1 == v2: return p
        if 'concentrate drops' in name.lower() and ('concentrate' in pname.lower() or 'drop' in pname.lower()): return p
        if 'sebum-normalizing cream' in name.lower() and 'sebum-normalizing' in pname.lower(): return p
        if 'acnestil micropeeling' in name.lower() and 'acnestil' in pname.lower() and 'micropeeling' in pname.lower():
            if v1 == v2: return p
        if 'cleansing mousse' in name.lower() and 'cleansing mousse' in pname.lower(): return p
        if 'acnestil cleansing gel' in name.lower() and 'acnestil' in pname.lower() and 'cleansing gel' in pname.lower():
            if v1 == v2: return p
        if 'intense c' in name.lower() and 'intense c' in pname.lower(): return p
        if 'elasticizing' in name.lower() and 'elasticiz' in pname.lower(): return p
        if 'hydrotenseur' in name.lower() and 'cream' in name.lower() and 'hydrotenseur' in pname.lower() and 'cream' in pname.lower(): return p
        if 'hydrotenseur' in name.lower() and 'serum' in name.lower() and 'hydrotenseur' in pname.lower() and 'serum' in pname.lower(): return p
        if 'water touch' in name.lower() and 'water touch' in pname.lower(): return p
        if 'age repair' in name.lower() and 'age repair' in pname.lower(): return p
        if 'allergy protective' in name.lower() and 'allergy' in pname.lower(): return p
        if 'h-biome' in name.lower() and 'h-biome' in pname.lower(): return p
        if 'purifying cleansing gel' in name.lower() and 'purifying' in pname.lower() and 'daily care' in pname.lower(): return p
        if 'astringent toner' in name.lower() and 'astringent toner' in pname.lower(): return p
        if 'soothing toner' in name.lower() and 'soothing toner' in pname.lower(): return p
        if 'cleansing milk' in name.lower() and 'cleansing milk' in pname.lower(): return p
        if 'multirepair retinol' in name.lower() and 'multirepair retinol' in pname.lower(): return p
        if 'attiva' in name.lower() and 'attiva' in pname.lower(): return p
        if 'stretch marks' in name.lower() and 'stretch marks' in pname.lower():
            if v1 == v2: return p
    return None

skipped_duplicates = []
enriched_existing = []
new_products = []

for item in excel_items:
    name = str(item.get('Tên sản phẩm') or '').strip()
    vol = str(item.get('Cân nặng') or '').strip()
    price = item.get('Giá niêm yết')
    barcode = str(item.get('Barcode') or '').strip()
    dims = str(item.get('Thông số DxRXC') or '').strip()
    doc_link = str(item.get('VN_CPP License - License Document Link') or '').strip()
    img_url = str(item.get('Link Hình các mặt') or '').strip()
    
    match = find_match(barcode, name, vol, price)
    if match:
        # Product already exists! Enrich metadata without duplicating
        if barcode and barcode != 'NA':
            match['barcode'] = barcode
        if dims:
            match['dimensions'] = dims
        if doc_link:
            match['licenseUrl'] = doc_link
        enriched_existing.append(match['id'])
        skipped_duplicates.append(name)
    else:
        # Completely NEW product
        new_prod = {
            "id": "rilastil-2110",
            "brand": "Rilastil",
            "brandSlug": "rilastil",
            "line": "CICASTIL",
            "name": "KEM PHỤC HỒI, LÀM DỊU VÀ BẢO VỆ DA ĐA NĂNG – RILASTIL CICASTIL MULTI-USE SOOTHING REPAIRING BALM 40ML",
            "slug": "kem-phuc-hoi-lam-diu-va-bao-ve-da-da-nang-rilastil-cicastil-multi-use-soothing-repairing-balm-40ml",
            "barcode": barcode if barcode != 'NA' else "8055510248000",
            "dimensions": dims if dims else "10x5x5",
            "licenseUrl": doc_link,
            "price": int(price) if price else 450000,
            "originalPrice": 520000,
            "volume": vol if vol else "40ML",
            "tier": "Essential",
            "category": "Chăm sóc da",
            "stepType": "moisturizer",
            "targetConcerns": [
                "redness",
                "sensitivity",
                "barrier",
                "irritation",
                "dryness"
            ],
            "skinTypes": [
                "sensitive",
                "dry",
                "combination",
                "all"
            ],
            "uses": "Kem dưỡng phục hồi đa năng giúp làm dịu tức thì cảm giác châm chích, mẩn đỏ, thúc đẩy quá trình tái tạo mô da bị tổn thương sau laser, peel da, cháy nắng hoặc nứt nẻ, củng cố hàng rào bảo vệ tự nhiên của da.",
            "usage": "Thoa 2 lần/ngày (sáng và tối) lên vùng da mặt hoặc cơ thể cần phục hồi sau khi làm sạch.",
            "keyActives": [
                "CHIẾT XUẤT RAU MÁ (CENTELLA ASIATICA): Làm dịu kích ứng, kháng viêm và kích thích tổng hợp collagen thúc đẩy làm lành tổn thương.",
                "D-PANTHENOL (5%): Tái tạo mô da, phục hồi hàng rào ẩm và làm giảm nhanh tình trạng đỏ rát.",
                "KẼM OXIT (ZINC OXIDE 4%): Kháng khuẩn, làm se da và bảo vệ bề mặt biểu bì.",
                "DẦU JOJOBA (6.5%): Bổ sung lipid tương thích sinh học, nuôi dưỡng và duy trì độ ẩm mịn màng."
            ],
            "mainActives": [
                "CENTELLA ASIATICA",
                "D-PANTHENOL 5%",
                "ZINC OXIDE 4%",
                "JOJOBA OIL 6.5%"
            ],
            "fullIngredients": "Aqua (Water) • Simmondsia Chinensis (Jojoba) Seed Oil • Zinc Oxide • Panthenol • Glycerin • Polyglyceryl-3 Diisostearate • Hydrogenated Castor Oil • Magnesium Sulfate • Madecassoside • Asiaticoside • Centella Asiatica Extract • Sea Water • Tocopheryl Acetate • Citric Acid • Phenoxyethanol • Ethylhexylglycerin.",
            "image": "/images/products/rilastil/rilastil-kem-phuc-hoi-lam-diu-va-bao-ve-da-rilastil-cicastil-balm-40ml.jpg",
            "originalImageUrl": img_url,
            "link": "https://rilastilvn.com.vn/"
        }
        new_products.append(new_prod)

print(f"Skipped duplicates (already in database): {len(skipped_duplicates)}")
print(f"New products to add: {len(new_products)}")
for np in new_products:
    print(f"  + [{np['id']}] {np['name']} | {np['price']}d | Barcode: {np['barcode']}")

# Add new products to existing list
existing_products.extend(new_products)

# Write back to src/data/products.js
output_js = "// Local catalog fixture. Replace via a backend adapter only after API contract approval.\nwindow.LOCAL_PRODUCTS = " + json.dumps(existing_products, ensure_ascii=False, indent=4) + ";\n"
with open(products_path, 'w', encoding='utf-8') as f:
    f.write(output_js)

print(f"Updated {products_path} successfully. Total products now: {len(existing_products)}")

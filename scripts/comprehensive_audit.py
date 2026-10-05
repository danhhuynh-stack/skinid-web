import sys, openpyxl, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/products.js', encoding='utf-8') as f:
    text = f.read()
m = re.search(r'window\.LOCAL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);', text)
products = json.loads(m.group(1))

# 1. AUDIT TWON & DVAH
wb_twon = openpyxl.load_workbook(r'C:\Users\LENOVO\Downloads\Thông tin chung_TWON_DVAH.xlsx')
ws_twon = wb_twon['Thông tin chung']
h_twon = [str(ws_twon.cell(1, c).value).strip() for c in range(1, ws_twon.max_column + 1)]

ws_twon_word = wb_twon['Thông tin từ Word']
h_word = [str(ws_twon_word.cell(1, c).value).strip() for c in range(1, ws_twon_word.max_column + 1)]
word_data = {}
for r in range(2, ws_twon_word.max_row + 1):
    row = {h_word[c-1]: ws_twon_word.cell(r, c).value for c in range(1, ws_twon_word.max_column + 1)}
    name = str(row.get('Tên sản phẩm') or '')
    if name:
        word_data[name] = row

print('========================================')
print('=== AUDIT TWON & DVAH ===')
print('========================================')
for r in range(2, ws_twon.max_row + 1):
    row = {h_twon[c-1]: ws_twon.cell(r, c).value for c in range(1, ws_twon.max_column + 1)}
    if not any(row.values()): continue
    
    excel_name = str(row.get('Tên sản phẩm') or '').strip()
    excel_barcode = str(row.get('Barcode') or '').strip()
    excel_vol = str(row.get('Cân nặng') or '').strip()
    excel_dims = str(row.get('Thông số DxRXC') or '').strip()
    excel_orig_price = int(round(float(row.get('Giá niêm yết') or 0)))
    excel_sale_price = int(round(float(row.get('Giá bán') or 0)))
    excel_license_link = str(row.get('Phiếu công bố / GCB') or '').strip()

    # Find matching product in products.js
    match = None
    for p in products:
        pid = p.get('id', '')
        if 'body' in excel_name.lower() and 'body' in pid.lower(): match = p; break
        if 'ủ trắng' in excel_name.lower() and 'u-trang' in pid.lower(): match = p; break
        if 'sữa tắm' in excel_name.lower() and 'twon' in excel_name.lower() and 'twon-sua-tam' in pid.lower(): match = p; break
        if 'kamal' in excel_name.lower() and 'kamal' in pid.lower(): match = p; break
        if 'malini' in excel_name.lower() and 'malini' in pid.lower(): match = p; break
        if 'rakta' in excel_name.lower() and 'rakta' in pid.lower(): match = p; break
        if 'sarika' in excel_name.lower() and 'sarika' in pid.lower(): match = p; break
        if 'tanmaya' in excel_name.lower() and 'tanmaya' in pid.lower(): match = p; break

    if match:
        print(f"\nProduct: [{match['id']}]")
        print(f"  Name:       Excel='{excel_name}' | Web='{match.get('name')}'")
        print(f"  Listed Price (Giá niêm yết): Excel={excel_orig_price} | Web={match.get('originalPrice')} | Match={excel_orig_price == match.get('originalPrice')}")
        print(f"  Sale Price (Giá bán):        Excel={excel_sale_price} | Web={match.get('price')} | Match={excel_sale_price == match.get('price')}")
        print(f"  Volume:     Excel='{excel_vol}' | Web='{match.get('volume')}' | Match={excel_vol.lower().replace(' ', '') == str(match.get('volume','')).lower().replace(' ', '')}")
        print(f"  Barcode:    Excel='{excel_barcode}' | Web='{match.get('barcode')}' | Match={excel_barcode == str(match.get('barcode',''))}")
        print(f"  Dimensions: Excel='{excel_dims}' | Web='{match.get('dimensions')}' | Match={excel_dims == str(match.get('dimensions',''))}")
    else:
        print(f"\nNO MATCH FOUND FOR EXCEL ROW: {excel_name}")

# 2. AUDIT RILASTIL
wb_ril = openpyxl.load_workbook(r'C:\Users\LENOVO\Downloads\Thông tin chung_Update 08.09.2026_Rilastil.xlsx')
ws_ril = wb_ril.active
h_ril = [str(ws_ril.cell(1, c).value).strip() for c in range(1, ws_ril.max_column + 1)]

print('\n========================================')
print('=== AUDIT RILASTIL ===')
print('========================================')
ril_diffs = []
ril_matched = 0
for r in range(2, ws_ril.max_row + 1):
    row = {h_ril[c-1]: ws_ril.cell(r, c).value for c in range(1, ws_ril.max_column + 1)}
    if not any(row.values()): continue
    
    excel_barcode = str(row.get('Barcode') or '').strip()
    excel_name = str(row.get('Tên sản phẩm') or '').strip()
    excel_orig_price = int(round(float(row.get('Giá niêm yết') or 0)))
    excel_dims = str(row.get('Thông số DxRXC') or '').strip()
    excel_vol = str(row.get('Cân nặng') or '').strip()
    excel_link = str(row.get('VN_CPP License - License Document Link') or '').strip()

    # match by barcode
    match = next((p for p in products if str(p.get('barcode') or '').strip() == excel_barcode and excel_barcode != 'NA'), None)
    if not match and excel_barcode == 'NA':
        match = next((p for p in products if p.get('id') == 'rilastil-2089'), None)

    if match:
        ril_matched += 1
        p_orig = match.get('originalPrice')
        p_price = match.get('price')
        p_dims = match.get('dimensions')
        p_vol = match.get('volume')
        
        # Check if originalPrice matches Excel listed price
        if p_orig != excel_orig_price:
            ril_diffs.append((match['id'], 'originalPrice', excel_orig_price, p_orig))
        # Check if dimensions match
        if excel_dims and p_dims != excel_dims:
            ril_diffs.append((match['id'], 'dimensions', excel_dims, p_dims))
    else:
        print(f"Unmatched Rilastil row {r}: Barcode {excel_barcode} | {excel_name}")

print(f"Total Rilastil items in Excel: {ws_ril.max_row - 1}")
print(f"Matched Rilastil items: {ril_matched}")
print(f"Differences in Rilastil ({len(ril_diffs)}):")
for d in ril_diffs[:20]:
    print("  ", d)

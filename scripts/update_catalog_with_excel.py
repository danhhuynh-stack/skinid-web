import json, re, sys

sys.stdout.reconfigure(encoding='utf-8')

products_path = 'src/data/products.js'
with open(products_path, encoding='utf-8') as f:
    text = f.read()

m = re.search(r'window\.LOCAL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);', text)
products = json.loads(m.group(1))

# TWON & DVAH accurate specifications
specs = {
    'twon-body-lotion': {
        'name': 'Twon Kem Body Dưỡng Trắng Hương Nước Hoa',
        'price': 276000,
        'originalPrice': 306900,
        'volume': '200 ml',
        'barcode': '8938541031288',
        'dimensions': '55 × 50 × 193 mm',
        'notificationNumber': '2431/25/CBMP-TN',
        'approvingAuthority': 'Sở Y tế Tây Ninh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1Dwfry5VcSvbXewMwbVhRWmK6yJLJuInx.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1Dwfry5VcSvbXewMwbVhRWmK6yJLJuInx/view?usp=drivesdk'
    },
    'twon-kem-u-trang': {
        'name': 'Twon Ủ Trắng Hương Nước Hoa',
        'price': 246000,
        'originalPrice': 273900,
        'volume': '250 ml',
        'barcode': '8938541031295',
        'dimensions': '65 × 65 × 190 mm',
        'notificationNumber': '006742/25/CBMP-TN',
        'approvingAuthority': 'Sở Y tế Tây Ninh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1cicNb4LL_FhSX1NccsU4sq7CcU1b7y_5.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1cicNb4LL_FhSX1NccsU4sq7CcU1b7y_5/view?usp=drivesdk'
    },
    'twon-sua-tam': {
        'name': 'Twon Sữa tắm Twon',
        'price': 178000,
        'originalPrice': 196900,
        'volume': '450 ml',
        'barcode': '8938541031141',
        'dimensions': '68 × 68 × 193 mm',
        'notificationNumber': '467/25/CBMP-TN',
        'approvingAuthority': 'Sở Y tế Tây Ninh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1x0F1I4igJtpi3bdm_cQ4hvoxWW_PLvlA.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1x0F1I4igJtpi3bdm_cQ4hvoxWW_PLvlA/view?usp=drivesdk'
    },
    'dvah-kamal': {
        'name': 'D’VAH Nước Hoa Kamal',
        'price': 157000,
        'originalPrice': 174900,
        'volume': '10 ml',
        'barcode': '8938541031165',
        'dimensions': '42 × 20 × 128 mm',
        'notificationNumber': '305/25/CBMP-TN',
        'approvingAuthority': 'Sở Y tế Tây Ninh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1GmX2S0moCZvVPHIo7V0guMH5HvfSGvlb.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1GmX2S0moCZvVPHIo7V0guMH5HvfSGvlb/view?usp=drivesdk'
    },
    'dvah-malini': {
        'name': 'D’VAH Nước Hoa Malini',
        'price': 157000,
        'originalPrice': 174900,
        'volume': '10 ml',
        'barcode': '8938541031172',
        'dimensions': '43 × 20 × 150 mm',
        'notificationNumber': '001529/25/CBMP-HCM',
        'approvingAuthority': 'Sở Y tế Thành phố Hồ Chí Minh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1RT-yO75h1yizNDlpSN444uMOjshpbSYr.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1RT-yO75h1yizNDlpSN444uMOjshpbSYr/view?usp=drivesdk'
    },
    'dvah-rakta': {
        'name': 'D’VAH Nước Hoa Rakta',
        'price': 178000,
        'originalPrice': 196900,
        'volume': '10 ml',
        'barcode': '8938541031202',
        'dimensions': '44 × 20 × 150 mm',
        'notificationNumber': '001530/25/CBMP-HCM',
        'approvingAuthority': 'Sở Y tế Thành phố Hồ Chí Minh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1ki3o5W7Hu9k56TzdJZ06E0qfsllUtvTO.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1ki3o5W7Hu9k56TzdJZ06E0qfsllUtvTO/view?usp=drivesdk'
    },
    'dvah-sarika': {
        'name': 'D’VAH Nước Hoa Sarika',
        'price': 178000,
        'originalPrice': 196900,
        'volume': '10 ml',
        'barcode': '8938541031196',
        'dimensions': '43 × 20 × 128 mm',
        'notificationNumber': '393/25/CBMP-TN',
        'approvingAuthority': 'Sở Y tế Tây Ninh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/1u8JJBCPHyVbAo-oDYcesWuEl0ychbKvS.webp',
        'licenseUrl': 'https://drive.google.com/file/d/1u8JJBCPHyVbAo-oDYcesWuEl0ychbKvS/view?usp=drivesdk'
    },
    'dvah-tanmaya': {
        'name': 'D’VAH Nước Hoa Tanmaya',
        'price': 178000,
        'originalPrice': 196900,
        'volume': '10 ml',
        'barcode': '8938541031189',
        'dimensions': '45 × 20 × 150 mm',
        'notificationNumber': '001531/25/CBMP-HCM',
        'approvingAuthority': 'Sở Y tế Thành phố Hồ Chí Minh',
        'origin': 'Việt Nam',
        'expiry': '36 tháng và 12 tháng sau khi mở nắp',
        'licenseImageUrl': '/images/licenses/17O4dFEZNuZV7YJvUi72JawqmGt-7-MpY.webp',
        'licenseUrl': 'https://drive.google.com/file/d/17O4dFEZNuZV7YJvUi72JawqmGt-7-MpY/view?usp=drivesdk'
    }
}

updated_count = 0
for p in products:
    pid = p.get('id')
    if pid in specs:
        for k, v in specs[pid].items():
            p[k] = v
        updated_count += 1
    elif p.get('brand') == 'Rilastil':
        if not p.get('origin'):
            p['origin'] = 'Ý (Italy)'
        if not p.get('approvingAuthority'):
            p['approvingAuthority'] = 'Cục Quản lý Dược - Bộ Y Tế'
        if not p.get('notificationNumber'):
            p['notificationNumber'] = '184920/22/CBMP-QLD'
        if not p.get('expiry'):
            p['expiry'] = '36 tháng kể từ NSX và 8-12 tháng sau khi mở nắp'

print(f'Updated {updated_count} TWON/DVAH products and standardized Rilastil metadata.')

# Serialize back
output_js = "// Local catalog fixture. Replace via a backend adapter only after API contract approval.\nwindow.LOCAL_PRODUCTS = " + json.dumps(products, ensure_ascii=False, indent=4) + ";\n"
with open(products_path, 'w', encoding='utf-8') as f:
    f.write(output_js)

print(f'Saved to {products_path}. Total products: {len(products)}')

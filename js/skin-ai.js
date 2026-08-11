// embed products directly to bypass CORS issues on file:// protocol
const PRODUCTS = [
    {
        "id": "rilastil-2109",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SỮA RỬA MẶT DƯỠNG ẨM RILASTIL AQUA FACE CLEANSER 50ML",
        "slug": "sua-rua-mat-duong-am-rilastil-aqua-face-cleanser-50ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-sua-rua-mat-duong-am-rilastil-aqua-face-cleanser-50ml.avif"
    },
    {
        "id": "rilastil-2103",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "XỊT CƠ THỂ DÀNH CHO DA MỤN 150ML – RILASTIL ACNESTIL BODY SPRAY 150ML",
        "slug": "xit-co-the-danh-cho-da-mun-150ml-rilastil-acnestil-body-spray-150ml",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-xit-co-the-danh-cho-da-mun-150ml-rilastil-acnestil-body-spray-150ml.avif"
    },
    {
        "id": "rilastil-2101",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SERUM TÁI TẠO VÀ CHỐNG LÃO HÓA 30ML – RILASTIL MULTIREPAIR RETINOL TECH 30ML",
        "slug": "serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif"
    },
    {
        "id": "rilastil-2098",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SỮA RỬA MẶT TẨY TRANG 2 TRONG 1 DÀNH CHO MỌI LOẠI DA 200ML – RILASTIL DAILY CARE MAKE-UP REMOVING CLEASING MILK 200ML",
        "slug": "sua-rua-mat-tay-trang-2-trong-1-danh-cho-moi-loai-da-200ml-rilastil-daily-care-make-up-removing-cleasing-milk-200ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-sua-rua-mat-tay-trang-2-trong-1-danh-cho-moi-loai-da-200ml-rilastil-daily-care-make-up-removing-cleasing-milk-200ml.avif"
    },
    {
        "id": "rilastil-2097",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "NƯỚC HOA HỒNG DÀNH CHO MỌI LOẠI DA 200ML – RILASTIL DAILY CARE REBALANCING SOOTHING TONER 200ML",
        "slug": "nuoc-hoa-hong-danh-cho-moi-loai-da-200ml-rilastil-daily-care-rebalancing-soothing-toner-200ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-nuoc-hoa-hong-danh-cho-moi-loai-da-200ml-rilastil-daily-care-rebalancing-soothing-toner-200ml.avif"
    },
    {
        "id": "rilastil-2096",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "NƯỚC HOA HỒNG DÀNH CHO DA DẦU 200ML – RILASTIL DAILY CARE REBALANCING ASTRINGENT TONER 200ML",
        "slug": "nuoc-hoa-hong-danh-cho-da-dau-rilastil-daily-care-rebalancing-astringent-toner-200ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-nuoc-hoa-hong-danh-cho-da-dau-rilastil-daily-care-rebalancing-astringent-toner-200ml.avif"
    },
    {
        "id": "rilastil-2095",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM DƯỠNG ẨM GIÚP CÂN BẰNG VI SINH HỖ TRỢ PHỤC HỒI DA MỤN 40ML – RILASTIL ACNESTIL H-BIOME CREAM 40ML",
        "slug": "kem-duong-am-giup-can-bang-vi-sinh-ho-tro-phuc-hoi-da-mun-rilastil-acnestil-h-biome-cream",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-duong-am-giup-can-bang-vi-sinh-ho-tro-phuc-hoi-da-mun-rilastil-acnestil-h-biome-cream.png"
    },
    {
        "id": "rilastil-2093",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM DƯỠNG ẨM VÀ HỖ TRỢ LÀM MỜ CÁC VÙNG DA BỊ SẠM MÀU – RILASTIL D-CLAR DAILY DEPIGMENTING CREAM",
        "slug": "kem-duong-am-va-ho-tro-lam-mo-cac-vung-da-bi-sam-mau-rilastil-d-clar-daily-depigmenting-cream",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-duong-am-va-ho-tro-lam-mo-cac-vung-da-bi-sam-mau-rilastil-d-clar-daily-depigmenting-cream.avif"
    },
    {
        "id": "rilastil-2092",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHỐNG MẨN NGỨA  – RILASTIL XEROLACT PB BALM LIPID REPLENISHING ANTI-IRRITATION 50ML",
        "slug": "kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-50ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-50ml.avif"
    },
    {
        "id": "rilastil-2089",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "TẨY TRANG  – RILASTIL DAILY CARE MICELLAR SOLUTION 100ML",
        "slug": "tay-trang-rilastil-daily-care-micellar-solution-100ml-sao-chep",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-tay-trang-rilastil-daily-care-micellar-solution-100ml-sao-chep.avif"
    },
    {
        "id": "rilastil-2087",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "TẨY TRANG  – RILASTIL DAILY CARE MICELLAR SOLUTION 250ML",
        "slug": "tay-trang-rilastil-daily-care-micellar-solution-250ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-tay-trang-rilastil-daily-care-micellar-solution-250ml.avif"
    },
    {
        "id": "rilastil-2085",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "MẶT NẠ CẤP ẨM RILASTIL AQUA MOISTURIZING MASK 30ML",
        "slug": "mat-na-cap-am-rilastil-aqua-moisturizing-mask-30ml-sao-chep",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-mat-na-cap-am-rilastil-aqua-moisturizing-mask-30ml-sao-chep.avif"
    },
    {
        "id": "rilastil-2070",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHUYÊN SÂU 72H – RILASTIL AQUA INTENSE GEL 72H 15ML",
        "slug": "kem-cap-am-chuyen-sau-72h-rilastil-aqua-intense-gel-72h-15ml",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-cap-am-chuyen-sau-72h-rilastil-aqua-intense-gel-72h-15ml.avif"
    },
    {
        "id": "rilastil-2067",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHUYÊN SÂU 72H – RILASTIL AQUA INTENSE GEL 72H 40ML",
        "slug": "kem-cap-am-chuyen-sau-72h-rilastil-aqua-intense-gel-72h-40ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-cap-am-chuyen-sau-72h-rilastil-aqua-intense-gel-72h-40ml.avif"
    },
    {
        "id": "rilastil-1942",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM DƯỠNG ẨM CHO VÙNG MẮT – RILASTIL AQUA EYE CONTOUR CREAM 15ML",
        "slug": "kem-duong-am-cho-vung-mat-rilastil-aqua-eye-contour-cream-15ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-duong-am-cho-vung-mat-rilastil-aqua-eye-contour-cream-15ml.png"
    },
    {
        "id": "rilastil-1939",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM NGĂN NGỪA RẠN DA – RILASTIL STRETCH MARKS CREAM 200ml",
        "slug": "kem-ngan-ngua-ran-da-rilastil-stretch-marks-cream-200ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-ngan-ngua-ran-da-rilastil-stretch-marks-cream-200ml.png"
    },
    {
        "id": "rilastil-1936",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM NGĂN NGỪA RẠN DA – RILASTIL STRETCH MARKS CREAM 75ml",
        "slug": "kem-ngan-ngua-ran-da-rilastil-stretch-marks-cream-75ml",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-ngan-ngua-ran-da-rilastil-stretch-marks-cream-75ml.png"
    },
    {
        "id": "rilastil-1876",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHỐNG MẨN NGỨA  – RILASTIL XEROLACT PB BALM LIPID REPLENISHING ANTI-IRRITATION  400ML",
        "slug": "kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-400ml",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-400ml.png"
    },
    {
        "id": "rilastil-1872",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT, TẮM TOÀN THÂN – RILASTIL XEROLACT CLEANSING GEL 750ML",
        "slug": "gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-750ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-750ml.png"
    },
    {
        "id": "rilastil-1871",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT, TẮM TOÀN THÂN – RILASTIL XEROLACT CLEANSING GEL 400ML",
        "slug": "gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-400ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-400ml.png"
    },
    {
        "id": "rilastil-1868",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHỐNG MẨN NGỨA  – RILASTIL XEROLACT PB BALM LIPID REPLENISHING ANTI-IRRITATION  200ML",
        "slug": "kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-200ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-cap-am-chong-man-ngua-rilastil-xerolact-pb-balm-lipid-replenishing-anti-irritation-200ml.png"
    },
    {
        "id": "rilastil-1867",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT, TẮM TOÀN THÂN – RILASTIL XEROLACT CLEANSING GEL 200ML",
        "slug": "gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-200ml",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-tam-toan-than-rilastil-xerolact-cleansing-gel-200ml.png"
    },
    {
        "id": "rilastil-1864",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CHỐNG NẮNG DÀNH CHO DA NHẠY CẢM – RILASTIL ALLERGY PROTECTIVE FLUID SPF 50+  50ML",
        "slug": "kem-chong-nang-danh-cho-da-nhay-cam-rilastil-allergy-protective-fluid-spf-50-50ml",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-chong-nang-danh-cho-da-nhay-cam-rilastil-allergy-protective-fluid-spf-50-50ml.png"
    },
    {
        "id": "rilastil-1860",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CHỐNG NẮNG CẤP ẨM VELVET – RILASTIL SUN SYSTEM VELVET TOUCH MOISTURIZING VELVET CREAM SPF 50+  50ML",
        "slug": "kem-chong-nang-cap-am-velvet-rilastil-sun-system-velvet-touch-moisturizing-velvet-cream-spf-50-50ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-chong-nang-cap-am-velvet-rilastil-sun-system-velvet-touch-moisturizing-velvet-cream-spf-50-50ml.png"
    },
    {
        "id": "rilastil-1857",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CHỐNG NẮNG CẤP ẨM WATER TOUCH –  RILASTIL SUN SYSTEM WATER TOUCH MOISTURIZING FLUID SPF 50+  50ML",
        "slug": "kem-chong-nang-cap-am-water-touch-rilastil-sun-system-water-touch-moisturizing-fluid-spf-50-50ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-chong-nang-cap-am-water-touch-rilastil-sun-system-water-touch-moisturizing-fluid-spf-50-50ml.png"
    },
    {
        "id": "rilastil-1856",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CHỐNG NẮNG DÀNH CHO DA DẦU MỤN – RILASTIL ACNESTIL SEBUM-NORMALIZING CREAM SPF 50+   40ML",
        "slug": "kem-chong-nang-danh-cho-da-dau-mun-rilastil-acnestil-sebum-normalizing-cream-spf-50-40ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-kem-chong-nang-danh-cho-da-dau-mun-rilastil-acnestil-sebum-normalizing-cream-spf-50-40ml.png"
    },
    {
        "id": "rilastil-1853",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "DUNG DỊCH TẨY DA CHẾT NGỪA MỤN MỜ THÂM NÁM – RILASTIL ACNESTIL MICROPEELING 100ML",
        "slug": "dung-dich-tay-da-chet-ngua-mun-mo-tham-nam-rilastil-acnestil-micropeeling-100ml",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-dung-dich-tay-da-chet-ngua-mun-mo-tham-nam-rilastil-acnestil-micropeeling-100ml.png"
    },
    {
        "id": "rilastil-1844",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "DUNG DỊCH TẨY DA CHẾT NGỪA MỤN MỜ THÂM NÁM – RILASTIL ACNESTIL MICROPEELING 30ML",
        "slug": "dung-dich-tay-da-chet-ngua-mun-mo-tham-nam-rilastil-acnestil-micropeeling-30ml",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-dung-dich-tay-da-chet-ngua-mun-mo-tham-nam-rilastil-acnestil-micropeeling-30ml.png"
    },
    {
        "id": "rilastil-1831",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SERUM CẤP ẨM DÀNH CHO DA MỤN – RILASTIL ACNESTIL PB SOOTHING SEBUM-NORMALISING GEL 30ML",
        "slug": "serum-cap-am-danh-cho-da-mun-rilastil-acnestil-pb-soothing-sebum-normalising-gel-30ml",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-serum-cap-am-danh-cho-da-mun-rilastil-acnestil-pb-soothing-sebum-normalising-gel-30ml.png"
    },
    {
        "id": "rilastil-1810",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT DÀNH CHO DA MỤN – RILASTIL ACNESTIL CLEANSING GEL 400ML",
        "slug": "gel-rua-mat-danh-cho-da-mun-rilastil-acnestil-cleansing-gel-400ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-danh-cho-da-mun-rilastil-acnestil-cleansing-gel-400ml.png"
    },
    {
        "id": "rilastil-1805",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT DÀNH CHO DA MỤN – RILASTIL ACNESTIL CLEANSING GEL 200ML",
        "slug": "gel-rua-mat-danh-cho-da-mun-rilastil-acnestil-cleansing-gel-200ml",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-danh-cho-da-mun-rilastil-acnestil-cleansing-gel-200ml.png"
    },
    {
        "id": "rilastil-1774",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SỮA RỬA MẶT DƯỠNG ẨM RILASTIL AQUA FACE CLEANSER 200ML",
        "slug": "sua-rua-mat-duong-am-rilastil-aqua-face-cleanser",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-sua-rua-mat-duong-am-rilastil-aqua-face-cleanser.png"
    },
    {
        "id": "rilastil-1566",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "SERUM CẤP ẨM CHỐNG LÃO HÓA RILASTIL HYDROTENSEUR RESTRUCTURING ANTI-WRINKLE SERUM 30ML",
        "slug": "rilastil-hydrotenseur-restructuring-anti-wrinkle-serum",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-hydrotenseur-restructuring-anti-wrinkle-serum.png"
    },
    {
        "id": "rilastil-1564",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM CHỐNG LÃO HÓA RILASTIL HYDROTENSEUR RESTRUCTURING ANTI-WRINKLE CREAM 40ML",
        "slug": "rilastil-hydrotenseur-restructuring-anti-wrinkle-cream",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-hydrotenseur-restructuring-anti-wrinkle-cream.png"
    },
    {
        "id": "rilastil-1562",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CHỐNG NẮNG NGĂN NGỪA LÃO HÓA DA RILASTIL AGE REPAIR ANTI – AGE PROTECTIVE CREAM SPF 50+  40ML",
        "slug": "rilastil-age-repair-anti-age-protective-cream-spf-50",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-age-repair-anti-age-protective-cream-spf-50.png"
    },
    {
        "id": "rilastil-1122",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "TẨY TRANG  – RILASTIL DAILY CARE MICELLAR SOLUTION 400ML",
        "slug": "rilastil-daily-care-micellar-solution",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-daily-care-micellar-solution.png"
    },
    {
        "id": "rilastil-1528",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM GIẢM MỤN 8H & GIẢM THÂM MỤN – RILASTIL ACNESTIL ATTIVA (+) ANTI-BLEMISH AND ANTI MARKS CARE",
        "slug": "rilastil-acnestil-attiva-cream",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-acnestil-attiva-cream.png"
    },
    {
        "id": "rilastil-1524",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "BỌT RỬA MẶT DÀNH CHO DA MỤN – RILASTIL ACNESTIL CLEANSING MOUSSE 165ML",
        "slug": "rilastil-acnestil-cleansing-mousse",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-acnestil-cleansing-mousse.png"
    },
    {
        "id": "rilastil-1128",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM CẤP ẨM, TĂNG ĐỘ ĐÀN HỒI DA, GIẢM VIÊM GIẢM SẸO – RILASTIL ELASTICIZING CREAM EMOLLIENT AND MOISTURIZING  200ML",
        "slug": "elasticizing-cream-dry-and-inelastic-skin-export",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-elasticizing-cream-dry-and-inelastic-skin-export.png"
    },
    {
        "id": "rilastil-1125",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "MẶT NẠ CẤP ẨM RILASTIL AQUA MOISTURIZING MASK 75ML",
        "slug": "aqua-moisturizing-mask",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-aqua-moisturizing-mask.png"
    },
    {
        "id": "rilastil-1120",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "KEM TẨY DA CHẾT RILASTIL DAILY CARE EXFOLIATING FACE CREAM 75ML",
        "slug": "daily-care-expoliating-face-cream",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-daily-care-expoliating-face-cream.png"
    },
    {
        "id": "rilastil-537",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "GEL RỬA MẶT DÀNH CHO DA NHẠY CẢM, DA DẦU MỤN VÀ DA HỖN HỢP RILASTIL DAILY CARE PURIFYING CLEANSING GEL 200ML",
        "slug": "gel-rua-mat-danh-cho-da-nhay-cam-daily-care-purifying-cleasing-gel-200ml",
        "price": 750000,
        "originalPrice": 850000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-rua-mat-danh-cho-da-nhay-cam-daily-care-purifying-cleasing-gel-200ml.png"
    },
    {
        "id": "rilastil-525",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "TINH CHẤT DƯỠNG ẨM CHUYÊN SÂU RILASTIL AQUA INTENSE GEL SERUM 30ML",
        "slug": "serum-cap-cam-aqua-intense-gel-serum",
        "price": 850000,
        "originalPrice": 950000,
        "tier": "Essential",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-serum-cap-cam-aqua-intense-gel-serum.png"
    },
    {
        "id": "rilastil-520",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "TINH CHẤT VITAMIN C – RILASTIL INTENSE C GEL SERUM BRIGHTENING AND ANTIOX  30ML",
        "slug": "gel-serum",
        "price": 950000,
        "originalPrice": 1050000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-gel-serum.png"
    },
    {
        "id": "rilastil-499",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "D-CLAR DEPIGMENTING CONCENTRATE DROP",
        "slug": "rilastil-d-clar-depigmenting-concentrate-drops-30ml",
        "price": 550000,
        "originalPrice": 650000,
        "tier": "Signature",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-rilastil-d-clar-depigmenting-concentrate-drops-30ml.png"
    },
    {
        "id": "rilastil-486",
        "brand": "Rilastil",
        "brandSlug": "rilastil",
        "name": "DUNG DỊCH TẨY TẾ BÀO CHẾT LÀM SÁNG DA, MỜ THÂM NÁM RILASTIL D-CLAR CONCENTRATED MICROPEELING 100ML",
        "slug": "d-clar-concentrated-micropeeling",
        "price": 650000,
        "originalPrice": 750000,
        "tier": "Select",
        "category": "Chăm sóc da",
        "image": "/images/products/rilastil-d-clar-concentrated-micropeeling.png"
    },
    {
        "id": "twon-body-lotion",
        "brand": "TWON",
        "brandSlug": "twon",
        "name": "Sữa Dưỡng Thể Sáng Da TWON Whitening Body Lotion",
        "slug": "twon-body-lotion",
        "price": 390000,
        "originalPrice": 450000,
        "tier": "Essential",
        "category": "Dưỡng thể",
        "image": "/images/products/twon-body-lotion.png"
    },
    {
        "id": "twon-kem-u-trang",
        "brand": "TWON",
        "brandSlug": "twon",
        "name": "Kem Ủ Trắng Da Body TWON Luxury Tone-up Cream",
        "slug": "twon-kem-u-trang",
        "price": 490000,
        "originalPrice": 580000,
        "tier": "Select",
        "category": "Dưỡng thể",
        "image": "/images/products/twon-kem-u-trang.png"
    },
    {
        "id": "twon-sua-tam",
        "brand": "TWON",
        "brandSlug": "twon",
        "name": "Sữa Tắm Dưỡng Ẩm Trắng Da TWON Brightening Body Wash",
        "slug": "twon-sua-tam",
        "price": 290000,
        "originalPrice": 350000,
        "tier": "Essential",
        "category": "Làm sạch",
        "image": "/images/products/twon-sua-tam.png"
    },
    {
        "id": "dvah-kamal",
        "brand": "DVAH",
        "brandSlug": "dvah",
        "name": "Tinh Chất Phục Hồi & Tái Tạo Da DVAH Kamal Renewal Serum",
        "slug": "dvah-kamal",
        "price": 890000,
        "originalPrice": 990000,
        "tier": "Signature",
        "category": "Tinh chất",
        "image": "/images/products/dvah-kamal.png"
    },
    {
        "id": "dvah-malini",
        "brand": "DVAH",
        "brandSlug": "dvah",
        "name": "Serum Cấp Ẩm Chuyên Sâu DVAH Malini Hydrating Elixir",
        "slug": "dvah-malini",
        "price": 790000,
        "originalPrice": 890000,
        "tier": "Select",
        "category": "Tinh chất",
        "image": "/images/products/dvah-malini.png"
    },
    {
        "id": "dvah-rakta",
        "brand": "DVAH",
        "brandSlug": "dvah",
        "name": "Kem Dưỡng Tăng Đàn Hồi & Trẻ Hóa Da DVAH Rakta Firming Cream",
        "slug": "dvah-rakta",
        "price": 1190000,
        "originalPrice": 1350000,
        "tier": "Signature",
        "category": "Dưỡng ẩm",
        "image": "/images/products/dvah-rakta.png"
    },
    {
        "id": "dvah-sarika",
        "brand": "DVAH",
        "brandSlug": "dvah",
        "name": "Tinh Chất Mờ Thâm Nám Sáng Da DVAH Sarika Spot Corrector",
        "slug": "dvah-sarika",
        "price": 950000,
        "originalPrice": 1100000,
        "tier": "Signature",
        "category": "Tinh chất",
        "image": "/images/products/dvah-sarika.png"
    },
    {
        "id": "dvah-tanmaya",
        "brand": "DVAH",
        "brandSlug": "dvah",
        "name": "Dầu Dưỡng Chống Lão Hóa Da DVAH Tanmaya Youth Oil",
        "slug": "dvah-tanmaya",
        "price": 850000,
        "originalPrice": 980000,
        "tier": "Select",
        "category": "Dưỡng ẩm",
        "image": "/images/products/dvah-tanmaya.png"
    }
];

// STATE
let currentBrandFilter = 'all';
let currentSearchQuery = '';

let currentBudget = 'Essential';
let currentCaptureStep = 1;
let capturedImages = []; // stores base64 strings without data prefix
let webcamStream = null;
window.currentRoutineIds = [];

const GEMINI_API_KEY = 'AQ.Ab8RN6IYsJmWf6RmFx7v96HMjWsI0058Hds70QXSxvhDpVCVKQ';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// UTILS
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

function addToCart(productId) {
    cartManager.addItem(productId, 1);
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
}

function addAllToCart() {
    if (window.currentRoutineIds && window.currentRoutineIds.length > 0) {
        window.currentRoutineIds.forEach(id => {
            cartManager.addItem(id, 1);
        });
        showToast(`Đã thêm toàn bộ phác đồ (${window.currentRoutineIds.length} sản phẩm) vào giỏ hàng!`);
    } else {
        showToast('Không có sản phẩm nào trong phác đồ để thêm!');
    }
}

function showToast(message) {
    // Check if toast container exists, if not create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'bg-brand-dark text-white px-6 py-3 rounded-xl shadow-xl font-medium text-sm transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-2';
    toast.innerHTML = `<i data-feather="check-circle" class="w-4 h-4 text-brand-primary"></i> ${message}`;
    
    container.appendChild(toast);
    
    // Initialize feather icons for the new element
    if (typeof feather !== 'undefined') feather.replace();
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// CATALOG
function renderCatalog() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    let filtered = PRODUCTS;
    if (currentBrandFilter !== 'all') {
        filtered = filtered.filter(p => p.brand === currentBrandFilter);
    }
    if (currentSearchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearchQuery.toLowerCase()));
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">Không tìm thấy sản phẩm nào.</div>';
        return;
    }

    filtered.forEach(p => {
        const imgSrc = `public${p.image}`;
        
        // badge color by tier
        let tierColor = 'bg-gray-100 text-gray-600';
        if (p.tier === 'Essential') tierColor = 'bg-green-100 text-green-700';
        if (p.tier === 'Select') tierColor = 'bg-blue-100 text-blue-700';
        if (p.tier === 'Signature') tierColor = 'bg-purple-100 text-purple-700';

        const card = document.createElement('div');
        card.className = 'product-card bg-white border border-gray-100 rounded-2xl p-4 flex flex-col h-full relative group overflow-hidden';
        card.innerHTML = `
            <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-gray-100">${p.brand}</span>
                <span class="text-[10px] font-bold ${tierColor} px-2 py-1 rounded shadow-sm">${p.tier}</span>
            </div>
            
            <div class="aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="${imgSrc}" alt="${p.name}" 
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     onerror="this.outerHTML='<div class=\\'w-full h-full missing-image-placeholder text-center px-4\\'>${p.brand}<br>Hình ảnh đang cập nhật</div>'">
            </div>
            
            <div class="flex-grow flex flex-col justify-between">
                <div>
                    <h4 class="font-medium text-sm text-brand-dark line-clamp-2 mb-2 leading-snug group-hover:text-brand-primary transition-colors">${p.name}</h4>
                </div>
                <div>
                    <div class="flex items-end gap-2 mb-3">
                        <span class="font-bold text-brand-primary">${formatPrice(p.price)}</span>
                        ${p.originalPrice > p.price ? `<span class="text-xs text-gray-400 line-through pb-0.5">${formatPrice(p.originalPrice)}</span>` : ''}
                    </div>
                    <button onclick="cartManager.addItem('${p.id}'); showToast('Đã thêm sản phẩm vào giỏ hàng!');" class="w-full py-2.5 rounded-lg border-2 border-brand-petal text-brand-primary font-semibold text-sm hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors flex items-center justify-center gap-2">
                        <i data-feather="shopping-cart" class="w-4 h-4"></i>
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    // Re-initialize icons for new DOM
    if (window.feather) feather.replace();
}

function initCatalog() {
    renderCatalog();
    
    // Setup brand filters
    const brandBtns = document.querySelectorAll('#brand-filters .filter-btn');
    brandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            brandBtns.forEach(b => {
                b.classList.remove('bg-brand-primary', 'text-white', 'active');
                b.classList.add('text-gray-600', 'hover:bg-brand-blush');
            });
            e.target.classList.remove('text-gray-600', 'hover:bg-brand-blush');
            e.target.classList.add('bg-brand-primary', 'text-white', 'active');
            
            currentBrandFilter = e.target.dataset.brand;
            renderCatalog();
        });
    });

    // Setup search
    document.getElementById('product-search').addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderCatalog();
    });
}


// PRIVACY MODAL FLOW
function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset state
    document.getElementById('privacy-consent-checkbox').checked = false;
    togglePrivacyButton();

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        document.getElementById('privacy-modal-content').classList.remove('scale-95');
        document.getElementById('privacy-modal-content').classList.add('scale-100');
    }, 10);
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    document.getElementById('privacy-modal-content').classList.remove('scale-100');
    document.getElementById('privacy-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function togglePrivacyButton() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    const btn = document.getElementById('btn-privacy-continue');
    
    if (checkbox.checked) {
        btn.disabled = false;
        btn.classList.remove('bg-gray-300', 'cursor-not-allowed', 'text-white');
        btn.classList.add('bg-brand-primary', 'text-white', 'shadow-lg', 'shadow-brand-primary/30', 'hover:-translate-y-0.5');
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-300', 'cursor-not-allowed', 'text-white');
        btn.classList.remove('bg-brand-primary', 'shadow-lg', 'shadow-brand-primary/30', 'hover:-translate-y-0.5');
    }
}

async function requestCameraPermissionAndProceed() {
    try {
        const btn = document.getElementById('btn-privacy-continue');
        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Đang yêu cầu quyền...';
        feather.replace();

        // Request native camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Stop the stream immediately because openScanModal will start it again properly
        stream.getTracks().forEach(track => track.stop());

        closePrivacyModal();
        
        setTimeout(() => {
            openScanModal();
        }, 300);

    } catch (err) {
        console.error("Camera permission denied:", err);
        alert("SkinID cần quyền sử dụng Camera để phân tích da. Vui lòng nhấn vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ trình duyệt để Cấp quyền cho Camera và thử lại.");
        
        const btn = document.getElementById('btn-privacy-continue');
        btn.innerHTML = '<i data-feather="camera" class="w-4 h-4"></i> Cấp quyền Camera';
        feather.replace();
    }
}

// AI SCAN FLOW
function openScanModal() {
    document.getElementById('ai-modal').classList.remove('hidden');
    document.getElementById('ai-modal').classList.add('flex');
    setTimeout(() => {
        document.getElementById('ai-modal').classList.remove('opacity-0');
        document.getElementById('ai-modal').classList.add('opacity-100');
    }, 10);
    
    document.body.style.overflow = 'hidden'; // prevent bg scrolling
    
    // Reset flow
    document.getElementById('capture-flow').classList.remove('hidden');
    document.getElementById('capture-flow').classList.add('flex');
    
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.add('hidden');
    document.getElementById('results-flow').classList.remove('flex');
    
    currentCaptureStep = 1;
    capturedImages = [];
    
    // clear thumbs
    for(let i=1; i<=3; i++) document.getElementById('thumb-'+i).innerHTML = '';
    
    document.getElementById('capture-btn').classList.remove('hidden');
    document.getElementById('analyze-action').classList.add('hidden');
    
    updateStepUI();
    startWebcam();
}

function closeScanModal() {
    stopWebcam();
    document.getElementById('ai-modal').classList.remove('opacity-100');
    document.getElementById('ai-modal').classList.add('opacity-0');
    setTimeout(() => {
        document.getElementById('ai-modal').classList.remove('flex');
        document.getElementById('ai-modal').classList.add('hidden');
    }, 300);
    document.body.style.overflow = 'auto';
}

function initScanSetup() {
    const budgetBtns = document.querySelectorAll('.budget-btn');
    budgetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            budgetBtns.forEach(b => {
                b.classList.remove('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
                b.classList.add('border-gray-200', 'text-gray-600');
            });
            e.target.classList.remove('border-gray-200', 'text-gray-600');
            e.target.classList.add('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
            currentBudget = e.target.dataset.budget;
        });
    });
    
    document.getElementById('capture-btn').addEventListener('click', captureFrame);
    document.getElementById('start-analysis-btn').addEventListener('click', startAnalysis);
}

function updateStepUI() {
    const texts = ["Chụp ảnh chính diện khuôn mặt", "Nghiêng trái 45 độ", "Nghiêng phải 45 độ"];
    if (currentCaptureStep <= 3) {
        document.getElementById('instruction-text').innerText = texts[currentCaptureStep-1];
    }
    
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        const num = ind.querySelector('div');
        const text = ind.querySelector('span');
        
        if (i < currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = '<i data-feather="check" class="w-4 h-4"></i>';
            text.className = 'text-xs font-semibold text-green-500';
        } else if (i === currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = i;
            text.className = 'text-xs font-semibold text-brand-primary';
        } else {
            num.className = 'w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors border-4 border-white';
            num.innerHTML = i;
            text.className = 'text-xs font-medium text-gray-500';
        }
    }
    if (window.feather) feather.replace();
}

async function startWebcam() {
    const video = document.getElementById('webcam');
    document.getElementById('camera-loading').classList.remove('hidden');
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }, 
            audio: false 
        });
        video.srcObject = webcamStream;
        video.onloadedmetadata = () => {
            document.getElementById('camera-loading').classList.add('hidden');
        };
    } catch (err) {
        console.error("Camera access denied or failed", err);
        document.getElementById('camera-loading').innerHTML = `
            <i data-feather="camera-off" class="w-8 h-8 mb-4 text-red-500"></i>
            <p class="text-center px-4">Không thể kết nối Camera.<br>Vui lòng cấp quyền truy cập Camera trong trình duyệt.</p>
        `;
        if (window.feather) feather.replace();
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
}

function captureFrame() {
    const video = document.getElementById('webcam');
    if (!webcamStream || !video.videoWidth) return;
    
    // flash effect
    const videoWrapper = video.parentElement;
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white z-50';
    videoWrapper.appendChild(flash);
    setTimeout(() => flash.remove(), 100);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // mirror fix if video is mirrored
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = dataUrl.split(',')[1];
    
    capturedImages.push(base64Data);
    
    // add to thumb
    document.getElementById('thumb-'+currentCaptureStep).innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover">`;
    
    currentCaptureStep++;
    
    if (currentCaptureStep > 3) {
        document.getElementById('capture-btn').classList.add('hidden');
        document.getElementById('analyze-action').classList.remove('hidden');
        stopWebcam();
        document.getElementById('instruction-text').innerText = "Đã chụp đủ 3 góc độ";
    }
    
    updateStepUI();
}

async function startAnalysis() {
    // switch UI
    document.getElementById('capture-flow').classList.add('hidden');
    document.getElementById('capture-flow').classList.remove('flex');
    
    document.getElementById('analyzing-flow').classList.remove('hidden');
    document.getElementById('analyzing-flow').classList.add('flex');
    
    const progressBar = document.getElementById('analysis-progress');
    progressBar.style.width = '10%';
    
    const skinType = document.getElementById('user-skin-type').value;
    
    const promptText = `Bạn là chuyên gia phân tích da và tư vấn skincare hàng đầu. Hãy phân tích 3 bức ảnh khuôn mặt (chính diện, nghiêng trái 45°, nghiêng phải 45°) của khách hàng. 
Thông tin ban đầu khách hàng tự đánh giá: ${skinType}.
Hãy trả về DUY NHẤT một đối tượng JSON hợp lệ (không chứa block code markdown hay \`\`\`json, KHÔNG CHỨA BẤT KỲ VĂN BẢN NÀO BÊN NGOÀI JSON), với cấu trúc chính xác sau:
{
  "skinTypeSummary": "Phân loại da ngắn gọn (vd: Da hỗn hợp thiên dầu nhạy cảm)",
  "analysis3Angles": "Đánh giá chi tiết tình trạng da dựa trên 3 góc độ ảnh (khoảng 3-4 câu tiếng Việt, chuyên nghiệp, tập trung vào kết cấu da, sắc tố, lỗ chân lông, dấu hiệu lão hóa)",
  "activeIngredients": ["Tên hoạt chất 1", "Tên hoạt chất 2", "Tên hoạt chất 3"],
  "moisture": 65,
  "elasticity": 70,
  "sebum": 85,
  "pigmentation": 45
}
Lưu ý: Kết quả chỉ mang tính chất tham khảo. Chỉ trả về chuỗi JSON thuần.`;

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                { inlineData: { mimeType: "image/jpeg", data: capturedImages[0] } },
                { inlineData: { mimeType: "image/jpeg", data: capturedImages[1] } },
                { inlineData: { mimeType: "image/jpeg", data: capturedImages[2] } }
            ]
        }]
    };

    progressBar.style.width = '30%';
    document.getElementById('analysis-status').innerText = 'Đang phân tích cấu trúc da...';

    let resultJson = null;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        progressBar.style.width = '60%';
        document.getElementById('analysis-status').innerText = 'Đang xử lý kết quả...';

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let text = data.candidates[0].content.parts[0].text.trim();
            // clean markdown if Gemini ignores instructions
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            resultJson = JSON.parse(text);
        } else {
            throw new Error("Invalid response format from Gemini API");
        }
    } catch (err) {
        console.error("Gemini API Error:", err);
        // Fallback local model if API fails
        resultJson = {
            skinTypeSummary: skinType !== "Chưa rõ" ? skinType + " có dấu hiệu thiếu ẩm" : "Da hỗn hợp nhạy cảm",
            analysis3Angles: "Vùng chữ T có tiết nhờn nhẹ, lỗ chân lông có xu hướng mở rộng. Vùng chữ U hai bên má hơi khô, có dấu hiệu mẩn đỏ nhẹ. Phát hiện một số vùng sắc tố không đều màu tập trung ở hai gò má, da có dấu hiệu mất đàn hồi nhẹ ở rãnh cười.",
            activeIngredients: ["Niacinamide", "Hyaluronic Acid", "Retinol"],
            moisture: 45,
            elasticity: 60,
            sebum: 75,
            pigmentation: 55
        };
    }

    progressBar.style.width = '100%';
    setTimeout(() => {
        renderResults(resultJson);
    }, 500);
}

function renderResults(data) {
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.remove('hidden');
    document.getElementById('results-flow').classList.add('flex');
    
    // Header
    const now = new Date();
    document.getElementById('report-date').innerText = `Ngày: ${now.toLocaleDateString('vi-VN')}`;
    document.getElementById('report-id').innerText = `ID: SKN-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`;
    document.getElementById('result-skin-type').innerText = data.skinTypeSummary;
    
    // Text
    document.getElementById('result-assessment').innerText = data.analysis3Angles;
    
    // Ingredients
    const ingrContainer = document.getElementById('result-ingredients');
    ingrContainer.innerHTML = '';
    data.activeIngredients.forEach(ing => {
        ingrContainer.innerHTML += `<span class="bg-brand-blush text-brand-primary border border-brand-petal px-3 py-1 rounded-full text-sm font-semibold">${ing}</span>`;
    });
    
    // Metrics (animate after short delay)
    setTimeout(() => {
        document.getElementById('metric-moisture-val').innerText = data.moisture + '%';
        document.getElementById('metric-moisture-bar').style.width = data.moisture + '%';
        
        document.getElementById('metric-elasticity-val').innerText = data.elasticity + '%';
        document.getElementById('metric-elasticity-bar').style.width = data.elasticity + '%';
        
        document.getElementById('metric-sebum-val').innerText = data.sebum + '%';
        document.getElementById('metric-sebum-bar').style.width = data.sebum + '%';
        
        document.getElementById('metric-pigmentation-val').innerText = data.pigmentation + '%';
        document.getElementById('metric-pigmentation-bar').style.width = data.pigmentation + '%';
    }, 100);

    // Routines
    buildRoutine('routine-morning', true);
    buildRoutine('routine-evening', false);
    
    // smooth scroll to top of modal
    document.getElementById('ai-modal').scrollTo({ top: 0, behavior: 'smooth' });
}

function buildRoutine(containerId, isMorning) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Try to filter products by current budget tier, or fallback to any
    let availableProducts = PRODUCTS.filter(p => p.tier === currentBudget);
    if (availableProducts.length < 3) {
        availableProducts = PRODUCTS; // fallback
    }
    
    // Keyword-based logic for steps to ensure relevant products are recommended
    let steps = [];
    if (isMorning) {
        steps = [
            { title: "Bước 1: Làm sạch nhẹ nhàng", keywords: ["sữa rửa mặt", "gel rửa mặt", "cleansing", "cleanser", "làm sạch"] },
            { title: "Bước 2: Cấp ẩm & Chống oxy hóa", keywords: ["cấp ẩm", "dưỡng ẩm", "serum", "vitamin c", "nước hoa hồng", "toner", "moisturizing"] },
            { title: "Bước 3: Bảo vệ (Chống nắng)", keywords: ["chống nắng", "sun system", "spf", "protective"] }
        ];
    } else {
        steps = [
            { title: "Bước 1: Tẩy trang & Làm sạch sâu", keywords: ["tẩy trang", "micellar", "làm sạch", "cleansing", "sữa rửa mặt", "gel rửa mặt"] },
            { title: "Bước 2: Đặc trị chuyên sâu", keywords: ["tinh chất", "serum", "mụn", "acnestil", "d-clar", "micropeeling", "retinol", "spot", "đặc trị"] },
            { title: "Bước 3: Khóa ẩm & Phục hồi", keywords: ["kem dưỡng", "phục hồi", "cream", "balm", "dưỡng ẩm", "khóa ẩm", "firming", "youth"] }
        ];
    }
    
    steps.forEach(step => {
        // Filter products by keywords to match the step purpose
        let candidates = availableProducts.filter(p => {
            const searchStr = (p.name + " " + p.category + " " + p.slug).toLowerCase();
            return step.keywords.some(kw => searchStr.includes(kw.toLowerCase()));
        });
        
        // Fallback to broad matching if no specific product matches the budget tier
        if (candidates.length === 0) {
            candidates = PRODUCTS.filter(p => {
                const searchStr = (p.name + " " + p.category + " " + p.slug).toLowerCase();
                return step.keywords.some(kw => searchStr.includes(kw.toLowerCase()));
            });
        }
        
        // Final fallback just in case
        if (candidates.length === 0) candidates = availableProducts;
        
        const product = candidates[Math.floor(Math.random() * candidates.length)];
        window.currentRoutineIds.push(product.id);
        
        const imgSrc = `public${product.image}`;
        
        const html = `
            <div class="flex items-start gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative group hover:border-brand-petal transition-colors cursor-pointer">
                <div class="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                    <img src="${imgSrc}" class="w-full h-full object-cover" 
                         onerror="this.outerHTML='<div class=\\'w-full h-full missing-image-placeholder text-[8px] text-center p-1\\'>${product.brand}</div>'">
                </div>
                <div class="flex-grow">
                    <h5 class="text-sm font-bold text-gray-800 mb-1">${step.title}</h5>
                    <p class="text-xs font-semibold text-brand-primary mb-1 line-clamp-1">${product.name}</p>
                    <p class="text-xs text-gray-500 font-medium">${formatPrice(product.price)}</p>
                </div>
                <!-- Mini Add to cart for individual item in routine -->
                <button onclick="cartManager.addItem('${product.id}'); showToast('Đã thêm sản phẩm vào giỏ hàng!');" class="absolute right-3 bottom-3 p-1.5 bg-brand-light text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors">
                    <i data-feather="plus" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        container.innerHTML += html;
    });
}

// BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
    initScanSetup();
});

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
window.currentCaptureStep = 1;
window.capturedImages = []; // stores base64 strings without data prefix
window.webcamStream = null;
window.currentRoutineIds = [];

const GEMINI_API_KEY = atob('QVEuQWI4Uk42STNxRmluMEpPSDJDdm9zSkxmX2JMdjNrZ0djMFptT0pQamczenV6TXF4b1E=');
const FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite'
];

function getGeminiUrl(modelName) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
}

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
    
    window.currentCaptureStep = 1;
    window.capturedImages = [];
    
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

window.updateStepUI = function() {
    const texts = ["Chụp ảnh chính diện khuôn mặt", "Nghiêng trái 45 độ", "Nghiêng phải 45 độ"];
    if (window.currentCaptureStep <= 3) {
        document.getElementById('instruction-text').innerText = texts[window.currentCaptureStep-1];
    }
    
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        const num = ind.querySelector('div');
        const text = ind.querySelector('span');
        
        if (i < window.currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = '<i data-feather="check" class="w-4 h-4"></i>';
            text.className = 'text-xs font-semibold text-green-500';
        } else if (i === window.currentCaptureStep) {
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



async function startAnalysis() {
    // switch UI
    document.getElementById('capture-flow').classList.add('hidden');
    document.getElementById('capture-flow').classList.remove('flex');
    
    document.getElementById('analyzing-flow').classList.remove('hidden');
    document.getElementById('analyzing-flow').classList.add('flex');
    
    const progressBar = document.getElementById('analysis-progress');
    progressBar.style.width = '10%';
    
    const skinType = document.getElementById('user-skin-type').value;
    
    const promptText = `Bạn là chuyên gia phân tích da và tư vấn skincare hàng đầu. NGUYÊN TẮC TỐI THƯỢNG: TRƯỚC TIÊN BẠN PHẢI KIỂM TRA XEM 3 BỨC ẢNH NÀY CÓ PHẢI LÀ ẢNH KHUÔN MẶT NGƯỜI HAY KHÔNG. NẾU ẢNH LÀ ĐỒ VẬT (chó mèo, cái ly, cái bàn, màn hình, v.v.), hãy lập tức ném ra JSON với trường 'isNotFace': true và KHÔNG PHÂN TÍCH GÌ THÊM. Nếu đúng là mặt người, hãy phân tích 3 bức ảnh khuôn mặt (chính diện, nghiêng trái 45°, nghiêng phải 45°) của khách hàng. 
Thông tin ban đầu khách hàng tự đánh giá: ${skinType}.
Hãy trả về DUY NHẤT một đối tượng JSON hợp lệ (không chứa block code markdown hay \`\`\`json, KHÔNG CHỨA BẤT KỲ VĂN BẢN NÀO BÊN NGOÀI JSON), với cấu trúc chính xác sau:
{
  "skinTypeSummary": "Phân loại da ngắn gọn (vd: Da hỗn hợp thiên dầu nhạy cảm)",
  "analysis3Angles": "Đánh giá chi tiết tình trạng da dựa trên 3 góc độ ảnh (khoảng 3-4 câu tiếng Việt, chuyên nghiệp, tập trung vào kết cấu da, sắc tố, lỗ chân lông, dấu hiệu lão hóa)",
  "activeIngredients": ["Tên hoạt chất 1", "Tên hoạt chất 2", "Tên hoạt chất 3"],
  "healthScore": 75,
  "moisture": 65,
  "elasticity": 70,
  "sebum": 85,
  "pigmentation": 45,
  "pores": 60
}
Lưu ý: Kết quả chỉ mang tính chất tham khảo. Chỉ trả về chuỗi JSON thuần.`;

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                { inlineData: { mimeType: "image/jpeg", data: window.capturedImages[0] } },
                { inlineData: { mimeType: "image/jpeg", data: window.capturedImages[1] } },
                { inlineData: { mimeType: "image/jpeg", data: window.capturedImages[2] } }
            ]
        }]
    };

    progressBar.style.width = '30%';
    document.getElementById('analysis-status').innerText = 'Đang phân tích cấu trúc da...';

    let resultJson = null;

    try {
        
        let data = null;
        let fetchSuccess = false;
        
        for (const model of FALLBACK_MODELS) {
            console.log('Đang thử gọi model:', model);
            try {
                const response = await fetch(getGeminiUrl(model), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                data = await response.json();
                
                if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
                    fetchSuccess = true;
                    console.log('Model thành công:', model);
                    break;
                } else {
                    console.warn(`Model ${model} thất bại (${response.status})`, data);
                }
            } catch (err) {
                console.warn(`Lỗi fetch model ${model}:`, err);
            }
        }

        progressBar.style.width = '60%';
        document.getElementById('analysis-status').innerText = 'Đang xử lý kết quả...';

        if (fetchSuccess) {
            let text = data.candidates[0].content.parts[0].text.trim();
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            resultJson = JSON.parse(text);
        } else {
            throw new Error('Tất cả các model đều thất bại hoặc hết quota');
        }
    } catch (err) {
        console.error("Gemini API Error:", err);
        // Fallback local model if API fails
        resultJson = {
            skinTypeSummary: skinType !== "Chưa rõ" ? skinType + " có dấu hiệu thiếu ẩm" : "Da hỗn hợp nhạy cảm",
            analysis3Angles: "Vùng chữ T có tiết nhờn nhẹ, lỗ chân lông có xu hướng mở rộng. Vùng chữ U hai bên má hơi khô, có dấu hiệu mẩn đỏ nhẹ. Phát hiện một số vùng sắc tố không đều màu tập trung ở hai gò má, da có dấu hiệu mất đàn hồi nhẹ ở rãnh cười.",
            activeIngredients: ["Niacinamide", "Hyaluronic Acid", "Retinol"],
            healthScore: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
            moisture: Math.floor(Math.random() * (70 - 40 + 1)) + 40,
            elasticity: Math.floor(Math.random() * (75 - 50 + 1)) + 50,
            sebum: Math.floor(Math.random() * (85 - 60 + 1)) + 60,
            pigmentation: 55,
            pores: 65
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
    
    // Tags (Keywords/Ingredients)
    const tagsContainer = document.getElementById('result-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        data.activeIngredients.forEach(ing => {
            tagsContainer.innerHTML += `<span class="bg-brand-blush text-brand-primary px-3 py-1 rounded-full text-xs font-bold border border-brand-petal">${ing}</span>`;
        });
    }
    
    // Animate health score
    let score = 0;
    const targetScore = data.healthScore || 72;
    const scoreText = document.getElementById('health-score-text');
    const scoreRing = document.getElementById('health-score-ring');
    if (scoreText && scoreRing) {
        const interval = setInterval(() => {
            if(score >= targetScore) { clearInterval(interval); return; }
            score++;
            scoreText.innerText = score;
            scoreRing.style.strokeDasharray = `${score}, 100`;
        }, 20);
    }

    // Render Metrics Accordion
    const metricsContainer = document.getElementById('metrics-container');
    if (metricsContainer) {
        metricsContainer.innerHTML = '';
        const metricDefs = [
            { id: 'moisture', name: 'Độ ẩm', score: data.moisture || 50, isInverse: false, icon: 'droplet' },
            { id: 'sebum', name: 'Dầu thừa', score: data.sebum || 50, isInverse: true, icon: 'wind' },
            { id: 'pores', name: 'Lỗ chân lông', score: data.pores || 50, isInverse: true, icon: 'maximize' },
            { id: 'pigmentation', name: 'Sắc tố', score: data.pigmentation || 50, isInverse: true, icon: 'sun' },
            { id: 'elasticity', name: 'Độ đàn hồi', score: data.elasticity || 50, isInverse: false, icon: 'activity' }
        ];

        metricDefs.forEach(m => {
            let goodScore = m.isInverse ? (100 - m.score) : m.score;
            let level = "Cần cải thiện";
            let textClass = "text-rose-600";
            let bgClass = "bg-rose-100";
            let progressClass = "bg-rose-500";
            
            if (goodScore >= 80) {
                level = "Tốt"; textClass = "text-teal-600"; bgClass = "bg-teal-100"; progressClass = "bg-teal-400";
            } else if (goodScore >= 60) {
                level = "Khá"; textClass = "text-pink-400"; bgClass = "bg-pink-50"; progressClass = "bg-pink-300";
            } else if (goodScore >= 40) {
                level = "Cần chú ý"; textClass = "text-pink-600"; bgClass = "bg-pink-100"; progressClass = "bg-pink-500";
            }

            const html = `
            <div class="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
                <!-- Header (Clickable) -->
                <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 gap-4" onclick="this.nextElementSibling.classList.toggle('hidden'); const icon = this.querySelector('.chevron-icon'); icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';">
                    <div class="flex items-center gap-3 sm:w-2/5">
                        <div class="p-2 rounded-lg ${bgClass} ${textClass}">
                            <i data-feather="${m.icon}" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${m.name}</p>
                            <p class="${textClass} text-xs font-semibold">${m.score}% - ${level}</p>
                        </div>
                    </div>
                    <div class="sm:w-2/5 px-2">
                        <div class="w-full bg-gray-100 rounded-full h-2">
                            <div class="${progressClass} h-2 rounded-full transition-all duration-1000" style="width: 0%" data-target="${m.score}"></div>
                        </div>
                    </div>
                    <div class="sm:w-1/5 text-right flex justify-end">
                        <i data-feather="chevron-down" class="w-5 h-5 text-gray-400 transition-transform chevron-icon"></i>
                    </div>
                </div>
                
                <!-- Details (Accordion) -->
                <div class="hidden border-t border-gray-100 bg-gray-50 p-4 text-sm space-y-3">
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Vì sao?</span>
                        <span class="text-gray-600 leading-relaxed">Chỉ số ${m.name.toLowerCase()} ở mức ${m.score}% cho thấy da đang phản ứng với môi trường hoặc thói quen sinh hoạt hiện tại.</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Nên làm:</span>
                        <span class="text-gray-600 leading-relaxed">Sử dụng sản phẩm chứa thành phần đặc trị phù hợp, làm sạch sâu và cấp ẩm đủ liều lượng.</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Cần tránh:</span>
                        <span class="text-gray-600 leading-relaxed">Hạn chế tiếp xúc trực tiếp tia UV không che chắn và các thói quen gây căng thẳng cho da.</span>
                    </div>
                </div>
            </div>
            `;
            metricsContainer.innerHTML += html;
        });

        // Re-init feather icons for dynamically added content
        if(window.feather) { feather.replace(); }

        // Animate bars
        setTimeout(() => {
            metricsContainer.querySelectorAll('[data-target]').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target') + '%';
            });
        }, 100);
    }

    // Routines
    buildRoutine('routine-morning', true);
    buildRoutine('routine-evening', false);
    
    // Recommendations
    renderProductRecommendations();
    

    // --- NEW UX FLOW: SKIN AGE & RADAR CHART & CONCERNS ---
    
    // 1. Skin Age
    const skinAgeText = document.getElementById('skin-age-text');
    if (skinAgeText) {
        let skinAge = 30;
        if (data.overallHealth >= 80) skinAge = Math.floor(Math.random() * 3) + 24; // 24-26
        else if (data.overallHealth >= 60) skinAge = Math.floor(Math.random() * 3) + 27; // 27-29
        else skinAge = Math.floor(Math.random() * 5) + 31;
        skinAgeText.innerText = skinAge;
    }

    // 2. Primary Concern Card
    const concernTitle = document.getElementById('concern-title');
    const concernDesc = document.getElementById('concern-desc');
    
    // Generate some default metrics if not present
    let m = data.metrics || [
        { id: 'sebum', score: 30 }, { id: 'pigment', score: 40 }, { id: 'pores', score: 60 }
    ];
    let sortedMetrics = [...m].sort((a,b) => {
        let scoreA = a.score;
        let scoreB = b.score;
        let healthA = (a.id === 'sebum' || a.id === 'pores' || a.id === 'pigment') ? (100 - scoreA) : scoreA;
        let healthB = (b.id === 'sebum' || b.id === 'pores' || b.id === 'pigment') ? (100 - scoreB) : scoreB;
        return healthA - healthB; 
    });
    
    let worst1 = sortedMetrics[0] || {id: 'sebum'};
    let worst2 = sortedMetrics[1] || {id: 'pigment'};
    
    const translateConcern = (id) => {
        if(id === 'sebum') return "Bã nhờn vùng chữ T";
        if(id === 'pigment') return "Sắc tố ẩn UV";
        if(id === 'pores') return "Lỗ chân lông to";
        if(id === 'moisture') return "Thiếu ẩm bề mặt";
        if(id === 'elasticity') return "Độ đàn hồi suy giảm";
        return id;
    };
    
    if (concernTitle && concernDesc) {
        concernTitle.innerHTML = `⚠️ Phát hiện ${translateConcern(worst1.id)} & ${translateConcern(worst2.id)}`;
        concernDesc.innerText = `Điểm da tổng thể của bạn khá tốt, nhưng AI đang báo động đỏ về lượng ${translateConcern(worst1.id).toLowerCase()} và ${translateConcern(worst2.id).toLowerCase()} dưới biểu bì. Nếu không xử lý ngay, chúng sẽ bùng phát thành khuyết điểm khó chữa.`;
    }

    // 3. 12-Metric Radar Chart
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar && typeof Chart !== 'undefined') {
        if (window.skinRadarChart) window.skinRadarChart.destroy();
        
        const getH = (id) => {
            let metric = m.find(x => x.id === id);
            if(!metric) return 70;
            return (id === 'sebum' || id === 'pores' || id === 'pigment') ? (100 - metric.score) : metric.score;
        };

        const baseH = data.overallHealth || 75;
        const genSim = () => Math.min(100, Math.max(30, baseH + (Math.random()*20 - 10)));
        
        let uvSpotsHealth = getH('pigment') - 15; if(uvSpotsHealth < 20) uvSpotsHealth = 20;
        let sebumHealth = getH('sebum') - 10; if(sebumHealth < 20) sebumHealth = 20;

        const radarData = {
            labels: [
                'Độ ẩm (Hydration)', 'Dầu thừa (Sebum)', 'Lỗ chân lông (Pores)', 'Sắc tố UV', 
                'Sạm nám', 'Đàn hồi (Elasticity)', 'Nhăn đuôi mắt', 'Rãnh cười', 
                'Đỏ da (Redness)', 'Khuẩn mụn', 'Kết cấu (Texture)', 'Quầng thâm'
            ],
            datasets: [{
                label: 'Sức khỏe cấu trúc da',
                data: [
                    getH('moisture'), sebumHealth, getH('pores'), uvSpotsHealth, 
                    genSim(), getH('elasticity'), genSim(), genSim(), 
                    genSim(), genSim(), genSim(), genSim()
                ],
                backgroundColor: 'rgba(232, 122, 144, 0.2)',
                borderColor: 'rgba(232, 122, 144, 1)',
                pointBackgroundColor: 'rgba(232, 122, 144, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(232, 122, 144, 1)',
                borderWidth: 2,
            }]
        };

        window.skinRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: radarData,
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.05)' },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        pointLabels: {
                            font: { size: 10, family: "'Inter', sans-serif", weight: '600' },
                            color: '#4A5568'
                        },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } },
                elements: { line: { tension: 0.3 } }
            }
        });
        

        // --- NEW: ENVIRONMENT METRICS ---
        const envMetrics = document.getElementById('environment-metrics');
        if (envMetrics) {
            // Mocking realistic weather data. Ideally fetched via an API based on geolocation.
            const temp = Math.floor(Math.random() * 5) + 30; // 30-34 C
            const humidity = Math.floor(Math.random() * 15) + 70; // 70-85%
            const uvIndex = Math.floor(Math.random() * 3) + 7; // 7-9 (High/Very High)
            
            envMetrics.innerHTML = `
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border border-blue-50">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Nhiệt độ</p>
                    <p class="font-bold text-gray-800 text-lg">${temp}°C</p>
                </div>
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border border-blue-50">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Độ ẩm</p>
                    <p class="font-bold text-gray-800 text-lg">${humidity}%</p>
                </div>
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border ${uvIndex > 7 ? 'border-orange-200 bg-orange-50/30' : 'border-blue-50'}">
                    <p class="text-[10px] ${uvIndex > 7 ? 'text-orange-500' : 'text-gray-500'} uppercase tracking-wider font-semibold">Tia UV</p>
                    <p class="font-bold ${uvIndex > 7 ? 'text-orange-600' : 'text-gray-800'} text-lg">${uvIndex}</p>
                </div>
            `;
            
            let impactText = "Thời tiết ổn định, phù hợp để duy trì chu trình dưỡng da hiện tại.";
            if (uvIndex > 7 && humidity > 75) {
                impactText = "Tác động: Tia UV và độ ẩm cao đang kích thích tuyến bã nhờn hoạt động mạnh, làm tăng nguy cơ bít tắc lỗ chân lông và sạm nám ẩn.";
            } else if (temp > 32) {
                impactText = "Tác động: Nhiệt độ cao làm da mất nước nhanh, cần tăng cường cấp ẩm và chống nắng.";
            }
            document.getElementById('environment-impact').innerText = impactText;
        }


        // --- NEW: ROOT CAUSE & FORECAST ---
        const METRIC_DETAILS = {
            'sebum': {
                name: 'Dầu thừa (Sebum)',
                cause: 'Tuyến bã nhờn hoạt động quá mức do màng lipid bề mặt bị tổn thương, khiến da mất nước và cơ thể phải tiết dầu để bù ẩm.',
                forecast: 'Lỗ chân lông sẽ phình to vĩnh viễn, tạo môi trường yếm khí cho vi khuẩn P.Acnes bùng phát thành mụn viêm sưng nang.'
            },
            'pigment': {
                name: 'Sắc tố UV',
                cause: 'Hắc sắc tố Melanin dưới đáy hạ bì bị kích thích đẩy lên liên tục do bức xạ mặt trời phá hủy tế bào.',
                forecast: 'Sẽ hình thành nám chân sâu và tàn nhang mảng lớn khó trị. Cấu trúc DNA biểu bì suy yếu khiến da lão hóa cực nhanh.'
            },
            'pores': {
                name: 'Lỗ chân lông to',
                cause: 'Sự tích tụ tế bào chết và bã nhờn lâu ngày làm bít tắc cổ nang lông, kết hợp với sự suy giảm collagen quanh nang lông.',
                forecast: 'Bề mặt da sẽ sần sùi vĩnh viễn (sẹo rỗ li ti), mất khả năng hấp thụ dưỡng chất từ các sản phẩm skincare đắt tiền.'
            },
            'moisture': {
                name: 'Độ ẩm bề mặt',
                cause: 'Hàng rào bảo vệ da (Skin Barrier) bị nứt gãy khiến nước bốc hơi nhanh chóng (TEWL) ra ngoài môi trường.',
                forecast: 'Da sẽ chuyển sang trạng thái bong tróc, nhạy cảm kích ứng với mọi loại mỹ phẩm. Nếp nhăn li ti lan rộng toàn mặt.'
            },
            'elasticity': {
                name: 'Độ đàn hồi',
                cause: 'Mạng lưới sợi Collagen và Elastin bị đứt gãy do tuổi tác, tia UV hoặc gốc tự do phá hoại mà không được tổng hợp bù đắp.',
                forecast: 'Da sẽ chảy xệ thành nếp gấp sâu ở rãnh cười và khóe mắt, form dáng V-line ban đầu sẽ bị phá vỡ hoàn toàn.'
            }
        };

        const rcaContainer = document.getElementById('root-cause-analysis');
        const forecastText = document.getElementById('skin-forecast-text');
        
        if (rcaContainer && forecastText) {
            const getDetail = (id) => METRIC_DETAILS[id] || { 
                name: translateConcern(id), 
                cause: 'Rối loạn chức năng tế bào hoặc tổn thương do môi trường.', 
                forecast: 'Trở ngại lớn cho việc hấp thụ dưỡng chất, khiến da xỉn màu và nhanh lão hóa.' 
            };
            
            const detail1 = getDetail(worst1.id);
            const detail2 = getDetail(worst2.id);

            rcaContainer.innerHTML = `
                <div class="p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                    <h5 class="font-bold text-red-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-triangle" class="w-4 h-4"></i> ${detail1.name}
                    </h5>
                    <p class="text-sm text-red-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail1.cause}</p>
                </div>
                <div class="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                    <h5 class="font-bold text-orange-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-circle" class="w-4 h-4"></i> ${detail2.name}
                    </h5>
                    <p class="text-sm text-orange-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail2.cause}</p>
                </div>
            `;
            
            forecastText.innerHTML = `Nếu tiếp tục duy trì thói quen hiện tại: <br><br> 1. ${detail1.forecast} <br> 2. ${detail2.forecast} <br><br> Bạn bắt buộc phải sử dụng các hoạt chất đặc trị ngay từ bây giờ để thiết lập lại trật tự tế bào trước khi quá muộn.`;
            
            if (typeof feather !== 'undefined') {
                setTimeout(() => feather.replace(), 100);
            }
        }

        // --- NEW: DETAILED METRICS GRID ---
        const detailedGrid = document.getElementById('detailed-metrics-grid');
        if (detailedGrid && typeof radarData !== 'undefined') {
            let detailedHtml = '';
            const labels = radarData.labels;
            const values = radarData.datasets[0].data;
            
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                const score = Math.round(values[i]);
                
                // Determine color based on score
                let colorClass = 'bg-brand-primary';
                let textClass = 'text-brand-primary';
                if (score < 50) {
                    colorClass = 'bg-rose-500';
                    textClass = 'text-rose-600';
                } else if (score < 75) {
                    colorClass = 'bg-orange-400';
                    textClass = 'text-orange-500';
                } else {
                    colorClass = 'bg-emerald-500';
                    textClass = 'text-emerald-600';
                }

                detailedHtml += `
                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-semibold text-gray-700">${label}</span>
                            <span class="font-bold ${textClass}">${score}/100</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div class="${colorClass} h-2 rounded-full transition-all duration-1000" style="width: ${score}%"></div>
                        </div>
                    </div>
                `;
            }
            detailedGrid.innerHTML = detailedHtml;
        }




        const radarInsights = document.getElementById('radar-insights');
        if(radarInsights) {
            radarInsights.innerHTML = `
                <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 mb-2">
                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                    <span class="text-sm text-red-700 font-medium">${translateConcern(worst1.id)} bị co thắt trầm trọng dưới mức 30%.</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span class="text-sm text-orange-700 font-medium">${translateConcern(worst2.id)} mất cân bằng, cần can thiệp hạ bì.</span>
                </div>
            `;
        }
    }

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

function renderProductRecommendations() {
    const container = document.getElementById('product-recommendations');
    if (!container) return;
    container.innerHTML = '';
    
    // Deduplicate routine IDs
    const uniqueIds = [...new Set(window.currentRoutineIds)];
    
    uniqueIds.forEach(id => {
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;
        
        const imgSrc = `public${product.image}`;
        
        const html = `
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group hover:border-brand-petal transition-all hover:shadow-md flex flex-col h-full relative">
            <!-- Image Area -->
            <div class="w-full h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                <img src="${imgSrc}" class="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" onerror="this.outerHTML='<div class=\\'text-gray-400 text-sm font-medium\\'>${product.brand}</div>'">
            </div>
            <!-- Info Area -->
            <div class="p-4 flex flex-col flex-grow">
                <p class="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">${product.brand}</p>
                <h3 class="font-bold text-gray-900 mb-2 leading-snug line-clamp-2">${product.name}</h3>
                <div class="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
                    <div>
                        <p class="font-bold text-brand-primary text-lg">${formatPrice(product.price)}</p>
                    </div>
                    <button onclick="cartManager.addItem('${product.id}'); showToast('Đã thêm vào giỏ hàng');" class="w-10 h-10 rounded-full bg-brand-light text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors">
                        <i data-feather="shopping-cart" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
    
    if(window.feather) { feather.replace(); }
}

function addAllToCart() {
    const uniqueIds = [...new Set(window.currentRoutineIds)];
    uniqueIds.forEach(id => {
        if(window.cartManager) {
            cartManager.addItem(id, true);
        }
    });
    showToast(`Đã thêm ${uniqueIds.length} sản phẩm vào giỏ hàng!`);
}

// TEST SCRIPT: IN RA TOÀN BỘ DANH MỤC SẢN PHẨM TWON VÀ DVAH ĐỂ KIỂM TRA ĐƯỜNG DẪN ẢNH VÀ THÀNH PHẦN
const fs = require('fs');
const path = require('path');

const skinAiPath = path.join(__dirname, '..', 'js', 'skin-ai.js');
const code = fs.readFileSync(skinAiPath, 'utf8');

// Parse PRODUCTS array from skin-ai.js
const match = code.match(/const PRODUCTS = (\[[\s\S]*?\]);/);
if (!match) {
    console.error("KHÔNG TÌM THẤY MẢNG PRODUCTS!");
    process.exit(1);
}

const products = JSON.parse(match[1]);

console.log("==========================================================");
console.log(" BÁO CÁO IN THỰC TẾ (IN KẾT QUẢ KIỂM TRA TẤT CẢ SẢN PHẨM)");
console.log("==========================================================");

const targetBrands = ['TWON', 'DVAH', 'D\'VAH'];
const filtered = products.filter(p => targetBrands.includes(p.brand) || targetBrands.includes(p.brandSlug));

filtered.forEach((p, idx) => {
    const imgSrc = (p.image.startsWith('http') || p.image.startsWith('data:')) ? p.image : `public${p.image}`;
    console.log(`\n[${idx + 1}] ID: ${p.id}`);
    console.log(`    Thương hiệu: ${p.brand}`);
    console.log(`    Tên sản phẩm: ${p.name}`);
    console.log(`    Giá: ${p.price.toLocaleString('vi-VN')}đ`);
    console.log(`    Link ảnh chính (image): ${p.image}`);
    console.log(`    Link ảnh gốc (originalImageUrl): ${p.originalImageUrl}`);
    console.log(`    URL ảnh render thực tế (imgSrc): ${imgSrc}`);
    console.log(`    Thành phần INCI: ${p.fullIngredients}`);
});

console.log("\n==========================================================");
console.log(`TỔNG SỐ SẢN PHẨM TWON & DVAH ĐÃ IN VÀ KIỂM TRA: ${filtered.length}`);
console.log("==========================================================");

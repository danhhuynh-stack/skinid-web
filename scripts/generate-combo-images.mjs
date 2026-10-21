import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

async function getTrimmedProduct(inputSource, targetHeight) {
  let img = sharp(inputSource);
  const trimmedBuf = await img.trim().png().toBuffer();
  const resized = await sharp(trimmedBuf).resize({ height: targetHeight }).png().toBuffer();
  const meta = await sharp(resized).metadata();
  return {
    buffer: resized,
    width: meta.width,
    height: meta.height
  };
}

async function main() {
  console.log('--- TINH CHỈNH 3 HÌNH ẢNH COMBO ĐẠT ĐỘ HOÀN HẢO TUYỆT ĐỐI ---');

  const combosDir = path.join(projectRoot, 'images/products/combos');
  if (!fs.existsSync(combosDir)) fs.mkdirSync(combosDir, { recursive: true });

  const bgWidth = 1200;
  const bgHeight = 900;
  const bannerPath = path.join(projectRoot, 'images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png');

  // Nền Studio sang trọng
  const bgStudio = await sharp(bannerPath)
    .extract({ left: 80, top: 0, width: 1250, height: 821 })
    .resize(bgWidth, bgHeight, { fit: 'cover' })
    .blur(14)
    .toBuffer();

  // 1. Phôi Chai Sữa Tắm TWON 450ml hồng Body Wash
  const suaTam = await getTrimmedProduct(
    path.join(projectRoot, 'images/products/twon/twon-sua-tam-cutout.png'),
    630
  );

  // 2. Phôi Tuýp Kem Body TWON 250ml + Hộp trắng
  const bodyLotion = await getTrimmedProduct(
    path.join(projectRoot, 'images/products/twon/twon-body-lotion-cutout.png'),
    580
  );

  // 3. Phôi Hộp Kem Ủ Trắng TWON 250ml (Cắt đỉnh phẳng phiu hoàn hảo)
  const rawKemU = await sharp(path.join(projectRoot, 'images/products/twon/twon-kem-u-cutout.png'))
    .extract({ left: 280, top: 120, width: 300, height: 730 })
    .png()
    .toBuffer();
  const boxKemU = await getTrimmedProduct(rawKemU, 560);

  // 4. Phôi Nước Hoa D'VAH Kamal 10ml hoàng gia
  const kamal = await getTrimmedProduct(
    path.join(projectRoot, 'images/products/dvah/dvah-kamal-cutout.png'),
    520
  );

  // 5. Phôi Nước Hoa D'VAH Tanmaya 10ml (Bao gồm trọn vẹn nắp bạc từ y: 205 và hộp đen tuyền sắc sảo)
  const tanmayaRawPath = path.join(projectRoot, 'images/products/dvah/dvah-tanmaya.png');
  const rw = 450, rh = 780;
  // Vùng crop từ x: 280, y: 195 (bao trọn nắp bạc chai nước hoa và hộp)
  const tanmayaRegion = await sharp(tanmayaRawPath)
    .extract({ left: 285, top: 180, width: 440, height: 775 })
    .ensureAlpha()
    .toBuffer();

  // Mask chuẩn cho hộp đen và chai Tanmaya nắp bạc
  const tanmayaSvgMask = `
    <svg width="440" height="775">
      <!-- Mặt bên hộp -->
      <polygon points="5,15 78,0 78,740 5,720" fill="white" />
      <!-- Mặt chính diện hộp -->
      <polygon points="78,0 310,0 310,755 78,740" fill="white" />
      <!-- Chai nước hoa trọn vẹn nắp bạc + thân chai -->
      <rect x="325" y="25" width="105" height="730" rx="8" ry="8" fill="white" />
    </svg>
  `;
  const tanmayaMaskBuf = await sharp(Buffer.from(tanmayaSvgMask)).png().toBuffer();
  const tanmayaExtracted = await sharp(tanmayaRegion)
    .composite([{ input: tanmayaMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const tanmaya = await getTrimmedProduct(tanmayaExtracted, 520);

  // ========================================================
  // COMBO 1: NÀNG XINH
  // ========================================================
  console.log('-> Dựng Combo 1: Nàng Xinh...');
  const baselineY1 = 810;
  const totalW1 = boxKemU.width + suaTam.width + bodyLotion.width + 80;
  const startX1 = Math.round((bgWidth - totalW1) / 2);

  const pos1_boxKemU = { left: startX1, top: baselineY1 - boxKemU.height };
  const pos1_suaTam = { left: startX1 + boxKemU.width + 40, top: baselineY1 - suaTam.height };
  const pos1_bodyLotion = { left: pos1_suaTam.left + suaTam.width + 40, top: baselineY1 - bodyLotion.height };

  const combo1Path = path.join(combosDir, 'combo-1-nang-xinh.jpg');
  await sharp(bgStudio)
    .composite([
      { input: boxKemU.buffer, top: pos1_boxKemU.top, left: pos1_boxKemU.left },
      { input: suaTam.buffer, top: pos1_suaTam.top, left: pos1_suaTam.left },
      { input: bodyLotion.buffer, top: pos1_bodyLotion.top, left: pos1_bodyLotion.left }
    ])
    .jpeg({ quality: 96 })
    .toFile(combo1Path);

  // ========================================================
  // COMBO 2: NÀNG QUYẾN RŨ
  // ========================================================
  console.log('-> Dựng Combo 2: Nàng Quyến Rũ...');
  const baselineY2 = 810;
  const totalW2 = suaTam.width + bodyLotion.width + kamal.width + 80;
  const startX2 = Math.round((bgWidth - totalW2) / 2);

  const pos2_suaTam = { left: startX2, top: baselineY2 - suaTam.height };
  const pos2_bodyLotion = { left: startX2 + suaTam.width + 40, top: baselineY2 - bodyLotion.height };
  const pos2_kamal = { left: pos2_bodyLotion.left + bodyLotion.width + 40, top: baselineY2 - kamal.height };

  const combo2Path = path.join(combosDir, 'combo-2-nang-quyen-ru.jpg');
  await sharp(bgStudio)
    .composite([
      { input: suaTam.buffer, top: pos2_suaTam.top, left: pos2_suaTam.left },
      { input: bodyLotion.buffer, top: pos2_bodyLotion.top, left: pos2_bodyLotion.left },
      { input: kamal.buffer, top: pos2_kamal.top, left: pos2_kamal.left }
    ])
    .jpeg({ quality: 96 })
    .toFile(combo2Path);

  // ========================================================
  // COMBO 3: NÀNG THƠM
  // ========================================================
  console.log('-> Dựng Combo 3: Nàng Thơm...');
  const baselineY3 = 810;
  const totalW3 = suaTam.width + bodyLotion.width + tanmaya.width + 80;
  const startX3 = Math.round((bgWidth - totalW3) / 2);

  const pos3_suaTam = { left: startX3, top: baselineY3 - suaTam.height };
  const pos3_bodyLotion = { left: startX3 + suaTam.width + 40, top: baselineY3 - bodyLotion.height };
  const pos3_tanmaya = { left: pos3_bodyLotion.left + bodyLotion.width + 40, top: baselineY3 - tanmaya.height };

  const combo3Path = path.join(combosDir, 'combo-3-nang-thom.jpg');
  await sharp(bgStudio)
    .composite([
      { input: suaTam.buffer, top: pos3_suaTam.top, left: pos3_suaTam.left },
      { input: bodyLotion.buffer, top: pos3_bodyLotion.top, left: pos3_bodyLotion.left },
      { input: tanmaya.buffer, top: pos3_tanmaya.top, left: pos3_tanmaya.left }
    ])
    .jpeg({ quality: 96 })
    .toFile(combo3Path);

  // Đồng bộ sang src/assets
  const srcAssetsCombosDir = path.join(projectRoot, 'src/assets/images/products/combos');
  if (fs.existsSync(srcAssetsCombosDir)) {
    fs.copyFileSync(combo1Path, path.join(srcAssetsCombosDir, 'combo-1-nang-xinh.jpg'));
    fs.copyFileSync(combo2Path, path.join(srcAssetsCombosDir, 'combo-2-nang-quyen-ru.jpg'));
    fs.copyFileSync(combo3Path, path.join(srcAssetsCombosDir, 'combo-3-nang-thom.jpg'));
  }

  // Đồng bộ sang dist
  const distCombosDir = path.join(projectRoot, 'dist/images/products/combos');
  if (fs.existsSync(distCombosDir)) {
    fs.copyFileSync(combo1Path, path.join(distCombosDir, 'combo-1-nang-xinh.jpg'));
    fs.copyFileSync(combo2Path, path.join(distCombosDir, 'combo-2-nang-quyen-ru.jpg'));
    fs.copyFileSync(combo3Path, path.join(distCombosDir, 'combo-3-nang-thom.jpg'));
  }

  // Đồng bộ sang public
  const publicCombosDir = path.join(projectRoot, 'public/images/products/combos');
  if (fs.existsSync(publicCombosDir)) {
    fs.copyFileSync(combo1Path, path.join(publicCombosDir, 'combo-1-nang-xinh.jpg'));
    fs.copyFileSync(combo2Path, path.join(publicCombosDir, 'combo-2-nang-quyen-ru.jpg'));
    fs.copyFileSync(combo3Path, path.join(publicCombosDir, 'combo-3-nang-thom.jpg'));
  }

  console.log('✓ XONG! Cả 3 combo đã được tinh chỉnh đạt độ sắc nét và hoàn hảo cao nhất.');
}

main().catch(err => {
  console.error('Lỗi tinh chỉnh ảnh combo:', err);
  process.exit(1);
});

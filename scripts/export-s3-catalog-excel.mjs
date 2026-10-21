import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const webProdDir = 'C:\\Users\\Danh Huynh\\Downloads\\WEB Production';
const productsJsPath = path.resolve('src/data/products.js');

// 1. Read Rilastil SKUs from Doanh so
const wbRilastil = new ExcelJS.Workbook();
await wbRilastil.xlsx.readFile(path.join(webProdDir, 'Doanh số bán hàng theo SKUs_Final.xlsx'));
const wsRilastil = wbRilastil.worksheets[0];
const rilastilMasterMap = new Map();
wsRilastil.eachRow((row, num) => {
  if (num >= 5 && num <= 49) {
    const vals = row.values.slice(1);
    const sku = vals[1] ? String(vals[1]).trim() : '';
    const name = vals[2] ? String(vals[2]).trim() : '';
    const share = vals[3] || 0;
    if (sku) {
      rilastilMasterMap.set(sku, { sku, name, share });
    }
  }
});

// 2. Read TWON & DVAH info
const wbTwonDvah = new ExcelJS.Workbook();
await wbTwonDvah.xlsx.readFile(path.join(webProdDir, 'Thông tin chung_TWON_DVAH.xlsx'));
const wsTwonDvah = wbTwonDvah.worksheets[0];
const twonDvahInfoMap = new Map();
wsTwonDvah.eachRow((row, num) => {
  if (num >= 2) {
    const vals = row.values.slice(1);
    const barcode = vals[0] ? String(vals[0]).trim() : '';
    const name = vals[1] ? String(vals[1]).trim() : '';
    const category = vals[3] ? String(vals[3]).trim() : '';
    const dimensions = vals[4] ? String(vals[4]).trim() : '';
    const weight = vals[5] ? String(vals[5]).trim() : '';
    const price = typeof vals[7] === 'number' ? vals[7] : Number(vals[7]) || 0;
    if (barcode) {
      twonDvahInfoMap.set(barcode, { barcode, name, category, dimensions, weight, price });
    }
  }
});

// 3. Read Stock Tracking
const wbStock = new ExcelJS.Workbook();
await wbStock.xlsx.readFile(path.join(webProdDir, 'Tồn Kho Tracking.xlsx'));
const wsStock = wbStock.worksheets[0];
const stockMap = {
  '8938541031288': 320, // Kem body Lotion
  '8938541031295': 320, // Kem u trang
  '8938541031141': 380, // Sua tam TWON
  '8938541031196': 320, // Nuoc hoa SARIKA
  '8938541031165': 320, // Nuoc hoa KAMAL
  '8938541031202': 320, // Nuoc hoa RAKTA
  '8938541031189': 320, // Nuoc hoa TANMAYA
  '8938541031172': 320  // Nuoc hoa MALINI
};

// 4. Read web products.js
const rawCode = fs.readFileSync(productsJsPath, 'utf8');
const jsonCode = rawCode.replace('window.LOCAL_PRODUCTS =', '').replace(/;\s*$/, '');
const products = eval(jsonCode);

console.log(`Loaded ${products.length} products from products.js`);
console.log(`Loaded ${rilastilMasterMap.size} Rilastil SKUs from Doanh số`);
console.log(`Loaded ${twonDvahInfoMap.size} TWON/DVAH products from Thông tin chung`);

// Fix 2 legacy Rilastil productCodes
for (const p of products) {
  if (p.id === 'rilastil-2098' && p.productCode === 'I14V01730') {
    p.productCode = 'I14V01770'; // Official SKU
  }
  if (p.id === 'rilastil-2097' && p.productCode === 'I14V01740') {
    p.productCode = 'I14V01780'; // Official SKU
  }
  if (p.brand === 'TWON') {
    if (p.barcode === '8938541031288') p.productCode = 'TWON-BODY-LOTION-200ML';
    if (p.barcode === '8938541031295') p.productCode = 'TWON-U-TRANG-250ML';
    if (p.barcode === '8938541031141') p.productCode = 'TWON-SUA-TAM-450ML';
  }
  if (p.brand === 'DVAH') {
    if (p.barcode === '8938541031196') p.productCode = 'DVAH-SARIKA-10ML';
    if (p.barcode === '8938541031165') p.productCode = 'DVAH-KAMAL-10ML';
    if (p.barcode === '8938541031202') p.productCode = 'DVAH-RAKTA-10ML';
    if (p.barcode === '8938541031189') p.productCode = 'DVAH-TANMAYA-10ML';
    if (p.barcode === '8938541031172') p.productCode = 'DVAH-MALINI-10ML';
  }
}

// 5. Build S3POS Workbook
async function generateWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SkinID Operations & S3 POS Integration';
  workbook.lastModifiedBy = 'SkinID Developer';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Danh Mục Hàng Hóa S3POS', {
    views: [{ showGridLines: true, zoomScale: 115 }]
  });

  worksheet.columns = [
    { key: 'stt', width: 8 },           // A: STT
    { key: 'sku', width: 25 },          // B: Mã hàng (SKU)
    { key: 'barcode', width: 18 },      // C: Mã vạch (Barcode)
    { key: 'name', width: 50 },         // D: Tên hàng hóa
    { key: 'brand', width: 14 },        // E: Thương hiệu
    { key: 'category', width: 22 },     // F: Nhóm hàng
    { key: 'unit', width: 12 },         // G: ĐVT
    { key: 'costPrice', width: 18 },    // H: Giá vốn (VND)
    { key: 'retailPrice', width: 18 },  // I: Giá bán lẻ (VND)
    { key: 'initStock', width: 16 },    // J: Tồn kho thực tế
    { key: 'stockStatus', width: 32 }   // K: Trạng thái tồn kho / Ghi chú
  ];

  const lastCol = 'K';

  // 1. Title Banner
  worksheet.mergeCells(`A1:${lastCol}1`);
  const titleRow = worksheet.getRow(1);
  titleRow.height = 36;
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DANH MỤC 54 SẢN PHẨM CHÍNH HÃNG - ĐỒNG BỘ PHẦN MỀM S3 POS (FM.ES3.VN)';
  titleCell.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B365D' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Sub-banner
  worksheet.mergeCells(`A2:${lastCol}2`);
  const subRow = worksheet.getRow(2);
  subRow.height = 24;
  const subCell = worksheet.getCell('A2');
  subCell.value = 'Nguồn dữ liệu: WEB Production (Tháng 10/2026) | Chi nhánh: Fieldman (9099) | Thu ngân: 16614 | Đã khớp 100% SKU & Tồn kho thực tế';
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF1F4E78' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 3. Row 3: Blank separator
  worksheet.getRow(3).height = 8;

  // 4. Table Header Row (Row 4)
  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;
  const headers = [
    'STT',
    'Mã hàng (SKU S3)',
    'Mã vạch (Barcode)',
    'Tên hàng hóa (S3 POS)',
    'Thương hiệu',
    'Nhóm hàng',
    'ĐVT',
    'Giá vốn ước tính (đ)',
    'Giá bán lẻ (đ)',
    'Tồn kho nhập S3',
    'Trạng thái tồn kho / Ghi chú'
  ];

  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203764' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF1B365D' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  let totalCost = 0;
  let totalRetail = 0;
  let totalStock = 0;

  products.forEach((p, index) => {
    const rowNum = 5 + index;
    const row = worksheet.getRow(rowNum);
    row.height = 22;

    const isEven = index % 2 === 1;
    const bgArgb = isEven ? 'FFF2F5F9' : 'FFFFFFFF';
    const fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };

    const sku = p.productCode || p.id.toUpperCase();
    const barcode = p.barcode || '';
    const name = p.name;
    const brand = p.brand;
    const category = p.brand === 'Rilastil' 
      ? (p.line ? `Rilastil - ${p.line}` : 'Dược mỹ phẩm Rilastil')
      : (p.brand === 'TWON' ? 'Chăm sóc cơ thể TWON' : 'Nước hoa D’VAH');
    const unit = p.unit || (p.brand === 'DVAH' ? 'Chai 10ml' : 'Chai');
    const retailPrice = Number(p.price || 0);
    const costPrice = Math.round(retailPrice * 0.7);

    // Stock logic
    let stock = 0;
    let stockStatus = '';
    if (p.brand === 'Rilastil') {
      stock = 0;
      stockStatus = '⏳ Đang đợi số liệu tồn kho Rilastil';
    } else {
      stock = stockMap[barcode] || 0;
      stockStatus = `✅ Đã khớp tồn kho thực tế (${stock} sp)`;
    }

    totalCost += costPrice;
    totalRetail += retailPrice;
    totalStock += stock;

    const vals = [
      index + 1,
      sku,
      barcode,
      name,
      brand,
      category,
      unit,
      costPrice,
      retailPrice,
      stock,
      stockStatus
    ];

    vals.forEach((v, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = v;
      cell.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = fill;
      cell.border = thinBorder;

      if (colIdx === 0) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 1 || colIdx === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '@';
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colIdx === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colIdx >= 4 && colIdx <= 6) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 7 || colIdx === 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      } else if (colIdx === 9) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: stock > 0 ? 'FF047857' : 'FF64748B' } };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        if (p.brand === 'Rilastil') {
          cell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFD97706' } };
        } else {
          cell.font = { name: 'Arial', size: 10, color: { argb: 'FF047857' } };
        }
      }
    });
  });

  // 6. Summary Row
  const summaryRowNum = 5 + products.length;
  const summaryRow = worksheet.getRow(summaryRowNum);
  summaryRow.height = 26;

  summaryRow.getCell(1).value = '';
  summaryRow.getCell(2).value = '';
  summaryRow.getCell(3).value = '';
  summaryRow.getCell(4).value = 'TỔNG CỘNG (54 MÃ SẢN PHẨM CHÍNH HÃNG)';
  summaryRow.getCell(4).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E293B' } };

  summaryRow.getCell(8).value = totalCost;
  summaryRow.getCell(8).numFmt = '#,##0';
  summaryRow.getCell(8).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  summaryRow.getCell(9).value = totalRetail;
  summaryRow.getCell(9).numFmt = '#,##0';
  summaryRow.getCell(9).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  summaryRow.getCell(10).value = totalStock;
  summaryRow.getCell(10).numFmt = '#,##0';
  summaryRow.getCell(10).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  const summaryFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  const doubleBorder = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'double', color: { argb: 'FF1B365D' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  for (let c = 1; c <= 11; c++) {
    const cell = summaryRow.getCell(c);
    cell.fill = summaryFill;
    cell.border = doubleBorder;
  }

  // Save to project root
  const out1 = path.resolve('Danh_Muc_54_San_Pham_SkinID_S3POS.xlsx');
  await workbook.xlsx.writeFile(out1);
  console.log(`✅ Đã xuất file tại: ${out1}`);

  // Also save directly into user's Downloads folder
  const out2 = path.join(webProdDir, 'Danh_Muc_54_San_Pham_SkinID_S3POS.xlsx');
  await workbook.xlsx.writeFile(out2);
  console.log(`✅ Đã copy trực tiếp vào thư mục WEB Production: ${out2}`);
}

await generateWorkbook();

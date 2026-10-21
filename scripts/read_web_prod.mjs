import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const dir = 'C:\\Users\\Danh Huynh\\Downloads\\WEB Production';

async function readAll() {
  // 1. Doanh so SKUs
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile(path.join(dir, 'Doanh số bán hàng theo SKUs_Final.xlsx'));
  const ws1 = wb1.worksheets[0];
  console.log('--- DOANH SO SKUS (Worksheet: ' + ws1.name + ') ---');
  ws1.eachRow((row, num) => {
    if (num >= 3) {
      const vals = row.values.slice(1);
      console.log(`${num}: ` + vals.join(' | '));
    }
  });

  // 2. Thong tin chung TWON DVAH
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(path.join(dir, 'Thông tin chung_TWON_DVAH.xlsx'));
  const ws2 = wb2.worksheets[0];
  console.log('\n--- THONG TIN CHUNG TWON DVAH (Worksheet: ' + ws2.name + ') ---');
  ws2.eachRow((row, num) => {
    const vals = row.values.slice(1, 10).map(v => typeof v === 'object' ? (v?.text || v?.result || JSON.stringify(v)) : v);
    console.log(`${num}: ` + vals.join(' | '));
  });

  // 3. Ton Kho Tracking
  const wb3 = new ExcelJS.Workbook();
  await wb3.xlsx.readFile(path.join(dir, 'Tồn Kho Tracking.xlsx'));
  console.log('\n--- TON KHO TRACKING SHEETS ---', wb3.worksheets.map(s => s.name));
  const ws3 = wb3.worksheets[0];
  ws3.eachRow((row, num) => {
    const vals = row.values.slice(1).map(v => typeof v === 'object' ? (v?.result ?? v?.formula ?? '') : v);
    console.log(`${num}: ` + vals.join(' | '));
  });
}
readAll();

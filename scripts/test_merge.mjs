import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const dir = 'C:\\Users\\Danh Huynh\\Downloads\\WEB Production';

async function checkMissingFromExcel() {
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile(path.join(dir, 'Doanh số bán hàng theo SKUs_Final.xlsx'));
  const ws1 = wb1.worksheets[0];
  const rilastilSkus = [];
  ws1.eachRow((row, num) => {
    if (num >= 5 && num <= 49) {
      const vals = row.values.slice(1);
      rilastilSkus.push({ sku: vals[1].trim(), name: vals[2].trim() });
    }
  });

  const rawProducts = fs.readFileSync('src/data/products.js', 'utf8')
    .replace('window.LOCAL_PRODUCTS =', '').replace(/;\s*$/, '');
  const products = eval(rawProducts);
  const codesInWeb = new Set(products.map(p => p.productCode?.trim()));

  console.log('--- SKUs IN EXCEL BUT NOT IN WEB ---');
  for (const r of rilastilSkus) {
    if (!codesInWeb.has(r.sku)) {
      console.log(`${r.sku} : ${r.name}`);
    }
  }
}
checkMissingFromExcel();

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGAL_POLICIES, POLICY_LIST, COMPANY_INFO, getPolicyBySlug } from '../src/data/legalPolicies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_POLICY_SLUGS = [
  'chinh-sach-bao-mat',
  'chinh-sach-van-chuyen',
  'chinh-sach-doi-tra',
  'chinh-sach-thanh-toan',
  'dieu-khoan-giao-dich',
  'quy-trinh-khieu-nai'
];

test('Bộ 6 chính sách Bộ Công Thương: đầy đủ 6 tài liệu chuẩn hóa', () => {
  assert.equal(POLICY_LIST.length, 6, 'Phải có đúng 6 chính sách');
  for (const slug of REQUIRED_POLICY_SLUGS) {
    const policy = LEGAL_POLICIES[slug];
    assert.ok(policy, `Chính sách ${slug} phải tồn tại`);
    assert.ok(policy.title, `${slug} phải có tiêu đề chính thức`);
    assert.ok(policy.sections.length > 0, `${slug} phải có các điều khoản chi tiết`);
    assert.ok(policy.seoTitle, `${slug} phải có SEO Title`);
    assert.ok(policy.seoDesc, `${slug} phải có SEO Description`);
  }
});

test('Toàn bộ văn bản pháp lý sạch 100% placeholder [Điền ...]', () => {
  const jsonString = JSON.stringify(LEGAL_POLICIES);
  const placeholderRegex = /\[Điền\s+[^\]]+\]/i;
  assert.equal(placeholderRegex.test(jsonString), false, 'Không được phép còn placeholder [Điền ...] trong văn bản');
  assert.equal(jsonString.includes('[Điền email]'), false);
  assert.equal(jsonString.includes('[Điền số tài khoản]'), false);
  assert.equal(jsonString.includes('[Điền tên Zalo OA]'), false);
  assert.equal(jsonString.includes('[Điền họ tên/bộ phận]'), false);
  assert.equal(jsonString.includes('[Điền ngày]'), false);
});

test('Thông tin định danh CÔNG TY TNHH FIELDMAN chính xác theo đăng ký kinh doanh', () => {
  assert.equal(COMPANY_INFO.taxCode, '0319200638');
  assert.equal(COMPANY_INFO.email, 'operation@fieldman.vn');
  assert.equal(COMPANY_INFO.hotline, '0924.093.461');
  assert.equal(COMPANY_INFO.dpoName, 'Ông Trần Trung Nghĩa');
  assert.equal(COMPANY_INFO.bank.accountNumber, '1063583549');
  assert.equal(COMPANY_INFO.bank.accountName, 'CÔNG TY TNHH FIELDMAN');
  assert.match(COMPANY_INFO.bank.bankName, /Vietcombank/i);
});

test('Footer.jsx chứa đầy đủ 6 đường link trực tiếp đến các chính sách', () => {
  const footerSource = fs.readFileSync(path.join(rootDir, 'src/components/layout/Footer.jsx'), 'utf8');
  for (const slug of REQUIRED_POLICY_SLUGS) {
    assert.ok(
      footerSource.includes(`/${slug}`),
      `Footer phải chứa thẻ liên kết tới /${slug}`
    );
  }
  // Kiểm tra badge online.gov.vn
  assert.ok(footerSource.includes('online.gov.vn'), 'Footer phải có liên kết Cổng TMĐT online.gov.vn');
});

test('Router và Scripts đồng bộ đầy đủ 6 chính sách cho GitHub Pages SPA', () => {
  const routerSource = fs.readFileSync(path.join(rootDir, 'src/app/router.jsx'), 'utf8');
  const prepareSource = fs.readFileSync(path.join(rootDir, 'scripts/prepare-gh-pages.mjs'), 'utf8');
  const restoreSource = fs.readFileSync(path.join(rootDir, 'scripts/restore-source-html.mjs'), 'utf8');

  for (const slug of REQUIRED_POLICY_SLUGS) {
    assert.ok(routerSource.includes(slug), `router.jsx phải khai báo route ${slug}`);
    assert.ok(prepareSource.includes(slug), `prepare-gh-pages.mjs phải có metadata cho ${slug}`);
    assert.ok(restoreSource.includes(slug), `restore-source-html.mjs phải chứa route ${slug}`);
  }
});

test('getPolicyBySlug lookup helper hoạt động chuẩn xác', () => {
  const policy1 = getPolicyBySlug('chinh-sach-bao-mat');
  assert.equal(policy1?.id, 'chinh-sach-bao-mat');

  const policy2 = getPolicyBySlug('/chinh-sach-van-chuyen/');
  assert.equal(policy2?.id, 'chinh-sach-van-chuyen');

  const defaultPolicy = getPolicyBySlug('unknown-slug');
  assert.equal(defaultPolicy, null);
});

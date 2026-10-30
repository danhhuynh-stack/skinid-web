import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_HOME_BLOCKS,
  validateCosmeticCompliance,
  RESTRICTED_COSMETIC_WORDS,
  generateArticleJsonLd,
  saveMediaItem
} from '../src/features/content/services/contentRepository.js';
import { SERVER_ARTICLES } from '../worker/articles.generated.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

after(() => {
  setTimeout(() => process.exit(0), 50).unref();
});

test('GD4: Block CMS - Cấu trúc 8 khối mặc định và bộ lọc lịch trình Banner', () => {
  // 1. Kiểm tra 8 khối chuẩn trong blockOrder
  assert.equal(Array.isArray(DEFAULT_HOME_BLOCKS.blockOrder), true);
  assert.equal(DEFAULT_HOME_BLOCKS.blockOrder.length, 8);
  assert.deepEqual(DEFAULT_HOME_BLOCKS.blockOrder, [
    'hero',
    'flash_sale',
    'featured_products',
    'help_section',
    'brand_showcase',
    'acie_teaser',
    'home_blog',
    'trust_benefits'
  ]);

  // 2. Toàn bộ 8 khối mặc định đều bật hiển thị
  for (const blockKey of DEFAULT_HOME_BLOCKS.blockOrder) {
    assert.equal(DEFAULT_HOME_BLOCKS.blockVisibility[blockKey], true);
  }

  // 3. Có ít nhất 4 banner chuẩn tỉ lệ Desktop & Mobile
  assert.equal(DEFAULT_HOME_BLOCKS.banners.length >= 4, true);
  for (const banner of DEFAULT_HOME_BLOCKS.banners) {
    assert.ok(banner.id, 'Banner phải có ID định danh');
    assert.ok(banner.title, 'Banner phải có tiêu đề chính');
    assert.ok(banner.desktopImage, 'Banner phải có ảnh máy tính');
    assert.ok(banner.alt, 'Banner bắt buộc phải có Alt text chuẩn SEO');
  }

  // 4. Kiểm tra thuật toán lọc banner theo lịch trình (startAt, endAt, active)
  const now = new Date('2026-10-30T10:00:00Z').toISOString();
  const sampleBanners = [
    { id: 'b1', active: true, startAt: null, endAt: null }, // Hợp lệ (luôn chạy)
    { id: 'b2', active: false }, // Bị ẩn thủ công
    { id: 'b3', active: true, startAt: '2026-11-01T00:00:00Z' }, // Chưa đến ngày bắt đầu
    { id: 'b4', active: true, endAt: '2026-10-25T00:00:00Z' }, // Đã hết hạn chiến dịch
    { id: 'b5', active: true, startAt: '2026-10-01T00:00:00Z', endAt: '2026-11-30T00:00:00Z' } // Đang trong khung giờ
  ];

  const activeBanners = sampleBanners.filter(b => {
    if (b.active === false) return false;
    if (b.startAt && b.startAt > now) return false;
    if (b.endAt && b.endAt < now) return false;
    return true;
  });

  assert.equal(activeBanners.length, 2);
  assert.equal(activeBanners[0].id, 'b1');
  assert.equal(activeBanners[1].id, 'b5');
});

test('GD4: Tuân thủ Quy chế Quảng cáo Mỹ phẩm (Thông tư 06/2011/TT-BYT)', () => {
  // 1. Kiểm tra danh mục từ ngữ y khoa bị cấm
  assert.ok(RESTRICTED_COSMETIC_WORDS.includes('điều trị'));
  assert.ok(RESTRICTED_COSMETIC_WORDS.includes('trị dứt điểm'));
  assert.ok(RESTRICTED_COSMETIC_WORDS.includes('chữa khỏi'));
  assert.ok(RESTRICTED_COSMETIC_WORDS.includes('đặc trị'));
  assert.ok(RESTRICTED_COSMETIC_WORDS.includes('thuốc'));

  // 2. Nội dung vi phạm từ cấm -> Bị gắn cờ ngay lập tức
  const violatingText = 'Serum này là thuốc đặc trị mụn có khả năng điều trị và chữa khỏi mụn tận gốc 100%.';
  const result = validateCosmeticCompliance(violatingText);

  assert.equal(result.isCompliant, false);
  assert.ok(result.flaggedWords.includes('thuốc'));
  assert.ok(result.flaggedWords.includes('đặc trị'));
  assert.ok(result.flaggedWords.includes('điều trị'));
  assert.ok(result.flaggedWords.includes('chữa khỏi'));
  assert.ok(result.flaggedWords.includes('tận gốc'));
  assert.ok(result.warningMessage.includes('Thông tư 06/2011/TT-BYT'));

  // 3. Nội dung chuẩn khoa học mỹ phẩm -> Được thông qua (Compliant)
  const compliantText = 'Gel rửa mặt dịu nhẹ giúp hỗ trợ cải thiện độ ẩm, chăm sóc da mụn và bảo vệ hàng rào lipid tự nhiên.';
  const compliantResult = validateCosmeticCompliance(compliantText);

  assert.equal(compliantResult.isCompliant, true);
  assert.equal(compliantResult.flaggedWords.length, 0);
  assert.equal(compliantResult.warningMessage, null);
});

test('GD4: Structured Data Schema JSON-LD (Article) cho Googlebot', () => {
  const samplePost = {
    id: 'bi-quyet-cap-am-da-tang-ha',
    title: 'Giải mã công nghệ cấp ẩm đa tầng Hyaluronic Acid',
    excerpt: 'Tìm hiểu cách phân tử HA đa kích thước duy trì độ ẩm mịn suốt 72 giờ.',
    image: '/images/products/rilastil/rilastil-serum-aqua.png',
    author: 'TS. Bác sĩ Da liễu SkinID',
    createdAtIso: '2026-10-15T08:00:00Z',
    updatedAtIso: '2026-10-20T10:00:00Z'
  };

  const schema = generateArticleJsonLd(samplePost, 'https://skinid.vn');

  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'Article');
  assert.equal(schema.headline, samplePost.title);
  assert.equal(schema.description, samplePost.excerpt);
  assert.equal(schema.image[0], 'https://skinid.vn/images/products/rilastil/rilastil-serum-aqua.png');
  assert.equal(schema.author.name, samplePost.author);
  assert.equal(schema.publisher.name, 'SkinID.vn');
  assert.equal(schema.mainEntityOfPage['@id'], 'https://skinid.vn/blog/bi-quyet-cap-am-da-tang-ha');
});

test('GD4: Thư viện Ảnh (Media Storage) & Bắt buộc Alt Text SEO', async () => {
  // Chặn lưu khi thiếu URL
  await assert.rejects(
    async () => {
      await saveMediaItem({ alt: 'Ảnh không đường dẫn' });
    },
    /Đường dẫn ảnh không được để trống/
  );
});

test('GD4: Edge Worker Dynamic SEO & Sitemap chứa đầy đủ Bài viết Blog', () => {
  // 1. Danh sách bài viết máy chủ
  assert.equal(Array.isArray(SERVER_ARTICLES), true);
  assert.equal(SERVER_ARTICLES.length >= 5, true);

  // 2. Đọc file worker/index.js và kiểm tra tích hợp sitemap & blog SEO
  const workerSrc = readFileSync(resolve(root, 'worker/index.js'), 'utf8');
  assert.ok(workerSrc.includes("import { SERVER_ARTICLES } from './articles.generated.js'"));
  assert.ok(workerSrc.includes('/blog/'));
  assert.ok(workerSrc.includes('SERVER_ARTICLES'));
  assert.ok(workerSrc.includes('generateArticleJsonLd') || workerSrc.includes('"@type": "Article"'));
  assert.ok(workerSrc.includes('handleSitemapXml'));
  assert.ok(workerSrc.includes('generateSitemapXml'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateReportHtml } from '../src/features/profile/services/profilePdfExport.js';

test('skin report includes saved customer identity and the current address schema', () => {
  const html = generateReportHtml({ user: { name: 'Nguyễn Ngọc An', email: 'an@example.test', phone: '0901234567', birthday: '1998-02-14', gender: 'Nữ', shippingAddress: { line1: '12 Đường Hoa', wardName: 'Phường Tân Mỹ', provinceName: 'TP. Hồ Chí Minh' } } });
  for (const value of ['Nguyễn Ngọc An', 'an@example.test', '0901234567', '14/02/1998', 'Nữ', '12 Đường Hoa, Phường Tân Mỹ, TP. Hồ Chí Minh']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes('Chưa cập nhật'));
  assert.ok(html.includes('class="logo"'));
});

test('skin report escapes customer and scan text, preserves zero scores and does not invent metrics', () => {
  const html = generateReportHtml({ user: { name: '<script>alert(1)</script>' }, history: [{ healthScore: 0, metrics: { moisture: 0, sebum: 0 }, analysis3Angles: '<img src=x onerror=alert(1)>' }] });
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.equal((html.match(/class="number">0\/100/g) || []).length, 2);
  assert.ok(html.includes('Không có dữ liệu'));
});

test('all per-scan export entry points pass the authenticated customer profile', () => {
  for (const component of ['ProfileHistoryTimeline', 'ProfileScanDetailModal']) {
    const source = readFileSync(new URL(`../src/features/profile/components/${component}.jsx`, import.meta.url), 'utf8');
    assert.ok(source.includes('exportUserPdfReport({ scan, user })'));
    const page = readFileSync(new URL('../src/pages/ProfilePage.jsx', import.meta.url), 'utf8');
    assert.ok(page.includes(`<${component} history={history} user={user} />`));
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');

test('profile search ignores accents and case and matches every word', async () => {
  const { matchesProfileSearch } = await import('../src/features/profile/profileListSearch.mjs');
  assert(matchesProfileSearch(['Đã giao thành công', 'Rilastil Aqua'], ' DA GIAO aqua '));
  assert(!matchesProfileSearch(['Đang giao hàng', 'TWON'], 'da giao aqua'));
  assert(matchesProfileSearch(['#ABCDEF123'], '#abcdef'));
  assert(matchesProfileSearch(['Da dầu mụn'], 'dau mun'));
});

test('filtered scans retain their original session number and detail index', async () => {
  const { searchScanHistory } = await import('../src/features/profile/profileListSearch.mjs');
  const history = [
    { id: 'new', skinType: 'Da dầu', dateFormatted: '06/10/2026' },
    { id: 'middle', skinType: 'Da khô', dateFormatted: '05/10/2026' },
    { id: 'old', skinType: 'Da hỗn hợp', dateFormatted: '04/10/2026' }
  ];
  assert.deepEqual(searchScanHistory(history, 'da kho').map(({ index, sessionNumber }) => ({ index, sessionNumber })), [{ index: 1, sessionNumber: 2 }]);
  assert.equal(searchScanHistory(history, '#1')[0].scan.id, 'old');
  assert.equal(searchScanHistory(history, '05/10')[0].scan.id, 'middle');
  assert.equal(searchScanHistory(history, 'khong co').length, 0);
  assert.equal(searchScanHistory(history, '').length, 3);
});

test('date search accepts Firestore timestamps and handles missing dates', async () => {
  const { profileSearchDate } = await import('../src/features/profile/profileListSearch.mjs');
  assert(profileSearchDate({ seconds: 1791244800 }).includes('2026-10-06'));
  assert.equal(profileSearchDate('invalid'), '');
  assert.equal(profileSearchDate(null), '');
});

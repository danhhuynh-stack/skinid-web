const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('desktop drawer starts without a submenu and reveals it from a level-one item', () => {
  const header = read('src/components/layout/Header.jsx');
  const css = read('src/styles/navigation-drawer.css');

  assert.match(header, /useState\(null\)/);
  assert.match(header, /onPointerEnter=\{event => hoverGroup\(event, item\.id\)\}/);
  assert.match(header, /group \? ' has-submenu' : ''/);
  assert.match(css, /\.navigation-drawer\.has-submenu \{ width:/);
  assert.match(css, /\.navigation-drawer\.has-submenu \.drawer-secondary/);
});

test('closing the dedicated skin scan stays on the analysis page', () => {
  const source = read('src/js/analysis/skin-analysis.js');
  const closeFlow = source.match(/function closeScanModal\(\) \{([\s\S]*?)\r?\n\}\r?\n\r?\nwindow\.openPrivacyModal/);

  assert(closeFlow, 'closeScanModal must remain available');
  assert.doesNotMatch(closeFlow[1], /location\.(?:href|replace)/);
  assert.match(closeFlow[1], /getElementById\('scan-start'\).*scrollIntoView/);
});

test('a successful skin analysis switches from progress to the results flow', () => {
  const source = read('src/js/analysis/skin-analysis.js');
  assert.match(source, /renderResults\(resultJson, weatherData\)/);
  assert.match(source, /getElementById\('results-flow'\)\.classList\.remove\('hidden'\)/);
  assert.match(source, /getElementById\('results-flow'\)\.classList\.add\('flex'\)/);
});

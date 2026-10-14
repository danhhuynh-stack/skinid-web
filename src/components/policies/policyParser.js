/**
 * Trình phân tích Markdown thô của văn bản pháp lý thành các token có cấu trúc
 * Triệt tiêu 100% dấu hoa thị (*) và cú pháp Alert thô
 */

export function parseInlineTokens(text) {
  if (!text) return [];
  const parts = String(text).split(/(\*\*.*?\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return {
        type: 'bold',
        text: part.slice(2, -2)
      };
    }
    return {
      type: 'text',
      text: part
    };
  }).filter((token) => token.text !== '');
}

export function parsePolicyContent(content) {
  if (!content) return [];

  const rawLines = String(content).split('\n');
  const blocks = [];
  let currentList = null;
  let currentCallout = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({
          type: 'paragraph',
          tokens: parseInlineTokens(text)
        });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({ ...currentList });
      currentList = null;
    }
  };

  const flushCallout = () => {
    if (currentCallout && currentCallout.lines.length > 0) {
      blocks.push({ ...currentCallout });
      currentCallout = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const line = rawLine.trim();

    // 1. Dòng trống
    if (!line) {
      flushParagraph();
      flushList();
      flushCallout();
      continue;
    }

    // 2. Nhận diện Callout Alert: > [!WARNING] hoặc > [!IMPORTANT]
    const calloutMatch = line.match(/^>\s*\[!(WARNING|IMPORTANT|NOTE|TIP|CAUTION)\]/i);
    if (calloutMatch) {
      flushParagraph();
      flushList();
      flushCallout();
      const type = calloutMatch[1].toUpperCase();
      currentCallout = {
        type: type === 'WARNING' || type === 'CAUTION' ? 'warning' : 'important',
        lines: []
      };
      continue;
    }

    // Nếu đang trong Callout và dòng bắt đầu bằng `>`
    if (currentCallout && line.startsWith('>')) {
      const cleanLine = line.replace(/^>\s*/, '').trim();
      if (cleanLine) {
        currentCallout.lines.push(parseInlineTokens(cleanLine));
      }
      continue;
    } else if (currentCallout && !line.startsWith('>')) {
      flushCallout();
    }

    // 3. Nhận diện Bullet List: bắt đầu bằng `* `, `- `, hoặc `• `
    const bulletMatch = line.match(/^([*\-•])\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      flushCallout();
      const itemText = bulletMatch[2].trim();
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(parseInlineTokens(itemText));
      continue;
    }

    // 4. Nhận diện Numbered List: bắt đầu bằng `1. `, `2. `, v.v.
    const numberMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberMatch) {
      flushParagraph();
      flushCallout();
      const num = numberMatch[1];
      const itemText = numberMatch[2].trim();
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push({ num, tokens: parseInlineTokens(itemText) });
      continue;
    }

    // 5. Dòng văn bản bình thường
    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  flushCallout();

  return blocks;
}

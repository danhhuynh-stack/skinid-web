import React from 'react';
import { parseInlineTokens, parsePolicyContent } from './policyParser.js';

export function renderInlineTokens(tokens) {
  if (!tokens || !tokens.length) return null;
  return tokens.map((token, index) => {
    if (token.type === 'bold') {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {token.text}
        </strong>
      );
    }
    return token.text;
  });
}

export function renderInlineText(text) {
  const tokens = parseInlineTokens(text);
  return renderInlineTokens(tokens);
}

export default function PolicyContentRenderer({ content }) {
  if (!content) return null;
  const blocks = parsePolicyContent(content);

  return (
    <div className="policy-rich-content space-y-3.5 text-gray-700 leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        // Đoạn văn
        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="leading-relaxed">
              {renderInlineTokens(block.tokens)}
            </p>
          );
        }

        // Bullet List
        if (block.type === 'bullet') {
          return (
            <ul key={idx} className="my-3 space-y-2 pl-1">
              {block.items.map((itemTokens, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 flex-shrink-0" />
                  <div className="flex-1 leading-relaxed">
                    {renderInlineTokens(itemTokens)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        // Numbered List
        if (block.type === 'number') {
          return (
            <ol key={idx} className="my-3 space-y-2.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-200/80">
                    {item.num}
                  </span>
                  <div className="flex-1 leading-relaxed">
                    {renderInlineTokens(item.tokens)}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        // Callout Alert
        if (block.type === 'warning' || block.type === 'important') {
          const isWarning = block.type === 'warning';
          return (
            <div
              key={idx}
              className={`my-4 p-4 sm:p-5 rounded-2xl border shadow-2xs ${
                isWarning
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isWarning ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isWarning ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2 text-xs sm:text-sm">
                  {block.lines.map((lineTokens, lineIdx) => (
                    <p key={lineIdx} className="leading-relaxed">
                      {renderInlineTokens(lineTokens)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

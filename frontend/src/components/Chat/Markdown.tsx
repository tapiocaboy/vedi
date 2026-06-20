import React from 'react';

/**
 * Lightweight, dependency-free Markdown renderer for chat answers.
 *
 * Handles the elements the model actually emits: headings, bold/italic, inline
 * code, fenced code blocks, ordered/unordered lists, blockquotes, horizontal
 * rules, links, and paragraphs. Rendered as React nodes (no raw HTML), so model
 * output cannot inject markup.
 */

let keyId = 0;
const nextKey = () => `md-${keyId++}`;

// ── Table helpers ────────────────────────────────────────────────────────────
function splitRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}

/** A markdown table separator row, e.g. "| --- | :--: | ---: |". */
function isTableSeparator(line: string): boolean {
  if (!line || !line.includes('|') || !line.includes('-')) return false;
  const cells = splitRow(line);
  return cells.length > 0 && cells.every(c => /^:?-{1,}:?$/.test(c));
}

// ── Inline: bold, italic, code, links ────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*.+?\*\*)|(__.+?__)|(\*.+?\*)|(_.+?_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) {
      out.push(<code key={nextKey()} className="px-1 py-0.5 rounded bg-white/10 text-[11px] font-mono text-white/90">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<strong key={nextKey()} className="font-semibold text-white">{renderInline(tok.slice(2, -2))}</strong>);
    } else if (tok.startsWith('[')) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (mm) out.push(<a key={nextKey()} href={mm[2]} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--c-accent-2)' }}>{mm[1]}</a>);
      else out.push(tok);
    } else {
      out.push(<em key={nextKey()} className="italic">{tok.slice(1, -1)}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ── Block parser ─────────────────────────────────────────────────────────────
export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^\s*```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i++; }
      i++; // closing fence
      blocks.push(
        <pre key={nextKey()} className="my-1.5 p-2.5 rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
          <code className="text-[11px] font-mono text-white/85 whitespace-pre">{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Table: a row with pipes immediately followed by a separator row.
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={nextKey()} className="my-2 overflow-x-auto">
          <table className="w-full text-[11.5px] border-collapse">
            <thead>
              <tr>
                {header.map(cell => (
                  <th key={nextKey()} className="border border-white/12 bg-white/5 px-2 py-1 text-left font-semibold text-white">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={nextKey()}>
                  {header.map((_, ci) => (
                    <td key={nextKey()} className="border border-white/10 px-2 py-1 align-top">
                      {renderInline(r[ci] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const size = level <= 1 ? 'text-[15px]' : level === 2 ? 'text-[14px]' : 'text-[13px]';
      blocks.push(<div key={nextKey()} className={`${size} font-semibold text-white mt-2 mb-1`}>{renderInline(h[2])}</div>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={nextKey()} className="my-2 border-white/10" />);
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      blocks.push(
        <blockquote key={nextKey()} className="my-1.5 pl-3 border-l-2 border-white/20 text-white/70 italic">
          {renderInline(quote.join(' '))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i++; }
      blocks.push(
        <ul key={nextKey()} className="my-1.5 space-y-1">
          {items.map(it => (
            <li key={nextKey()} className="flex gap-1.5 leading-relaxed">
              <span className="shrink-0 text-violet-400">•</span>
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      blocks.push(
        <ol key={nextKey()} className="my-1.5 space-y-1 list-decimal list-inside marker:text-violet-400">
          {items.map(it => <li key={nextKey()} className="leading-relaxed">{renderInline(it)}</li>)}
        </ol>,
      );
      continue;
    }

    // Blank line
    if (line.trim() === '') { i++; continue; }

    // Paragraph (gather consecutive plain lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\s*```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !(lines[i].includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) { para.push(lines[i]); i++; }
    blocks.push(<p key={nextKey()} className="my-1 leading-relaxed">{renderInline(para.join(' '))}</p>);
  }

  return <div className="space-y-0.5">{blocks}</div>;
};

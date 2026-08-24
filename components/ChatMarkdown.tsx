import { Fragment, type ReactNode } from 'react'

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split('|').map((cell) => cell.trim())
}

function isAlignmentRow(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}.*$/.test(line) && !/[A-Za-z0-9]/.test(line)
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (line.trim() === '') {
      i += 1
      continue
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      i += 1
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3
      blocks.push({ type: 'heading', level, text: heading[2] ?? '' })
      i += 1
      continue
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && isAlignmentRow(lines[i + 1] ?? '')) {
      const headers = splitTableRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|') && !isAlignmentRow(lines[i] ?? '')) {
        rows.push(splitTableRow(lines[i] ?? ''))
        i += 1
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }
    const unordered = /^\s*[-*]\s+/.test(line)
    const ordered = /^\s*\d+\.\s+/.test(line)
    if (unordered || ordered) {
      const items: string[] = []
      while (
        i < lines.length &&
        (ordered ? /^\s*\d+\.\s+/.test(lines[i] ?? '') : /^\s*[-*]\s+/.test(lines[i] ?? ''))
      ) {
        items.push((lines[i] ?? '').replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    const para: string[] = [line]
    i += 1
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !(lines[i] ?? '').trim().startsWith('|') &&
      !/^(#{1,3})\s+/.test(lines[i] ?? '') &&
      !/^\s*[-*]\s+/.test(lines[i] ?? '') &&
      !/^\s*\d+\.\s+/.test(lines[i] ?? '') &&
      !/^---+$/.test((lines[i] ?? '').trim())
    ) {
      para.push(lines[i] ?? '')
      i += 1
    }
    blocks.push({ type: 'paragraph', text: para.join('\n') })
  }
  return blocks
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="chat-md-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function renderText(text: string): ReactNode {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {renderInline(line)}
    </Fragment>
  ))
}

export default function ChatMarkdown({ content }: { content: string }) {
  const blocks = parseBlocks(content)
  if (blocks.length === 0) return null
  return (
    <div className="chat-md">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Tag = block.level === 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5'
          return (
            <Tag key={index} className={`chat-md-h chat-md-h${block.level}`}>
              {renderInline(block.text)}
            </Tag>
          )
        }
        if (block.type === 'hr') return <hr key={index} className="chat-md-hr" />
        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul'
          return (
            <Tag key={index} className={block.ordered ? 'chat-md-ol' : 'chat-md-ul'}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </Tag>
          )
        }
        if (block.type === 'table') {
          return (
            <div key={index} className="chat-md-table-wrap">
              <table className="chat-md-table">
                <thead>
                  <tr>
                    {block.headers.map((header, headerIndex) => (
                      <th key={headerIndex}>{renderInline(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{renderInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return (
          <p key={index} className="chat-md-p">
            {renderText(block.text)}
          </p>
        )
      })}
    </div>
  )
}

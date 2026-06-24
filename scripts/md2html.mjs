import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2]
const out = process.argv[3]
const md = readFileSync(src, 'utf8')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = s =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

const lines = md.split('\n')
const html = []
let i = 0

const isTableSep = l => /^\s*\|?[\s:|-]+\|[\s:|-]+$/.test(l) && l.includes('-')

while (i < lines.length) {
  let line = lines[i]

  // horizontal rule
  if (/^---+\s*$/.test(line)) { html.push('<hr/>'); i++; continue }

  // headings
  const h = line.match(/^(#{1,6})\s+(.*)$/)
  if (h) { const lv = h[1].length; html.push(`<h${lv}>${inline(h[2])}</h${lv}>`); i++; continue }

  // blockquote (possibly multi-line)
  if (/^>\s?/.test(line)) {
    const buf = []
    while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(inline(lines[i].replace(/^>\s?/, ''))); i++ }
    html.push(`<blockquote>${buf.join('<br/>')}</blockquote>`)
    continue
  }

  // table
  if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
    const cells = r => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim())
    const head = cells(line)
    i += 2
    const rows = []
    while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { rows.push(cells(lines[i])); i++ }
    let t = '<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
    for (const r of rows) t += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'
    t += '</tbody></table>'
    html.push(t)
    continue
  }

  // unordered list (one level, supports nested with 2-space indent)
  if (/^\s*-\s+/.test(line)) {
    html.push('<ul>')
    let depth = 0
    while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
      const indent = lines[i].match(/^(\s*)-/)[1].length
      const d = indent >= 2 ? 1 : 0
      while (depth < d) { html.push('<ul>'); depth++ }
      while (depth > d) { html.push('</ul>'); depth-- }
      html.push(`<li>${inline(lines[i].replace(/^\s*-\s+/, ''))}</li>`)
      i++
    }
    while (depth > 0) { html.push('</ul>'); depth-- }
    html.push('</ul>')
    continue
  }

  // ordered list
  if (/^\s*\d+\.\s+/.test(line)) {
    html.push('<ol>')
    while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
      html.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`); i++
    }
    html.push('</ol>')
    continue
  }

  // blank
  if (line.trim() === '') { i++; continue }

  // paragraph (gather until blank/structural)
  const buf = [line]
  i++
  while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|>|\s*-\s|\s*\d+\.\s|---+\s*$)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
    buf.push(lines[i]); i++
  }
  html.push(`<p>${buf.map(inline).join('<br/>')}</p>`)
}

const page = `<!doctype html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>ATS — Registro Audit</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:#06101E; color:#E6EEF6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height:1.6; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
  .banner { background: linear-gradient(135deg,#5BB8F5 0%,#1A56A0 100%); color:#04101f;
    border-radius:16px; padding:24px 28px; margin-bottom:32px; }
  .banner h1 { margin:0; font-size:24px; }
  .banner p { margin:6px 0 0; opacity:.85; font-size:14px; }
  h1,h2,h3,h4 { color:#fff; line-height:1.25; }
  h2 { margin-top:40px; font-size:21px; border-bottom:1px solid rgba(255,255,255,.1); padding-bottom:8px; }
  h3 { margin-top:26px; font-size:16px; color:#5BB8F5; }
  h4 { margin-top:20px; font-size:14px; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; }
  a { color:#5BB8F5; }
  code { background:rgba(91,184,245,.12); color:#9ed2fb; padding:1px 6px; border-radius:5px;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.88em; }
  strong { color:#fff; }
  hr { border:0; border-top:1px solid rgba(255,255,255,.08); margin:32px 0; }
  blockquote { margin:16px 0; padding:12px 16px; border-left:3px solid #5BB8F5;
    background:rgba(91,184,245,.06); border-radius:0 8px 8px 0; color:#b9c8d6; font-size:14px; }
  ul,ol { padding-left:22px; }
  li { margin:4px 0; }
  table { width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;
    background:rgba(13,30,52,.5); border-radius:10px; overflow:hidden; }
  th,td { text-align:left; padding:9px 12px; border-bottom:1px solid rgba(255,255,255,.07); vertical-align:top; }
  th { background:rgba(91,184,245,.1); color:#cfe6fa; font-weight:600; }
  tr:last-child td { border-bottom:0; }
  .foot { margin-top:48px; font-size:12px; color:#5E7A95; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
<div class="banner">
  <h1>ATS — Registro Audit</h1>
  <p>Versione HTML generata da <code>docs/AUDIT-LOG.md</code> · fonte di verità: il file Markdown.</p>
</div>
${html.join('\n')}
<p class="foot">Documento generato automaticamente da docs/AUDIT-LOG.md — non modificare a mano.</p>
</div>
</body>
</html>
`
writeFileSync(out, page)
console.log('HTML generato:', out, '(' + page.length + ' byte)')

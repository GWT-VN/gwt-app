#!/usr/bin/env node
/**
 * So khớp component DS thật (/ds) với preview artifact (ds/nguon/components/<C>/preview.html).
 *
 *   node ds/so-khop.mjs Button [--url http://localhost:3401]     (cwd bất kỳ; dev server phải đang chạy)
 *
 * Với mỗi theme (sáng/tối) × khổ (1440/390): dựng trang tạm từ nguon/tokens.css + nguon/bundle.css + preview, mở /ds,
 * đo getComputedStyle từng cặp khoá trong ds/so-khop/<c>.json, chụp ảnh khối → ds/so-khop/anh/ (gitignore).
 * Trạng thái (`trangThai`): bên artifact ép class `.is-<tt>` như chính preview làm; bên DS tạo bằng tương tác THẬT —
 * hover = Input.dispatchMouseEvent, focus = phím Tab thật (focus-visible). Ghi ds/so-khop/<C>.md: chỉ dòng lệch + tổng.
 * Thoát mã 1 nếu còn lệch chưa có `lyDo` (khoá lyDo = đúng chữ ở cột "thuộc tính", vd `hover.backgroundColor`).
 *
 * Font: preview nguồn khai --font-sans = font hệ thống (không có Inter); DS dùng Inter (next/font). Để đo CSS component
 * chứ không đo font sẵn có của máy, trang tạm nạp ĐÚNG file Inter mà /ds đang dùng (lấy @font-face từ /ds, nhúng
 * base64) và đặt --font-sans = font-family thật của nút DS. Dòng @import Google Fonts của bundle.css bị bỏ (stack
 * nguồn không gọi Inter nên nó vô tác dụng, mà để lại thì có hai bộ @font-face cùng tên + phụ thuộc mạng).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DS = dirname(fileURLToPath(import.meta.url))
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const THEMES = [['sang', 'light'], ['toi', 'dark']]
const KHO = [1440, 390]
const CAO = 900
const PROPS = ['width', 'height', 'paddingLeft', 'paddingRight', 'gap', 'borderRadius', 'fontSize', 'fontWeight',
  'lineHeight', 'fontFeatureSettings', 'color', 'backgroundColor', 'boxShadow',
  'outlineColor', 'outlineStyle', 'outlineWidth', 'outlineOffset']

const args = process.argv.slice(2)
const iUrl = args.indexOf('--url')
const url = (iUrl >= 0 ? args[iUrl + 1] : 'http://localhost:3401').replace(/\/$/, '')
const comp = args.find((a, i) => !a.startsWith('--') && i !== iUrl + 1)
if (!comp) { console.error('Dùng: node ds/so-khop.mjs <Component> [--url http://localhost:3401]'); process.exit(2) }
const cfg = JSON.parse(readFileSync(join(DS, 'so-khop', `${comp.toLowerCase()}.json`), 'utf8'))
const ANH = join(DS, 'so-khop', 'anh')
mkdirSync(ANH, { recursive: true })

// ---------- CDP tối giản (Node 22+ có WebSocket) ----------
const ngu = (ms) => new Promise((r) => setTimeout(r, ms))
async function moCdp(wsUrl) {
  const ws = new WebSocket(wsUrl)
  await new Promise((ok, loi) => { ws.onopen = ok; ws.onerror = loi })
  let id = 0
  const cho = new Map()
  const nghe = new Set()
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && cho.has(m.id)) {
      const { ok, loi } = cho.get(m.id); cho.delete(m.id)
      m.error ? loi(new Error(`${m.error.message}`)) : ok(m.result)
    } else for (const f of nghe) f(m)
  }
  const send = (method, params = {}) => new Promise((ok, loi) => {
    const i = ++id; cho.set(i, { ok, loi }); ws.send(JSON.stringify({ id: i, method, params }))
  })
  const doi = (method, ms = 120000) => new Promise((ok, loi) => {
    const t = setTimeout(() => { nghe.delete(f); loi(new Error(`hết giờ chờ ${method}`)) }, ms)
    const f = (m) => { if (m.method === method) { clearTimeout(t); nghe.delete(f); ok(m.params) } }
    nghe.add(f)
  })
  return { send, doi, dong: () => ws.close() }
}

async function chay(cdp, bieuThuc) {
  const r = await cdp.send('Runtime.evaluate', { expression: bieuThuc, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
  return r.result.value
}

// Chạy trong trang: đo + chuẩn hoá (px làm tròn 0.5, màu → rgb()/rgba() qua canvas).
const TRO_GIUP = `window.__sk = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1
  const g = cv.getContext('2d', { willReadFrequently: true })
  const mau = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1)
    const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data
    return a === 0 ? 'transparent' : a === 255 ? 'rgb(' + r + ', ' + gg + ', ' + b + ')' : 'rgba(' + r + ', ' + gg + ', ' + b + ', ' + (a / 255).toFixed(2) + ')' }
  const chuan = (v) => String(v)
    .replace(/(?:rgba?|oklch|oklab|lab|lch|hsla?|hwb|color)\\([^()]*\\)/g, mau)
    .replace(/-?\\d*\\.?\\d+px/g, (m) => Math.round(parseFloat(m) * 2) / 2 + 'px')
  const do_ = (sel, props) => { const el = document.querySelector(sel); if (!el) return null
    const cs = getComputedStyle(el); return Object.fromEntries(props.map((p) => [p, chuan(cs[p])])) }
  const hop = (sel) => { const el = document.querySelector(sel); if (!el) return null
    el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height, sx: scrollX, sy: scrollY } }
  return { do: do_, hop }
})(); true`

// ---------- Chrome ----------
const thuMuc = mkdtempSync(join(tmpdir(), 'so-khop-'))
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${thuMuc}`,
  // Khử răng cưa xám + sRGB: ảnh hai bên không bị viền màu ClearType làm nhiễu khi soi bằng mắt.
  '--hide-scrollbars', '--disable-lcd-text', '--force-color-profile=srgb', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })
let cdp
try {
  const fPort = join(thuMuc, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(fPort); i++) await ngu(100)
  const port = readFileSync(fPort, 'utf8').split('\n')[0].trim()
  const trang = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')
  cdp = await moCdp(trang.webSocketDebuggerUrl)
  await cdp.send('Page.enable')

  const di = async (dich) => {
    const xong = cdp.doi('Page.loadEventFired')
    await cdp.send('Page.navigate', { url: dich })
    await xong
    await chay(cdp, 'document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 400))).then(() => true)')
    await chay(cdp, TRO_GIUP)
  }
  const chuot = (x, y) => cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  const phim = async () => {
    for (const type of ['keyDown', 'keyUp'])
      await cdp.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  }
  const tabToi = async (sel) => {
    await chay(cdp, 'document.activeElement?.blur(), true')
    for (let i = 0; i < 200; i++) {
      await phim()
      if (await chay(cdp, `document.activeElement === document.querySelector(${JSON.stringify(sel)})`)) return
    }
    throw new Error(`Tab không tới được ${sel}`)
  }
  const reChuot = async (sel) => {
    const h = await chay(cdp, `__sk.hop(${JSON.stringify(sel)})`)
    if (!h) throw new Error(`không thấy ${sel}`)
    await chuot(h.x + h.w / 2, h.y + h.h / 2)
  }

  // Font: lấy @font-face Inter + font-family thật của nút DS từ /ds (một lần).
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: KHO[0], height: CAO, deviceScaleFactor: 1, mobile: false })
  await di(`${url}/ds`)
  const { mat, hoFont } = await chay(cdp, `(() => {
    const mat = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => [r, s.href || location.href]) } catch { return [] } })
      .filter(([r]) => r instanceof CSSFontFaceRule && /Inter/i.test(r.style.getPropertyValue('font-family')))
      .map(([r, goc]) => r.cssText.replace(/url\\((['"]?)([^'")]+)\\1\\)/g, (_, q, u) => 'url("' + new URL(u, goc).href + '")'))
    return { mat, hoFont: getComputedStyle(document.querySelector(${JSON.stringify(cfg.khoa[0].ds)})).fontFamily }
  })()`)
  if (!mat.length) throw new Error('không thấy @font-face Inter trên /ds')
  const nhung = new Map()
  let cssFont = mat.join('\n')
  for (const u of new Set([...cssFont.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]))) {
    const b = Buffer.from(await (await fetch(u.replace('//localhost:', '//127.0.0.1:'))).arrayBuffer())
    nhung.set(u, `data:font/woff2;base64,${b.toString('base64')}`)
  }
  cssFont = cssFont.replace(/url\("([^"]+)"\)/g, (_, u) => `url("${nhung.get(u)}")`)

  const preview = readFileSync(join(DS, 'nguon', 'components', comp, 'preview.html'), 'utf8')
    .split('\n').filter((d) => !d.trimStart().startsWith('<!-- @dsCard')).join('\n')
  const tokens = readFileSync(join(DS, 'nguon', 'tokens.css'), 'utf8')
  const bundle = readFileSync(join(DS, 'nguon', 'bundle.css'), 'utf8').replace(/^@import url\([^)]*fonts\.googleapis[^)]*\);?\s*$/m, '')
  const tam = (theme) => {
    const f = join(thuMuc, `artifact-${theme}.html`)
    writeFileSync(f, `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">
<style>${tokens}</style><style>${bundle}</style>
<style>/* so-khop: font giống /ds */\n${cssFont}\n:root, [data-theme] { --font-sans: ${hoFont}; }</style>
</head><body>${preview}</body></html>`)
    return pathToFileURL(f).href
  }

  const ketQua = [] // { khoa, tt, prop, a, d, o }
  let tong = 0
  for (const [ten, theme] of THEMES) {
    const trangA = tam(theme)
    for (const w of KHO) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: CAO, deviceScaleFactor: 1, mobile: false })
      const so = { artifact: {}, ds: {} }
      for (const ben of ['artifact', 'ds']) {
        await di(ben === 'artifact' ? trangA : `${url}/ds?theme=${theme}`)
        await chuot(w - 1, CAO - 1)
        for (const k of cfg.khoa) {
          const sel = k[ben]
          const doK = async (nhan) => {
            so[ben][nhan] = await chay(cdp, `__sk.do(${JSON.stringify(sel)}, ${JSON.stringify(PROPS)})`)
            if (k.con && so[ben][nhan]) {
              const c = await chay(cdp, `__sk.do(${JSON.stringify(`${sel} ${k.con[ben]}`)}, ['width', 'height'])`)
              for (const [p, v] of Object.entries(c ?? { width: null, height: null })) so[ben][nhan][`con.${p}`] = v
            }
          }
          await doK(k.khoa)
          for (const tt of k.trangThai ?? []) {
            if (ben === 'artifact') {
              await chay(cdp, `document.querySelector(${JSON.stringify(sel)}).classList.add('is-${tt}'), true`)
              await ngu(350); await doK(`${k.khoa}:${tt}`)
              await chay(cdp, `document.querySelector(${JSON.stringify(sel)}).classList.remove('is-${tt}'), true`)
            } else if (tt === 'hover') {
              await reChuot(sel); await ngu(350); await doK(`${k.khoa}:${tt}`)
              await chuot(w - 1, CAO - 1)
            } else if (tt === 'focus') {
              await tabToi(sel); await ngu(350); await doK(`${k.khoa}:${tt}`)
              await chay(cdp, 'document.activeElement?.blur(), true')
            } else throw new Error(`trạng thái lạ: ${tt}`)
            await ngu(350)
          }
        }
        // Ảnh: bên DS dựng lại hàng trạng thái bằng tương tác thật (trỏ chuột nút Hover, Tab tới nút Focus).
        if (ben === 'ds' && cfg.anhTuongTac) {
          if (cfg.anhTuongTac.focus) await tabToi(cfg.anhTuongTac.focus)
          if (cfg.anhTuongTac.hover) await reChuot(cfg.anhTuongTac.hover)
          await ngu(350)
        }
        const h = await chay(cdp, `(() => { const r = document.querySelector(${JSON.stringify(cfg.khung[ben])}).getBoundingClientRect()
          return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height } })()`)
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
          clip: { x: Math.max(0, h.x - 8), y: Math.max(0, h.y - 8), width: h.w + 16, height: h.h + 16, scale: 1 } })
        writeFileSync(join(ANH, `${comp}-${ten}-${w}-${ben}.png`), Buffer.from(data, 'base64'))
      }
      for (const nhan of Object.keys(so.artifact)) {
        const [khoa, tt] = nhan.split(':')
        const a = so.artifact[nhan] ?? {}, d = so.ds[nhan] ?? {}
        for (const p of new Set([...Object.keys(a), ...Object.keys(d), ...(Object.keys(a).length ? [] : PROPS)])) {
          tong++
          const prop = tt ? `${tt}.${p}` : p
          const va = a[p] ?? 'KHÔNG THẤY', vd = d[p] ?? 'KHÔNG THẤY'
          if (va !== vd) ketQua.push({ khoa, prop, a: va, d: vd, o: `${ten} ${w}` })
        }
      }
    }
  }

  // Gom dòng lệch giống hệt nhau giữa các theme/khổ.
  const gom = new Map()
  for (const r of ketQua) {
    const k = [r.khoa, r.prop, r.a, r.d].join('\u0000')
    if (gom.has(k)) gom.get(k).o.push(r.o); else gom.set(k, { ...r, o: [r.o] })
  }
  const lyDo = (khoa, prop) => cfg.khoa.find((k) => k.khoa === khoa)?.lyDo?.[prop]
  const dong = [...gom.values()]
  const chuaLyDo = ketQua.filter((r) => !lyDo(r.khoa, r.prop)).length
  const coLyDo = ketQua.length - chuaLyDo
  const o = (s) => String(s).replaceAll('|', '\\|')
  const md = [
    `# So khớp ${comp} — artifact ↔ /ds`,
    '',
    `Sinh bởi \`node ds/so-khop.mjs ${comp} --url ${url}\` (cwd \`apps/web\`; mặc định \`--url http://localhost:3401\`, máy`,
    'Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.',
    '',
    `- Artifact: \`ds/nguon/tokens.css\` + \`bundle.css\` + \`components/${comp}/preview.html\` (xem \`ds/NGUON.md\`) ↔ \`/ds\`.`,
    `- Theme sáng/tối × khổ ${KHO.join('/')} (CDP \`Emulation.setDeviceMetricsOverride\`). Px làm tròn 0.5, màu chuẩn hoá rgb().`,
    '- Trạng thái: artifact ép class `.is-hover`/`.is-focus` (như preview); DS di chuột thật (`Input.dispatchMouseEvent`) / phím Tab thật.',
    `- Font: trang artifact nạp đúng Inter của /ds và đặt \`--font-sans\` = \`${o(hoFont)}\` (nguồn khai font hệ thống; bỏ \`@import\` Google Fonts vô tác dụng).`,
    `- Ảnh: \`ds/so-khop/anh/${comp}-{sang,toi}-{${KHO.join(',')}}-{artifact,ds}.png\` (gitignore).`,
    '',
    `**${tong - ketQua.length}/${tong} khớp** · ${coLyDo} lệch có lý do · ${chuaLyDo} lệch chưa có lý do`,
    '',
    ...(dong.length ? ['| khoá | thuộc tính | artifact | ds | ở | lý do |', '|---|---|---|---|---|---|',
      ...dong.map((r) => `| ${r.khoa} | ${r.prop} | ${o(r.a)} | ${o(r.d)} | ${r.o.join(', ')} | ${o(lyDo(r.khoa, r.prop) ?? '**CHƯA CÓ**')} |`)] : ['Không có dòng lệch.']),
    '',
  ].join('\n')
  writeFileSync(join(DS, 'so-khop', `${comp}.md`), md)
  console.log(`${comp}: ${tong - ketQua.length}/${tong} khớp · ${coLyDo} lệch có lý do · ${chuaLyDo} chưa có lý do → ds/so-khop/${comp}.md`)
  process.exitCode = chuaLyDo ? 1 : 0
} catch (e) {
  console.error(e)
  process.exitCode = 2
} finally {
  cdp?.dong()
  chrome.kill()
  await ngu(500)
  try { rmSync(thuMuc, { recursive: true, force: true }) } catch { /* Chrome còn giữ file: bỏ qua */ }
}

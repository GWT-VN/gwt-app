#!/usr/bin/env node
/**
 * So khớp component DS thật (/ds) với preview artifact (ds/nguon/components/<C>/preview.html).
 *
 *   node ds/so-khop.mjs Button [--url http://localhost:3401]     (cwd bất kỳ; dev server phải đang chạy)
 *
 * Với mỗi theme (sáng/tối) × khổ (1440/390): dựng trang tạm từ nguon/tokens.css + nguon/bundle.css + preview, mở /ds,
 * đo getComputedStyle từng cặp khoá trong ds/so-khop/<c>.json, chụp ảnh khối → ds/so-khop/anh/ (gitignore).
 * Trạng thái (`trangThai`): bên artifact ép class `.is-<tt>` như chính preview làm (`artifactThat: true` → artifact cũng
 * tương tác thật, cho rule chỉ có `:hover`); bên DS luôn tương tác THẬT — hover = Input.dispatchMouseEvent (kiểm
 * `:hover`), focus = phím Tab thật (kiểm `:focus-visible`).
 *
 * Ghi ds/so-khop/<C>.md. Thoát mã 1 nếu: còn lệch chưa có `lyDo`; THIẾU PHẦN TỬ ở bất kỳ bên nào (không lyDo nào miễn
 * được, không tính vào tổng); hoặc có `lyDo` thừa (không còn khớp dòng lệch nào). Mã 2 = lỗi chạy (Button.md bị ghi đè
 * bằng ghi chú lỗi). Khoá lyDo = chữ ở cột "thuộc tính" (vd `hover.backgroundColor`), thêm `@toi`, `@390`, `@toi 390`
 * để chỉ áp cho theme/khổ đó. `chuaDo` (mảng chữ) trong config: những gì CHƯA đo — in ngay dưới dòng tổng của <C>.md để
 * con số khớp không bị đọc thành "khớp hết".
 *
 * Font: preview nguồn khai --font-sans = font hệ thống (không có Inter); DS dùng Inter (next/font). Để đo CSS component
 * chứ không đo font sẵn có của máy, trang tạm nạp ĐÚNG file Inter mà /ds đang dùng (lấy @font-face từ /ds, nhúng
 * base64) và đặt --font-sans = giá trị TOKEN --font-sans trên gốc [data-ds] của /ds (không lấy từ component đang đo).
 * Dòng @import Google Fonts của bundle.css bị bỏ (stack nguồn không gọi Inter nên nó vô tác dụng, mà để lại thì có hai
 * bộ @font-face cùng tên + phụ thuộc mạng).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DS = dirname(fileURLToPath(import.meta.url))
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const THEMES = [['sang', 'light'], ['toi', 'dark']]
const KHO = [1440, 390]
const CAO = 900
const PROPS = ['width', 'height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap',
  'borderRadius', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFeatureSettings', 'textDecorationLine',
  'color', 'backgroundColor', 'boxShadow', 'opacity', 'cursor',
  'outlineColor', 'outlineStyle', 'outlineWidth', 'outlineOffset']
const URL_MAC_DINH = 'http://localhost:3401'

/** `<Component> [--url <url>]` → { comp, url }. Ném lỗi khi thiếu/thừa/sai cờ. */
export function docThamSo(argv) {
  let url = URL_MAC_DINH
  let comp
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url') {
      url = argv[++i]
      if (!url || url.startsWith('--')) throw new Error('--url thiếu giá trị')
    } else if (argv[i].startsWith('--')) throw new Error(`cờ lạ: ${argv[i]}`)
    else if (!comp) comp = argv[i]
    else throw new Error(`thừa tham số: ${argv[i]}`)
  }
  if (!comp) throw new Error('thiếu tên component')
  return { comp, url: url.replace(/\/$/, '') }
}

/** Khoá lyDo khớp dòng lệch: `<prop>` hoặc `<prop>@<theme/khổ…>`; `o` dạng "toi 1440". Trả khoá khớp hoặc undefined. */
export function timLyDo(lyDo, prop, o) {
  const tok = o.split(' ')
  return Object.keys(lyDo ?? {}).find((k) => {
    const [p, pham = ''] = k.split('@')
    return p === prop && pham.split(/\s+/).filter(Boolean).every((s) => tok.includes(s))
  })
}

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

// Chạy trong trang. Màu: đưa qua color-mix(in srgb, X 100%, transparent) trên phần tử dò → Chrome trả
// color(srgb r g b / a) số thực (không premultiply 8-bit như canvas) → in rgb(kênh×255, 2 số lẻ / alpha 3 số lẻ).
// Màu không đọc được → ném lỗi (không rơi về đen). Px làm tròn 0.5.
const TRO_GIUP = `window.__sk = (() => {
  const do_ = document.createElement('i'); do_.style.display = 'none'; document.documentElement.appendChild(do_)
  const so = (x) => String(+x.toFixed(2))
  const mau = (c) => {
    do_.style.color = ''
    do_.style.color = 'color-mix(in srgb, ' + c + ' 100%, transparent)'
    if (!do_.style.color) throw new Error('màu không đọc được: ' + c)
    const m = getComputedStyle(do_).color.match(/^color\\(srgb ([^/)]+)(?:\\/ *([^)]+))?\\)$/)
    if (!m) throw new Error('màu không chuẩn hoá được: ' + c + ' → ' + getComputedStyle(do_).color)
    const [r, g, b] = m[1].trim().split(/\\s+/).map(Number), a = m[2] === undefined ? 1 : Number(m[2])
    if ([r, g, b, a].some((x) => !Number.isFinite(x))) throw new Error('màu không chuẩn hoá được: ' + c)
    return 'rgb(' + so(r * 255) + ' ' + so(g * 255) + ' ' + so(b * 255) + (a === 1 ? '' : ' / ' + String(+a.toFixed(3))) + ')'
  }
  // Tự kiểm: alpha thấp vẫn giữ kênh màu; màu rác phải ném lỗi.
  if (mau('rgba(13,13,13,.02)') === mau('rgba(0,0,0,.02)')) throw new Error('chuẩn hoá màu làm mất kênh ở alpha thấp')
  if (mau('#fff') !== 'rgb(255 255 255)') throw new Error('chuẩn hoá màu sai: #fff → ' + mau('#fff'))
  let nem = false; try { mau('khong-phai-mau') } catch { nem = true }
  if (!nem) throw new Error('màu rác không ném lỗi')
  const chuan = (v) => {
    const s = String(v).replace(/(?:rgba?|oklch|oklab|lab|lch|hsla?|hwb|color)\\([^()]*\\)/g, mau)
      .replace(/-?\\d*\\.?\\d+px/g, (m) => Math.round(parseFloat(m) * 2) / 2 + 'px')
    if (/color-mix\\(|currentcolor/i.test(s)) throw new Error('giá trị màu chưa phân giải: ' + v)
    return s
  }
  const doEl = (sel, props) => { const el = document.querySelector(sel); if (!el) return null
    const cs = getComputedStyle(el); return Object.fromEntries(props.map((p) => [p, chuan(cs[p])])) }
  const hop = (sel) => { const el = document.querySelector(sel); if (!el) return null
    el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height } }
  const la = (sel, gia) => document.querySelector(sel)?.matches(gia) ?? false
  return { do: doEl, hop, la }
})(); true`

async function main() {
  const { comp, url } = docThamSo(process.argv.slice(2))
  const cfg = JSON.parse(readFileSync(join(DS, 'so-khop', `${comp.toLowerCase()}.json`), 'utf8'))
  const fileMd = join(DS, 'so-khop', `${comp}.md`)
  const ANH = join(DS, 'so-khop', 'anh')
  mkdirSync(ANH, { recursive: true })

  // ---------- Chrome ----------
  const thuMuc = mkdtempSync(join(tmpdir(), 'so-khop-'))
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${thuMuc}`,
    // Khử răng cưa xám + sRGB: ảnh hai bên không bị viền màu ClearType làm nhiễu khi soi bằng mắt.
    '--hide-scrollbars', '--disable-lcd-text', '--force-color-profile=srgb', '--no-first-run', '--no-default-browser-check',
    'about:blank'], { stdio: 'ignore' })
  const loiChrome = new Promise((_, loi) => chrome.on('error', (e) => loi(new Error(`không chạy được Chrome (${CHROME}): ${e.message}`))))
  loiChrome.catch(() => {})
  let cdp
  const don = () => {
    chrome.kill()
    try { rmSync(thuMuc, { recursive: true, force: true }) } catch (e) { console.warn(`không xoá được ${thuMuc}: ${e.message}`) }
  }
  const ngat = () => { console.error('Bị ngắt (SIGINT) — dọn Chrome.'); don(); process.exit(130) }
  process.once('SIGINT', ngat)
  try {
    const fPort = join(thuMuc, 'DevToolsActivePort')
    for (let i = 0; i < 100 && !existsSync(fPort); i++) await Promise.race([ngu(100), loiChrome])
    if (!existsSync(fPort)) throw new Error('Chrome không mở cổng debug sau 10 giây')
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
    const S = JSON.stringify
    const chuot = (x, y) => cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
    const phim = async () => {
      for (const type of ['keyDown', 'keyUp'])
        await cdp.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    }
    const tabToi = async (sel) => {
      await chay(cdp, 'document.activeElement?.blur(), true')
      for (let i = 0; i < 200; i++) {
        await phim()
        if (await chay(cdp, `document.activeElement === document.querySelector(${S(sel)})`)) {
          if (!(await chay(cdp, `__sk.la(${S(sel)}, ':focus-visible')`))) throw new Error(`Tab tới ${sel} nhưng không :focus-visible`)
          return
        }
      }
      throw new Error(`Tab không tới được ${sel}`)
    }
    const troVao = async (sel) => {
      const h = await chay(cdp, `__sk.hop(${S(sel)})`)
      if (!h) throw new Error(`không thấy ${sel}`)
      await chuot(h.x + h.w / 2, h.y + h.h / 2)
      if (!(await chay(cdp, `__sk.la(${S(sel)}, ':hover')`))) throw new Error(`di chuột vào ${sel} nhưng không :hover`)
    }

    const thuDs = await fetch(`${url}/ds`).catch((e) => ({ ok: false, status: e.cause?.code ?? e.message }))
    if (!thuDs.ok) throw new Error(`không mở được ${url}/ds (${thuDs.status}) — dev server đã chạy chưa? (máy này dùng --url http://127.0.0.1:3401)`)
    // Font: @font-face Inter + giá trị token --font-sans trên gốc [data-ds] của /ds (một lần).
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: KHO[0], height: CAO, deviceScaleFactor: 1, mobile: false })
    await di(`${url}/ds`)
    const { mat, hoFont } = await chay(cdp, `(() => {
      const mat = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => [r, s.href || location.href]) } catch { return [] } })
        .filter(([r]) => r instanceof CSSFontFaceRule && /Inter/i.test(r.style.getPropertyValue('font-family')))
        .map(([r, goc]) => r.cssText.replace(/url\\((['"]?)([^'")]+)\\1\\)/g, (_, q, u) => 'url("' + new URL(u, goc).href + '")'))
      const goc = document.querySelector('[data-ds]')
      return { mat, hoFont: goc ? getComputedStyle(goc).getPropertyValue('--font-sans').trim() : '' }
    })()`)
    if (!mat.length) throw new Error('không thấy @font-face Inter trên /ds')
    if (!hoFont || hoFont.includes('var(')) throw new Error(`token --font-sans trên [data-ds] của /ds không đọc được: "${hoFont}"`)
    const nhung = new Map()
    let cssFont = mat.join('\n')
    for (const u of new Set([...cssFont.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]))) {
      const r = await fetch(u.replace('//localhost:', '//127.0.0.1:'))
      if (!r.ok) throw new Error(`tải font ${u} lỗi HTTP ${r.status}`)
      nhung.set(u, `data:font/woff2;base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`)
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

    const lech = [] // { khoa, prop, a, d, o }
    const thieu = [] // { khoa, nhan, ben, sel, o }
    let tong = 0
    for (const [ten, theme] of THEMES) {
      const trangA = tam(theme)
      for (const w of KHO) {
        const o = `${ten} ${w}`
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: CAO, deviceScaleFactor: 1, mobile: false })
        const so = { artifact: {}, ds: {} } // so[ben][nhan] = { prop: giá trị } | null
        for (const ben of ['artifact', 'ds']) {
          await di(ben === 'artifact' ? trangA : `${url}/ds?theme=${theme}`)
          await chuot(w - 1, CAO - 1)
          for (const k of cfg.khoa) {
            const sel = k[ben]
            const doK = async (tt) => {
              const nhan = tt ? `${k.khoa}:${tt}` : k.khoa
              so[ben][nhan] = await chay(cdp, `__sk.do(${S(sel)}, ${S(PROPS)})`)
              for (const c of k.con ?? []) {
                const v = await chay(cdp, `__sk.do(${S(`${sel} ${c[ben]}`)}, ${S(c.props ?? ['width', 'height'])})`)
                so[ben][`${nhan}|${c.ten}`] = v
              }
            }
            await doK()
            for (const tt of k.trangThai ?? []) {
              const that = ben === 'ds' || k.artifactThat
              if (!that) {
                await chay(cdp, `document.querySelector(${S(sel)})?.classList.add('is-${tt}'), true`)
                await ngu(350); await doK(tt)
                await chay(cdp, `document.querySelector(${S(sel)})?.classList.remove('is-${tt}'), true`)
              } else if (!(await chay(cdp, `!!document.querySelector(${S(sel)})`))) {
                await doK(tt) // thiếu phần tử → ghi null, báo THIẾU bên dưới
              } else if (tt === 'hover') {
                await troVao(sel); await ngu(350); await doK(tt)
                await chuot(w - 1, CAO - 1)
              } else if (tt === 'focus') {
                await tabToi(sel); await ngu(350); await doK(tt)
                await chay(cdp, 'document.activeElement?.blur(), true')
              } else throw new Error(`trạng thái lạ: ${tt}`)
              await ngu(350)
            }
          }
          // Ảnh: bên DS dựng lại hàng trạng thái bằng tương tác thật (trỏ chuột nút Hover, Tab tới nút Focus).
          if (ben === 'ds' && cfg.anhTuongTac) {
            if (cfg.anhTuongTac.focus) await tabToi(cfg.anhTuongTac.focus)
            if (cfg.anhTuongTac.hover) await troVao(cfg.anhTuongTac.hover)
            await ngu(350)
          }
          const h = await chay(cdp, `(() => { const el = document.querySelector(${S(cfg.khung[ben])}); if (!el) return null
            const r = el.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height } })()`)
          if (!h) throw new Error(`không thấy khung chụp ${cfg.khung[ben]} (${ben})`)
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
            clip: { x: Math.max(0, h.x - 8), y: Math.max(0, h.y - 8), width: h.w + 16, height: h.h + 16, scale: 1 } })
          writeFileSync(join(ANH, `${comp}-${ten}-${w}-${ben}.png`), Buffer.from(data, 'base64'))
        }
        for (const nhan of new Set([...Object.keys(so.artifact), ...Object.keys(so.ds)])) {
          const [phan, con] = nhan.split('|')
          const [khoa, tt] = phan.split(':')
          const a = so.artifact[nhan], d = so.ds[nhan]
          if (!a || !d) {
            for (const [ben, v] of [['artifact', a], ['ds', d]]) {
              if (v) continue
              const k = cfg.khoa.find((x) => x.khoa === khoa)
              const sel = con ? `${k[ben]} ${k.con.find((c) => c.ten === con)[ben]}` : k[ben]
              thieu.push({ khoa, nhan, ben, sel, o })
            }
            continue
          }
          for (const p of Object.keys(a)) {
            tong++
            const prop = [tt, con && `${con}`, p].filter(Boolean).join('.')
            if (a[p] !== d[p]) lech.push({ khoa, prop, a: a[p], d: d[p], o })
          }
        }
      }
    }

    // lyDo: dòng lệch nào được miễn; lyDo nào thừa (không khớp dòng lệch nào).
    const dung = new Set()
    for (const r of lech) {
      const k = timLyDo(cfg.khoa.find((x) => x.khoa === r.khoa)?.lyDo, r.prop, r.o)
      if (k) { r.lyDo = cfg.khoa.find((x) => x.khoa === r.khoa).lyDo[k]; dung.add(`${r.khoa}\u0000${k}`) }
    }
    const lyDoThua = cfg.khoa.flatMap((x) => Object.keys(x.lyDo ?? {}).filter((k) => !dung.has(`${x.khoa}\u0000${k}`)).map((k) => `${x.khoa} · ${k}`))
    // Gom dòng lệch giống hệt nhau giữa các theme/khổ.
    const gom = new Map()
    for (const r of lech) {
      const k = [r.khoa, r.prop, r.a, r.d, r.lyDo].join('\u0000')
      if (gom.has(k)) gom.get(k).o.push(r.o); else gom.set(k, { ...r, o: [r.o] })
    }
    const gomThieu = new Map()
    for (const r of thieu) {
      const k = [r.nhan, r.ben, r.sel].join('\u0000')
      if (gomThieu.has(k)) gomThieu.get(k).o.push(r.o); else gomThieu.set(k, { ...r, o: [r.o] })
    }
    const chuaLyDo = lech.filter((r) => !r.lyDo).length
    const coLyDo = lech.length - chuaLyDo
    const q = (s) => String(s).replaceAll('|', '\\|')
    const chuaDo = cfg.chuaDo ?? []
    const md = [
      `# So khớp ${comp} — artifact ↔ /ds`,
      '',
      `Sinh bởi \`node ds/so-khop.mjs ${comp} --url ${url}\` (cwd \`apps/web\`; mặc định \`--url ${URL_MAC_DINH}\`, máy`,
      'Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.',
      '',
      `- Artifact: \`ds/nguon/tokens.css\` + \`bundle.css\` + \`components/${comp}/preview.html\` (xem \`ds/NGUON.md\`) ↔ \`/ds\`.`,
      `- Theme sáng/tối × khổ ${KHO.join('/')} (CDP \`Emulation.setDeviceMetricsOverride\`). Đo ${PROPS.length} thuộc tính/phần tử: ${PROPS.join(', ')}.`,
      '- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).',
      `- Trạng thái: artifact ép class \`.is-hover\`/\`.is-focus\` như preview, trừ khoá có \`artifactThat\` thì artifact cũng tương tác thật (${cfg.khoa.filter((k) => k.artifactThat && k.trangThai?.length).map((k) => `${k.khoa}: ${k.trangThai.join('/')}`).join(' · ') || 'không khoá nào'}); DS di chuột thật (\`Input.dispatchMouseEvent\`, kiểm \`:hover\`) / phím Tab thật (kiểm \`:focus-visible\`).`,
      `- Font: trang artifact nạp đúng Inter của /ds và đặt \`--font-sans\` = token \`--font-sans\` của gốc \`[data-ds]\` trên /ds = \`${q(hoFont)}\` (nguồn khai font hệ thống; bỏ \`@import\` Google Fonts vô tác dụng).`,
      `- Ảnh: \`ds/so-khop/anh/${comp}-{sang,toi}-{${KHO.join(',')}}-{artifact,ds}.png\` (gitignore).`,
      '',
      `**${tong - lech.length}/${tong} khớp** · ${coLyDo} lệch có lý do · ${chuaLyDo} lệch chưa có lý do · ${thieu.length} thiếu phần tử · ${lyDoThua.length} lyDo thừa · ${chuaDo.length} mục CHƯA ĐO`,
      '',
      ...(chuaDo.length ? ['**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):', '',
        ...chuaDo.map((x) => `- ${x}`), ''] : []),
      ...(gomThieu.size ? ['## THIẾU PHẦN TỬ (không lyDo nào miễn được)', '', '| khoá | bên | selector | ở |', '|---|---|---|---|',
        ...[...gomThieu.values()].map((r) => `| ${r.nhan.replace('|', ' › ')} | ${r.ben} | \`${q(r.sel)}\` | ${r.o.join(', ')} |`), ''] : []),
      ...(lyDoThua.length ? ['## lyDo thừa (không còn dòng lệch nào khớp — xoá hoặc sửa)', '', ...lyDoThua.map((x) => `- ${x}`), ''] : []),
      ...(gom.size ? ['| khoá | thuộc tính | artifact | ds | ở | lý do |', '|---|---|---|---|---|---|',
        ...[...gom.values()].map((r) => `| ${r.khoa} | ${r.prop} | ${q(r.a)} | ${q(r.d)} | ${r.o.join(', ')} | ${q(r.lyDo ?? '**CHƯA CÓ**')} |`)]
        : ['Không có dòng lệch.']),
      '',
    ].join('\n')
    writeFileSync(fileMd, md)
    console.log(`${comp}: ${tong - lech.length}/${tong} khớp · ${coLyDo} lệch có lý do · ${chuaLyDo} chưa có lý do · ${thieu.length} thiếu phần tử · ${lyDoThua.length} lyDo thừa · ${chuaDo.length} chưa đo → ds/so-khop/${comp}.md`)
    process.exitCode = chuaLyDo || thieu.length || lyDoThua.length ? 1 : 0
  } catch (e) {
    console.error(e)
    writeFileSync(fileMd, `# So khớp ${comp} — LỖI CHẠY, chưa có kết quả\n\n\`node ds/so-khop.mjs ${comp} --url ${url}\` dừng giữa chừng:\n\n\`\`\`\n${e?.stack ?? e}\n\`\`\`\n`)
    process.exitCode = 2
  } finally {
    process.off('SIGINT', ngat)
    try { await Promise.race([cdp?.send('Browser.close'), ngu(2000)]) } catch { /* Chrome đã tắt */ }
    cdp?.dong()
    await ngu(500)
    don()
  }
}

if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try { await main() } catch (e) { console.error(e.message); process.exitCode = 2 }
}

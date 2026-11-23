/*
  ストーリーズ用画像の作り直し
  ---------------------------------------------------------
  assets/js/config.js の開催日（第1・第3木曜日のルール＋特別回−お休み）から
  「次回」の開催日を自動で計算して、画像の「次回 ◯月◯日（◯）」を書き換えます。

  使い方（リポジトリのいちばん上のフォルダで実行）:
    node tools/story-image/render.js
    node tools/story-image/render.js --today 2026-11-27   … 指定した日を「今日」として計算
    node tools/story-image/render.js --out /path/to/dir    … 書き出し先を変える（確認用）

  書き出すファイル:
    assets/img/insup-night-flyer.jpg        … 「画像を保存する」で保存される画像
    assets/img/insup-night-flyer-thumb.jpg  … 参加条件に表示する小さい画像

  必要なもの: Playwright（require('playwright')）。
  文字の書体（Noto Sans JP）は、無ければ npm から自動で取ってきます。
*/
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const argOf = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const outDir = path.resolve(argOf('--out') || path.join(ROOT, 'assets', 'img'));

// ---------- 開催日の計算（main.js と同じルール） ----------
function parseDate(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets', 'js', 'config.js'), 'utf8'), sandbox);
const C = sandbox.window.INSUP_NIGHT || {};

const today = parseDate(argOf('--today')) || new Date();
today.setHours(0, 0, 0, 0);
const key = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const skip = new Set((C.skipDates || []).map(parseDate).filter(Boolean).map(key));
const all = new Map();
(C.dates || []).map(parseDate).filter(Boolean).forEach((d) => all.set(key(d), d));
const R = C.schedule;
if (R && R.weeks && R.weeks.length) {
  const start = parseDate(R.startFrom) || today;
  const from = start > today ? start : today;
  for (let i = -1; i < 6; i++) {
    let mm = from.getMonth() + i;
    const yy = from.getFullYear() + Math.floor(mm / 12);
    mm = ((mm % 12) + 12) % 12;
    for (const n of R.weeks) {
      const wd = R.weekday == null ? 4 : R.weekday;
      const first = new Date(yy, mm, 1).getDay();
      const d = new Date(yy, mm, 1 + ((wd - first + 7) % 7) + (n - 1) * 7);
      if (d.getMonth() === mm && d >= start) all.set(key(d), d);
    }
  }
}
const next = [...all.values()].filter((d) => !skip.has(key(d)) && d >= today).sort((a, b) => a - b)[0];
if (!next) { console.error('次回の開催日が見つかりません（config.js を確認してください）'); process.exit(1); }
const W = ['日', '月', '火', '水', '木', '金', '土'];
const nextLabel = `次回 ${next.getMonth() + 1}月${next.getDate()}日（${W[next.getDay()]}）`;

// ---------- 書体（Noto Sans JP 900） ----------
function fontCss() {
  try { return require.resolve('@fontsource/noto-sans-jp/900.css'); } catch (e) { /* なければ取得 */ }
  const dir = path.join(os.tmpdir(), 'insup-story-font');
  const css = path.join(dir, 'package', '900.css');
  if (!fs.existsSync(css)) {
    fs.mkdirSync(dir, { recursive: true });
    execSync('npm pack @fontsource/noto-sans-jp@5.2.5 --silent', { cwd: dir, stdio: 'ignore' });
    const tgz = fs.readdirSync(dir).find((f) => f.endsWith('.tgz'));
    execSync(`tar xzf "${tgz}"`, { cwd: dir });
  }
  return css;
}

// ---------- 画像を描く ----------
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const regular = '第1、第3木曜日';
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${fontCss()}">
<style>
  html,body{margin:0;width:1122px;height:1402px;overflow:hidden}
  .wrap{position:relative;width:1122px;height:1402px;background:url("file://${path.join(__dirname, 'base.jpg')}") 0 0/1122px 1402px no-repeat}
  .blk{position:absolute;left:612px;top:846px;width:470px;height:136px;background:#fdfdfd;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 16px),transparent),linear-gradient(180deg,transparent,#000 8px,#000 calc(100% - 6px),transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
  .t1{position:absolute;left:0;right:12px;top:8px;text-align:center;font:900 44px/1 "Noto Sans JP";color:#0d1838;letter-spacing:.01em}
  .ln{position:absolute;left:28px;right:16px;top:60px;height:3px;background:#2154a5}
  .t2{position:absolute;left:0;right:12px;top:68px;text-align:center;font:900 32px/1 "Noto Sans JP";color:#0d1838}
  .pill{position:absolute;left:50%;transform:translateX(-50%);top:105px;margin-left:-6px;white-space:nowrap;padding:2px 16px 3px;border-radius:999px;background:#1f55d6;color:#fff;font:900 20px/1.2 "Noto Sans JP";letter-spacing:.04em}
</style></head><body><div class="wrap"><div class="blk">
  <div class="t1">${esc(regular)}</div><div class="ln"></div>
  <div class="t2">22:00〜24:00予定</div><div class="pill">${esc(nextLabel)}</div>
</div></div></body></html>`;

(async () => {
  const tmp = path.join(os.tmpdir(), 'insup-story-render.html');
  fs.writeFileSync(tmp, html);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const [file, scale] of [['insup-night-flyer.jpg', 1], ['insup-night-flyer-thumb.jpg', 560 / 1122]]) {
    const page = await browser.newPage({ viewport: { width: 1122, height: 1402 }, deviceScaleFactor: scale });
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, file), type: 'jpeg', quality: scale === 1 ? 92 : 85 });
    await page.close();
  }
  await browser.close();
  console.log(`作成しました：「${nextLabel}」 → ${outDir}`);
})();

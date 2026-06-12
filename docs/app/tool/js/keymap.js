/*
 * キーボードショートカット図 ツールページ — 双方向 GUI エディタ。
 * キークリック操作 ⇄ keymap 記法テキストを相互同期する。
 * 描画はすべてプラグインのレンダラ経由 (mermaid.render)。
 */

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import {
    register, parseKeymapDsl, serializeKeymap, hitTest, canonKey,
} from './mermaid_keymap.js';

const codeInput = document.getElementById('codeInput');
const previewBox = document.getElementById('previewBox');
const errorMessage = document.getElementById('errorMessage');
const statusMsg = document.getElementById('statusMsg');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const sampleSelect = document.getElementById('sampleSelect');
const modeGroup = document.getElementById('modeGroup');
const captionInput = document.getElementById('captionInput');
const clearBtn = document.getElementById('clearBtn');
const layoutSelect = document.getElementById('layoutSelect');
const groupChips = document.getElementById('groupChips');
const legendInput = document.getElementById('legendInput');
const compactChk = document.getElementById('compactChk');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const copySvgBtn = document.getElementById('copySvgBtn');
const shareBtn = document.getElementById('shareBtn');
const themeSelect = document.getElementById('themeSelect');
const toTypeBtn = document.getElementById('toTypeBtn');

const SAMPLES = {
    copy:
        'keymap\n  layout: us\n  highlight: Ctrl C\n  caption: "コピー"',
    screenshot:
        'keymap\n  layout: us\n  highlight: Win Shift S\n  label: S "範囲指定"\n  caption: "範囲スクリーンショット (Windows)"',
    chord:
        'keymap\n  layout: us\n  chord: Ctrl+K -> Ctrl+S\n  caption: "VSCode: すべて保存"',
    mac:
        'keymap\n  layout: mac\n  highlight: Cmd Space\n  caption: "Spotlight 検索 (macOS)"',
    jis:
        'keymap\n  layout: jis\n  highlight: 変換\n  caption: "JIS: 変換キー"',
    macjis:
        'keymap\n  layout: macjis\n  highlight: Cmd かな\n  caption: "JIS-Mac: かな入力切替"',
    arrows:
        'keymap\n  layout: us\n  highlight: Up Down Left Right\n  caption: "カーソル移動"',
    numpad:
        'keymap\n  layout: us\n  highlight: Num5\n  label: Num5 "中央"\n  caption: "テンキー"',
    typing:
        'keymap\n  layout: us\n  type: H e l l o\n  sleep: 220\n  caption: "Hello とタイピング（アニメ）"',
    typingchord:
        'keymap\n  layout: us\n  type: Ctrl+C Ctrl+V\n  sleep: 500\n  caption: "コピー→ペースト（アニメ）"',
    groups:
        'keymap\n  layout: us\n  highlight: Ctrl C\n  highlight2: Ctrl V\n  highlight3: Ctrl X\n  legend: コピー / ペースト / 切り取り\n  caption: "編集ショートカット"',
    compact:
        'keymap\n  layout: us\n  compact: true\n  highlight: Ctrl Shift P\n  caption: "コマンドパレット（コンパクト表示）"',
    empty:
        'keymap\n  layout: us',
};

let state = parseKeymapDsl(SAMPLES.copy);
let mode = 'highlight';
let activeGroup = 0;   // 現在のハイライト色グループ (GUI のみ、非シリアライズ)
let renderSeq = 0;
let currentSvg = '';

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
register(mermaid);

function showError(msg) {
    if (msg) { errorMessage.textContent = msg; errorMessage.hidden = false; }
    else { errorMessage.textContent = ''; errorMessage.hidden = true; }
}

function setStatus(msg) { statusMsg.textContent = msg || ''; }

function applyState() {
    codeInput.value = serializeKeymap(state);
    syncControls();
    render();
}

function applyText() {
    state = parseKeymapDsl(codeInput.value);
    syncControls();
    render();
}

function syncControls() {
    captionInput.value = state.caption || '';
    layoutSelect.value = state.layout || 'us';
    compactChk.checked = !!state.compact;
    themeSelect.value = state.theme || 'auto';
    [...groupChips.children].forEach((b, i) => b.classList.toggle('active', i === activeGroup));
    legendInput.value = (state.legends && state.legends[activeGroup]) || '';
}

async function render() {
    const code = codeInput.value.trim();
    if (!code) {
        previewBox.innerHTML = '<p class="placeholder">キーをクリックするか記法を入力すると、ここに図が表示されます。</p>';
        currentSvg = '';
        downloadSvgBtn.disabled = true;
        downloadPngBtn.disabled = true;
        showError(null);
        return;
    }
    const seq = ++renderSeq;
    try {
        const { svg } = await mermaid.render('keymap-graph-' + seq, code);
        if (seq !== renderSeq) return;
        previewBox.innerHTML = svg;
        currentSvg = svg;
        downloadSvgBtn.disabled = false;
        downloadPngBtn.disabled = false;
        showError(null);
    } catch (e) {
        if (seq !== renderSeq) return;
        showError('描画エラー: ' + (e && e.message ? e.message : e));
    }
}

// --- 実キー入力（物理キーボードと連動） ---

const PHYS_MAP = {
    ControlLeft: 'Ctrl', ControlRight: 'Ctrl', ShiftLeft: 'Shift', ShiftRight: 'Shift',
    AltLeft: 'Alt', AltRight: 'Alt', MetaLeft: 'Win', MetaRight: 'Win',
    Enter: 'Enter', NumpadEnter: 'NumEnter', Backspace: 'Backspace', Tab: 'Tab',
    Escape: 'Esc', Space: 'Space', CapsLock: 'CapsLock', ContextMenu: 'Menu',
    ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
    Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Backquote: '`',
    NumpadDivide: 'NumDiv', NumpadMultiply: 'NumMul', NumpadSubtract: 'NumSub',
    NumpadAdd: 'NumAdd', NumpadDecimal: 'NumDot', NumLock: 'NumLock',
    Convert: '変換', NonConvert: '無変換', KanaMode: 'かな', Lang1: 'かな', Lang2: '英数',
    IntlYen: '¥', IntlRo: 'Ro',
};

/** 物理キーコード(e.code) → 盤面のキーコード（配列依存の微調整つき）。該当なしは null */
function physToCode(c) {
    let m = /^Key([A-Z])$/.exec(c);
    if (m) return m[1];
    m = /^Digit([0-9])$/.exec(c);
    if (m) return m[1];
    m = /^Numpad([0-9])$/.exec(c);
    if (m) return 'Num' + m[1];
    if (/^F([1-9]|1[0-2])$/.test(c)) return c;
    let code = PHYS_MAP[c] || null;
    // JIS 系では Backquote が半角/全角キー
    if (code === '`' && (state.layout === 'jis' || state.layout === 'macjis')) code = '半/全';
    return code;
}

function isFormFocused() {
    const a = document.activeElement;
    return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
}

const pressed = new Set();   // 物理 e.code の押下集合
let cycleMax = [];           // 現在モード: この押下サイクルのピーク組（押し順）
let liveCombo = [];          // 手順モード: 現ステップの押下組
let chordFresh = true;       // 手順モード: 次ステップで新しい chord を起こす

function isLiveMode() {
    return mode === 'live' || mode === 'liveacc' || mode === 'livechord';
}

/** 現在押下中のキーを盤面コード（canon）の集合で返す */
function heldCodes() {
    const s = new Set();
    for (const ec of pressed) {
        const cc = physToCode(ec);
        if (cc) s.add(canonKey(cc));
    }
    return s;
}

function onKeyDown(e) {
    if (!isLiveMode() || isFormFocused()) return;
    e.preventDefault();
    if (e.repeat) return;
    const code = physToCode(e.code);
    if (!code) return;
    const cc = canonKey(code);

    if (mode === 'liveacc') {
        // 記憶: 押したキーを現グループに累積（重複は除外、消えない）
        const arr = state.hgroups[activeGroup];
        if (!arr.some((h) => canonKey(h) === cc)) { arr.push(code); applyState(); }
        return;
    }

    if (mode === 'livechord') {
        // 手順: 押下中の組をライブ表示し、離したら 1 ステップ確定
        if (pressed.size === 0) liveCombo = [];
        pressed.add(e.code);
        if (!liveCombo.includes(cc)) liveCombo.push(cc);
        state.hgroups[activeGroup] = liveCombo.slice();
        applyState();
        return;
    }

    // 現在: 押している間だけ光らせる（ライブ追従）。ピークを記録
    if (pressed.size === 0) cycleMax = [];
    pressed.add(e.code);
    if (!cycleMax.includes(cc)) cycleMax.push(cc);
    const held = heldCodes();
    state.hgroups[activeGroup] = cycleMax.filter((c) => held.has(c));
    applyState();
}

function onKeyUp(e) {
    if (!isLiveMode()) return;
    pressed.delete(e.code);

    if (mode === 'livechord') {
        if (pressed.size === 0 && liveCombo.length) {
            state.hgroups[activeGroup] = [];           // ライブ表示を消す
            if (chordFresh) { state.chords.push([]); chordFresh = false; }
            state.chords[state.chords.length - 1].push(liveCombo.slice());
            const n = state.chords[state.chords.length - 1].length;
            liveCombo = [];
            applyState();
            setStatus(`手順 ${n} 個を記録。「手順→アニメ化」でタイピング動画にできます。`);
        }
        return;
    }

    if (mode === 'live') {
        const held = heldCodes();
        if (pressed.size > 0) {
            state.hgroups[activeGroup] = cycleMax.filter((c) => held.has(c)); // ライブで縮む
        } else {
            state.hgroups[activeGroup] = cycleMax.slice();                    // 全離しでピークを保持
        }
        applyState();
    }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- 盤クリック ---

function svgCoords(ev) {
    const svg = previewBox.querySelector('svg');
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!rect.width || !vb.width) return null;
    return {
        x: (ev.clientX - rect.left) * (vb.width / rect.width),
        y: (ev.clientY - rect.top) * (vb.height / rect.height),
    };
}

function toggleHighlight(code) {
    const cc = canonKey(code);
    // 同じキーは 1 グループのみ: 他グループから除去
    state.hgroups.forEach((g, i) => {
        if (i === activeGroup) return;
        const j = g.findIndex((h) => canonKey(h) === cc);
        if (j >= 0) g.splice(j, 1);
    });
    const arr = state.hgroups[activeGroup];
    const idx = arr.findIndex((h) => canonKey(h) === cc);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(code);
    applyState();
}

previewBox.addEventListener('click', (ev) => {
    if (isLiveMode()) return;
    const pt = svgCoords(ev);
    if (!pt) return;
    const hit = hitTest({ layout: state.layout, caption: state.caption }, pt.x, pt.y);
    if (!hit) return;

    if (mode === 'highlight') {
        toggleHighlight(hit.code);
    } else if (mode === 'label') {
        const cc = canonKey(hit.code);
        const existing = state.labels.find((l) => canonKey(l.key) === cc);
        const text = window.prompt(`${hit.code} のラベル文字（空欄で削除）`, existing ? existing.text : '');
        if (text === null) return;
        state.labels = state.labels.filter((l) => canonKey(l.key) !== cc);
        if (text.trim() !== '') state.labels.push({ key: hit.code, text: text.trim() });
        applyState();
    }
});

// --- コントロール ---

modeGroup.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.mode-btn');
    if (!btn) return;
    mode = btn.dataset.mode;
    modeGroup.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    pressed.clear();
    liveCombo = [];
    cycleMax = [];
    chordFresh = true;   // 手順モードに入るたび新しい chord から
    const isLive = isLiveMode();
    previewBox.classList.toggle('live', isLive);
    const hints = {
        highlight: 'キーをクリックで選択中の色グループにハイライトの ON / OFF。',
        label: 'キーをクリックして注釈を入力。',
        live: '押している間だけキーが光ります（離すと最後の組を保持）。テキスト欄外をクリックしてから操作。',
        liveacc: '押したキーが消えずに累積します。「すべて解除」でクリア。',
        livechord: '順に押すと 1 押下ごとに手順（番号バッジ）が増えます。「手順→アニメ化」でタイピング動画に。',
    };
    setStatus(hints[mode] || '');
    if (isLive) {
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        previewBox.focus();
    }
});

clearBtn.addEventListener('click', () => {
    state.hgroups = [[], [], [], []];
    state.legends = ['', '', '', ''];
    state.chords = [];
    state.typeSeq = [];
    state.labels = [];
    chordFresh = true;
    applyState();
    setStatus('ハイライト・手順・ラベル・凡例を解除しました。');
});

// 記録した手順（chord）→ タイピングアニメ（type + sleep）へ変換
toTypeBtn.addEventListener('click', () => {
    const steps = (state.chords || []).reduce((acc, c) => acc.concat(c), []);
    if (!steps.length) {
        setStatus('記録された手順がありません。「実キー：手順」で順に押してください。');
        return;
    }
    state.typeSeq = steps;
    if (!state.sleep) state.sleep = 400;
    state.chords = [];
    chordFresh = true;
    applyState();
    setStatus(`手順 ${steps.length} 個をタイピングアニメに変換しました（sleep=${state.sleep}ms）。`);
});

captionInput.addEventListener('input', () => { state.caption = captionInput.value.trim(); applyState(); });
layoutSelect.addEventListener('change', () => { state.layout = layoutSelect.value; applyState(); });
compactChk.addEventListener('change', () => { state.compact = compactChk.checked; applyState(); });
themeSelect.addEventListener('change', () => { state.theme = themeSelect.value; applyState(); });
if (window.matchMedia) {
    // OS のライト/ダーク切替で auto テーマのプレビューを追従
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((state.theme || 'auto') === 'auto') render();
    });
}
legendInput.addEventListener('input', () => {
    state.legends[activeGroup] = legendInput.value.trim();
    applyState();
});
groupChips.addEventListener('click', (ev) => {
    const b = ev.target.closest('.chip');
    if (!b) return;
    activeGroup = parseInt(b.dataset.g, 10) || 0;
    [...groupChips.children].forEach((x, i) => x.classList.toggle('active', i === activeGroup));
    legendInput.value = (state.legends && state.legends[activeGroup]) || '';
    setStatus(`色グループ ${activeGroup + 1} を選択中。`);
});

let debounce;
codeInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(applyText, 250);
});

sampleSelect.addEventListener('change', () => {
    const s = SAMPLES[sampleSelect.value];
    if (s) { codeInput.value = s; applyText(); }
});

// --- ダウンロード ---

function svgDocString() {
    let s = currentSvg;
    if (!/xmlns=/.test(s)) s = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + s;
}

/** キーコードを配列に応じた表示名へ（Mac 系は Command→Cmd / Option→Opt） */
function displayName(token) {
    const cc = canonKey(token);
    if (state.layout === 'mac' || state.layout === 'macjis') {
        if (cc === 'Win') return 'Cmd';
        if (cc === 'Alt') return 'Opt';
    }
    return cc;
}

/** 現在のキーバインドからファイル名（拡張子なし）を作る。例: Ctrl+C / Cmd+Space / Ctrl+K_Ctrl+S */
function comboName() {
    const combos = [];
    for (const steps of (state.chords || [])) {
        combos.push(steps.map((tokens) => tokens.map(displayName).join('+')).join('_'));
    }
    const hg = (state.hgroups || []).find((g) => g && g.length);
    if (hg) combos.push(hg.map(displayName).join('+'));
    const name = combos.join('_')
        .replace(/[\\/:*?"<>|\s]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
    return name || 'keymap';
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

downloadSvgBtn.addEventListener('click', () => {
    if (!currentSvg) return;
    downloadBlob(new Blob([svgDocString()], { type: 'image/svg+xml' }), comboName() + '.svg');
});

downloadPngBtn.addEventListener('click', () => {
    if (!currentSvg) return;
    const svgEl = previewBox.querySelector('svg');
    if (!svgEl) return;
    let w = 714;
    let h = 300;
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
        const parts = vb.split(/\s+/).map(Number);
        if (parts.length === 4) { w = parts[2]; h = parts[3]; }
    }
    const scale = 2;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svgDocString()], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        const bgRect = svgEl.querySelector('rect');
        ctx.fillStyle = (bgRect && bgRect.getAttribute('fill')) || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => { if (blob) downloadBlob(blob, comboName() + '.png'); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); showError('PNG 変換に失敗しました。'); };
    img.src = url;
});

// --- 埋め込み支援（コピー・共有 URL） ---

async function copyText(text, okMsg) {
    try {
        await navigator.clipboard.writeText(text);
        setStatus(okMsg);
    } catch (e) {
        showError('クリップボードにコピーできませんでした。');
    }
}

copyCodeBtn.addEventListener('click', () => {
    copyText('```keymap\n' + codeInput.value.trim() + '\n```',
        '記法をコピーしました（Markdown 用フェンス付き）。Mermaid ビューワ等に貼れます。');
});

copySvgBtn.addEventListener('click', () => {
    if (currentSvg) copyText(svgDocString(), 'SVG をコピーしました。');
});

shareBtn.addEventListener('click', () => {
    const url = location.origin + location.pathname + '#k=' + encodeURIComponent(codeInput.value);
    copyText(url, '共有 URL をコピーしました。リンクを開くとこの図が再現されます。');
});

function codeFromHash() {
    const m = location.hash.match(/[#&]k=([^&]+)/);
    if (m) { try { return decodeURIComponent(m[1]); } catch (e) { /* noop */ } }
    return null;
}

// --- 初期化 ---

codeInput.value = codeFromHash() || SAMPLES.copy;
previewBox.style.cursor = 'pointer';
previewBox.tabIndex = 0;   // 実キー入力モードでフォーカスを受けられるように
setStatus('キーをクリックでハイライトの ON / OFF。');
applyText();

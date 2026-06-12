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
    empty:
        'keymap\n  layout: us',
};

let state = parseKeymapDsl(SAMPLES.copy);
let mode = 'highlight';
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
    const idx = state.highlights.findIndex((h) => canonKey(h) === cc);
    if (idx >= 0) state.highlights.splice(idx, 1);
    else state.highlights.push(code);
    applyState();
}

previewBox.addEventListener('click', (ev) => {
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
    setStatus(mode === 'highlight'
        ? 'キーをクリックでハイライトの ON / OFF。'
        : 'キーをクリックして注釈を入力。');
});

clearBtn.addEventListener('click', () => {
    state.highlights = [];
    state.chords = [];
    state.labels = [];
    applyState();
    setStatus('ハイライト・手順・ラベルを解除しました。');
});

captionInput.addEventListener('input', () => { state.caption = captionInput.value.trim(); applyState(); });
layoutSelect.addEventListener('change', () => { state.layout = layoutSelect.value; applyState(); });

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
    downloadBlob(new Blob([svgDocString()], { type: 'image/svg+xml' }), 'keymap.svg');
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => { if (blob) downloadBlob(blob, 'keymap.png'); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); showError('PNG 変換に失敗しました。'); };
    img.src = url;
});

// --- 初期化 ---

codeInput.value = SAMPLES.copy;
previewBox.style.cursor = 'pointer';
setStatus('キーをクリックでハイライトの ON / OFF。');
applyText();

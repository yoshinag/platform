/*
 * 将棋盤ダイアグラム ツールページ — 双方向 GUI エディタ。
 *
 * 盤クリック操作 ⇄ shogiboard 記法テキストを相互同期する。
 * Mermaid を CDN から読み込み shogiboard 外部プラグインを登録、描画は
 * すべてプラグインのレンダラ経由 (mermaid.render) で行う。
 */

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import {
    register, parseSfen, parseShogiDsl, serializeDsl, hitTest,
} from './mermaid_shogiboard.js';

// --- DOM ---
const codeInput = document.getElementById('codeInput');
const previewBox = document.getElementById('previewBox');
const errorMessage = document.getElementById('errorMessage');
const statusMsg = document.getElementById('statusMsg');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const sampleSelect = document.getElementById('sampleSelect');
const modeGroup = document.getElementById('modeGroup');
const sideGroup = document.getElementById('sideGroup');
const promoteChk = document.getElementById('promoteChk');
const piecePalette = document.getElementById('piecePalette');
const turnSelect = document.getElementById('turnSelect');
const flipChk = document.getElementById('flipChk');
const captionInput = document.getElementById('captionInput');
const handsEditor = document.getElementById('handsEditor');
const palettePanel = document.getElementById('palettePanel');

const PIECE_KANJI = { P: '歩', L: '香', N: '桂', S: '銀', G: '金', B: '角', R: '飛', K: '玉' };
const PALETTE_LETTERS = ['P', 'L', 'N', 'S', 'G', 'B', 'R', 'K'];
const HAND_LETTERS = ['R', 'B', 'G', 'S', 'N', 'L', 'P'];

const SAMPLES = {
    initial:
        'shogiboard\n  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1\n  caption: "平手初形"',
    move:
        'shogiboard\n  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL w - 2\n  highlight: 7f\n  arrow: 7g -> 7f\n  label: 7f "▲7六歩"\n  caption: "▲7六歩まで"',
    hand:
        'shogiboard\n  sfen: ln1g4l/1ks2g3/1ppp1pnp1/p3p1p1p/9/P1P1P3P/1P1P1PPP1/1KGS3R1/LN1G4L w B2Pb2p 1\n  highlight: 5e\n  caption: "持駒の例"',
    flip:
        'shogiboard\n  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1\n  flip: true\n  caption: "後手視点 (flip)"',
    empty:
        'shogiboard\n  sfen: 9/9/9/9/9/9/9/9/9 b - 1',
};

// --- state ---
let state = textToState(SAMPLES.move);
let mode = 'place';
let pal = { side: 'black', letter: 'P', promoted: false, erase: false };
let pendingArrow = null;
let renderSeq = 0;
let currentSvg = '';
const handRefs = { black: {}, white: {} };

// ---------------------------------------------------------------------------
// state <-> text
// ---------------------------------------------------------------------------

function textToState(text) {
    const d = parseShogiDsl(text);
    const s = parseSfen(d.sfen);
    const moveNo = parseInt((d.sfen.trim().split(/\s+/)[3]) || '1', 10) || 1;
    return {
        board: s.board,
        turn: s.turn,
        blackHand: s.blackHand,
        whiteHand: s.whiteHand,
        highlights: d.highlights.slice(),
        arrows: d.arrows.slice(),
        labels: d.labels.slice(),
        flip: d.flip,
        caption: d.caption,
        moveNo,
    };
}

/** GUI 操作後: state を正としてテキストへ反映し描画 */
function applyState() {
    codeInput.value = serializeDsl(state);
    syncControls();
    render();
}

/** テキスト手編集後: テキストを正として state を作り直し描画（テキストは書き換えない） */
function applyText() {
    state = textToState(codeInput.value);
    syncControls();
    render();
}

// ---------------------------------------------------------------------------
// 描画
// ---------------------------------------------------------------------------

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
register(mermaid);

function showError(msg) {
    if (msg) { errorMessage.textContent = msg; errorMessage.hidden = false; }
    else { errorMessage.textContent = ''; errorMessage.hidden = true; }
}

function setStatus(msg) {
    statusMsg.textContent = msg || '';
}

async function render() {
    const code = codeInput.value.trim();
    if (!code) {
        previewBox.innerHTML = '<p class="placeholder">盤を操作するか記法を入力すると、ここに局面が表示されます。</p>';
        currentSvg = '';
        downloadSvgBtn.disabled = true;
        downloadPngBtn.disabled = true;
        showError(null);
        return;
    }
    const seq = ++renderSeq;
    try {
        const { svg } = await mermaid.render('shogi-graph-' + seq, code);
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

// ---------------------------------------------------------------------------
// コントロール同期 (state -> UI)
// ---------------------------------------------------------------------------

function syncControls() {
    turnSelect.value = state.turn;
    flipChk.checked = state.flip;
    captionInput.value = state.caption || '';
    for (const side of ['black', 'white']) {
        const hand = side === 'black' ? state.blackHand : state.whiteHand;
        for (const letter of HAND_LETTERS) {
            const ref = handRefs[side][letter];
            if (ref) ref.textContent = String(hand[letter] || 0);
        }
    }
}

// ---------------------------------------------------------------------------
// パレット / モード UI 構築
// ---------------------------------------------------------------------------

function buildPalette() {
    for (const letter of PALETTE_LETTERS) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'piece-btn' + (letter === pal.letter ? ' active' : '');
        btn.dataset.letter = letter;
        btn.textContent = PIECE_KANJI[letter];
        piecePalette.appendChild(btn);
    }
    const eraser = document.createElement('button');
    eraser.type = 'button';
    eraser.className = 'piece-btn eraser';
    eraser.dataset.letter = '';
    eraser.textContent = '空';
    piecePalette.appendChild(eraser);

    piecePalette.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.piece-btn');
        if (!btn) return;
        pal.letter = btn.dataset.letter;
        pal.erase = btn.dataset.letter === '';
        piecePalette.querySelectorAll('.piece-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
}

function buildHandsEditor() {
    for (const [side, label] of [['black', '▲先手'], ['white', '△後手']]) {
        const row = document.createElement('div');
        row.className = 'hand-row';
        const head = document.createElement('span');
        head.className = 'hand-head';
        head.textContent = label;
        row.appendChild(head);
        for (const letter of HAND_LETTERS) {
            const group = document.createElement('span');
            group.className = 'hand-piece';
            const minus = document.createElement('button');
            minus.type = 'button';
            minus.textContent = '−';
            const count = document.createElement('span');
            count.className = 'hand-count';
            count.textContent = '0';
            const plus = document.createElement('button');
            plus.type = 'button';
            plus.textContent = '＋';
            handRefs[side][letter] = count;
            minus.addEventListener('click', () => adjustHand(side, letter, -1));
            plus.addEventListener('click', () => adjustHand(side, letter, +1));
            group.appendChild(document.createTextNode(PIECE_KANJI[letter]));
            group.appendChild(minus);
            group.appendChild(count);
            group.appendChild(plus);
            row.appendChild(group);
        }
        handsEditor.appendChild(row);
    }
}

function adjustHand(side, letter, delta) {
    const hand = side === 'black' ? state.blackHand : state.whiteHand;
    const next = Math.max(0, (hand[letter] || 0) + delta);
    if (next === 0) delete hand[letter];
    else hand[letter] = next;
    applyState();
}

// ---------------------------------------------------------------------------
// 盤クリック処理
// ---------------------------------------------------------------------------

function svgCoords(ev) {
    const svg = previewBox.querySelector('svg');
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!rect.width || !rect.height || !vb.width) return null;
    return {
        x: (ev.clientX - rect.left) * (vb.width / rect.width),
        y: (ev.clientY - rect.top) * (vb.height / rect.height),
    };
}

function toggle(arr, value) {
    const i = arr.indexOf(value);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(value);
}

previewBox.addEventListener('click', (ev) => {
    const pt = svgCoords(ev);
    if (!pt) return;
    const hit = hitTest({ flip: state.flip, caption: state.caption }, pt.x, pt.y);
    if (!hit) return;

    if (mode === 'place') {
        if (pal.erase) {
            state.board[hit.row][hit.col] = null;
        } else {
            state.board[hit.row][hit.col] = {
                letter: pal.letter,
                promoted: pal.promoted && pal.letter !== 'K' && pal.letter !== 'G',
                side: pal.side,
            };
        }
        applyState();
    } else if (mode === 'highlight') {
        toggle(state.highlights, hit.square);
        applyState();
    } else if (mode === 'arrow') {
        if (!pendingArrow) {
            pendingArrow = { from: hit.square };
            setStatus(`矢印: 始点 ${hit.square} を選択。終点をクリックしてください。`);
        } else if (pendingArrow.from === hit.square) {
            pendingArrow = null;
            setStatus('矢印をキャンセルしました。');
        } else {
            state.arrows.push({ from: pendingArrow.from, to: hit.square });
            setStatus(`矢印 ${pendingArrow.from} → ${hit.square} を追加しました。`);
            pendingArrow = null;
            applyState();
        }
    } else if (mode === 'label') {
        const existing = state.labels.find((l) => l.sq === hit.square);
        const text = window.prompt(`${hit.square} のラベル文字（空欄で削除）`, existing ? existing.text : '');
        if (text === null) return;
        state.labels = state.labels.filter((l) => l.sq !== hit.square);
        if (text.trim() !== '') state.labels.push({ sq: hit.square, text: text.trim() });
        applyState();
    }
});

// ---------------------------------------------------------------------------
// コントロールのイベント
// ---------------------------------------------------------------------------

modeGroup.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.mode-btn');
    if (!btn) return;
    mode = btn.dataset.mode;
    pendingArrow = null;
    modeGroup.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    palettePanel.style.display = mode === 'place' ? '' : 'none';
    previewBox.style.cursor = mode === 'place' ? 'pointer' : 'crosshair';
    const hints = {
        place: '駒を選んでマスをクリック。「空」で駒を消せます。',
        highlight: 'マスをクリックでハイライトの ON / OFF。',
        arrow: '始点 → 終点の順にマスをクリック。',
        label: 'マスをクリックして注釈を入力。',
    };
    setStatus(hints[mode] || '');
});

sideGroup.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.side-btn');
    if (!btn) return;
    pal.side = btn.dataset.side;
    sideGroup.querySelectorAll('.side-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
});

promoteChk.addEventListener('change', () => { pal.promoted = promoteChk.checked; });
turnSelect.addEventListener('change', () => { state.turn = turnSelect.value; applyState(); });
flipChk.addEventListener('change', () => { state.flip = flipChk.checked; applyState(); });
captionInput.addEventListener('input', () => { state.caption = captionInput.value.trim(); applyState(); });

let debounce;
codeInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(applyText, 250);
});

sampleSelect.addEventListener('change', () => {
    const s = SAMPLES[sampleSelect.value];
    if (s) { codeInput.value = s; applyText(); }
});

// ---------------------------------------------------------------------------
// ダウンロード
// ---------------------------------------------------------------------------

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
    downloadBlob(new Blob([svgDocString()], { type: 'image/svg+xml' }), 'shogiboard.svg');
});

downloadPngBtn.addEventListener('click', () => {
    if (!currentSvg) return;
    const svgEl = previewBox.querySelector('svg');
    if (!svgEl) return;
    let w = 472;
    let h = 550;
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
        canvas.toBlob((blob) => { if (blob) downloadBlob(blob, 'shogiboard.png'); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); showError('PNG 変換に失敗しました。'); };
    img.src = url;
});

// ---------------------------------------------------------------------------
// 初期化
// ---------------------------------------------------------------------------

buildPalette();
buildHandsEditor();
codeInput.value = SAMPLES.move;
previewBox.style.cursor = 'pointer';
setStatus('駒を選んでマスをクリック。「空」で駒を消せます。');
applyText();

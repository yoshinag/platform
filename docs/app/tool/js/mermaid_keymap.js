/*
 * mermaid-keymap
 * Mermaid v10+ 外部ダイアグラムプラグイン。`keymap` 記法でキーボード配列上に
 * ショートカット（押すキー・手順）を図示する。
 *
 * 記法 (DSL):
 *   keymap
 *     layout: us                  # 配列 (現状 us のみ)
 *     highlight: Ctrl Shift 4     # 押すキーを強調 (空白 / + 区切り)
 *     chord: Ctrl+K -> Ctrl+S     # 順に押す操作。手順番号バッジ付き
 *     label: 4 "範囲指定"          # キーへの注釈
 *     caption: "範囲スクリーンショット"
 *
 * キー名は大文字小文字を問わず、別名 (ctrl/control, cmd/win/super, opt/alt …) を解決する。
 */

'use strict';

export const LAYOUTS = {
    us: {
        unit: 46,
        full: true,
        rows: [
            [{ c: 'Esc', l: 'Esc' }, { gap: 1 },
                { c: 'F1' }, { c: 'F2' }, { c: 'F3' }, { c: 'F4' }, { gap: 0.5 },
                { c: 'F5' }, { c: 'F6' }, { c: 'F7' }, { c: 'F8' }, { gap: 0.5 },
                { c: 'F9' }, { c: 'F10' }, { c: 'F11' }, { c: 'F12' }],
            [{ c: '`' }, { c: '1' }, { c: '2' }, { c: '3' }, { c: '4' }, { c: '5' }, { c: '6' },
                { c: '7' }, { c: '8' }, { c: '9' }, { c: '0' }, { c: '-' }, { c: '=' },
                { c: 'Backspace', l: '⌫', w: 2 }],
            [{ c: 'Tab', l: 'Tab', w: 1.5 }, { c: 'Q' }, { c: 'W' }, { c: 'E' }, { c: 'R' }, { c: 'T' },
                { c: 'Y' }, { c: 'U' }, { c: 'I' }, { c: 'O' }, { c: 'P' }, { c: '[' }, { c: ']' },
                { c: '\\', l: '\\', w: 1.5 }],
            [{ c: 'CapsLock', l: 'Caps', w: 1.75 }, { c: 'A' }, { c: 'S' }, { c: 'D' }, { c: 'F' },
                { c: 'G' }, { c: 'H' }, { c: 'J' }, { c: 'K' }, { c: 'L' }, { c: ';' }, { c: "'" },
                { c: 'Enter', l: 'Enter', w: 2.25 }],
            [{ c: 'Shift', l: 'Shift', w: 2.25 }, { c: 'Z' }, { c: 'X' }, { c: 'C' }, { c: 'V' },
                { c: 'B' }, { c: 'N' }, { c: 'M' }, { c: ',' }, { c: '.' }, { c: '/' },
                { c: 'Shift', l: 'Shift', w: 2.75 }],
            [{ c: 'Ctrl', l: 'Ctrl', w: 1.25 }, { c: 'Win', l: 'Win', w: 1.25 },
                { c: 'Alt', l: 'Alt', w: 1.25 }, { c: 'Space', l: '', w: 6.25 },
                { c: 'Alt', l: 'Alt', w: 1.25 }, { c: 'Win', l: 'Win', w: 1.25 },
                { c: 'Menu', l: 'Menu', w: 1.25 }, { c: 'Ctrl', l: 'Ctrl', w: 1.25 }],
        ],
    },

    // Mac (US 配列)。修飾キーは ⌘⌥⌃⇧ で表示。コードは canonical のまま
    // (Command=Win / Option=Alt / Control=Ctrl) なので highlight: Cmd 等で一致する。
    mac: {
        unit: 46,
        full: true,
        rows: [
            [{ c: 'Esc', l: 'esc' }, { gap: 1 },
                { c: 'F1' }, { c: 'F2' }, { c: 'F3' }, { c: 'F4' }, { gap: 0.5 },
                { c: 'F5' }, { c: 'F6' }, { c: 'F7' }, { c: 'F8' }, { gap: 0.5 },
                { c: 'F9' }, { c: 'F10' }, { c: 'F11' }, { c: 'F12' }],
            [{ c: '`' }, { c: '1' }, { c: '2' }, { c: '3' }, { c: '4' }, { c: '5' }, { c: '6' },
                { c: '7' }, { c: '8' }, { c: '9' }, { c: '0' }, { c: '-' }, { c: '=' },
                { c: 'Backspace', l: '⌫', w: 2 }],
            [{ c: 'Tab', l: '⇥', w: 1.5 }, { c: 'Q' }, { c: 'W' }, { c: 'E' }, { c: 'R' }, { c: 'T' },
                { c: 'Y' }, { c: 'U' }, { c: 'I' }, { c: 'O' }, { c: 'P' }, { c: '[' }, { c: ']' },
                { c: '\\', l: '\\', w: 1.5 }],
            [{ c: 'CapsLock', l: '⇪', w: 1.75 }, { c: 'A' }, { c: 'S' }, { c: 'D' }, { c: 'F' },
                { c: 'G' }, { c: 'H' }, { c: 'J' }, { c: 'K' }, { c: 'L' }, { c: ';' }, { c: "'" },
                { c: 'Enter', l: 'return', w: 2.25 }],
            [{ c: 'Shift', l: '⇧', w: 2.25 }, { c: 'Z' }, { c: 'X' }, { c: 'C' }, { c: 'V' },
                { c: 'B' }, { c: 'N' }, { c: 'M' }, { c: ',' }, { c: '.' }, { c: '/' },
                { c: 'Shift', l: '⇧', w: 2.75 }],
            [{ c: 'Fn', l: 'fn', w: 1.25 }, { c: 'Ctrl', l: '⌃', w: 1.25 },
                { c: 'Alt', l: '⌥', w: 1.25 }, { c: 'Win', l: '⌘', w: 1.25 },
                { c: 'Space', l: '', w: 6.25 }, { c: 'Win', l: '⌘', w: 1.25 },
                { c: 'Alt', l: '⌥', w: 1.25 }, { c: 'Ctrl', l: '⌃', w: 1.25 }],
        ],
    },

    // JIS (日本語 109 系)。L 字 Enter は h:2 の縦長キーで近似。
    jis: {
        unit: 46,
        full: true,
        rows: [
            [{ c: 'Esc', l: 'Esc' }, { gap: 1 },
                { c: 'F1' }, { c: 'F2' }, { c: 'F3' }, { c: 'F4' }, { gap: 0.5 },
                { c: 'F5' }, { c: 'F6' }, { c: 'F7' }, { c: 'F8' }, { gap: 0.5 },
                { c: 'F9' }, { c: 'F10' }, { c: 'F11' }, { c: 'F12' }],
            [{ c: '半/全', l: '半/全' }, { c: '1' }, { c: '2' }, { c: '3' }, { c: '4' }, { c: '5' },
                { c: '6' }, { c: '7' }, { c: '8' }, { c: '9' }, { c: '0' }, { c: '-' }, { c: '^' },
                { c: '¥', l: '¥' }, { c: 'Backspace', l: '⌫' }],
            [{ c: 'Tab', l: 'Tab', w: 1.5 }, { c: 'Q' }, { c: 'W' }, { c: 'E' }, { c: 'R' }, { c: 'T' },
                { c: 'Y' }, { c: 'U' }, { c: 'I' }, { c: 'O' }, { c: 'P' }, { c: '@' }, { c: '[' },
                { c: 'Enter', l: 'Enter', w: 1.5, h: 2 }],
            [{ c: 'CapsLock', l: '英数', w: 1.5 }, { c: 'A' }, { c: 'S' }, { c: 'D' }, { c: 'F' },
                { c: 'G' }, { c: 'H' }, { c: 'J' }, { c: 'K' }, { c: 'L' }, { c: ';' }, { c: ':' },
                { c: ']' }],
            [{ c: 'Shift', l: 'Shift', w: 2.25 }, { c: 'Z' }, { c: 'X' }, { c: 'C' }, { c: 'V' },
                { c: 'B' }, { c: 'N' }, { c: 'M' }, { c: ',' }, { c: '.' }, { c: '/' },
                { c: 'Ro', l: 'ろ' }, { c: 'Shift', l: 'Shift', w: 1.75 }],
            [{ c: 'Ctrl', l: 'Ctrl', w: 1.25 }, { c: 'Win', l: 'Win' }, { c: 'Alt', l: 'Alt' },
                { c: '無変換', l: '無変換' }, { c: 'Space', l: '', w: 3.5 }, { c: '変換', l: '変換' },
                { c: 'かな', l: 'かな' }, { c: 'Alt', l: 'Alt' }, { c: 'Win', l: 'Win' },
                { c: 'Menu', l: 'Menu' }, { c: 'Ctrl', l: 'Ctrl', w: 1.25 }],
        ],
    },

    // JIS-Mac (JIS 配列 + ⌘⌥⌃⇧ キーキャップ)。ボトム行は 英数 / かな を
    // スペース両脇に配置。修飾コードは canonical (⌘=Win / ⌥=Alt)。
    macjis: {
        unit: 46,
        full: true,
        rows: [
            [{ c: 'Esc', l: 'esc' }, { gap: 1 },
                { c: 'F1' }, { c: 'F2' }, { c: 'F3' }, { c: 'F4' }, { gap: 0.5 },
                { c: 'F5' }, { c: 'F6' }, { c: 'F7' }, { c: 'F8' }, { gap: 0.5 },
                { c: 'F9' }, { c: 'F10' }, { c: 'F11' }, { c: 'F12' }],
            [{ c: '半/全', l: '半/全' }, { c: '1' }, { c: '2' }, { c: '3' }, { c: '4' }, { c: '5' },
                { c: '6' }, { c: '7' }, { c: '8' }, { c: '9' }, { c: '0' }, { c: '-' }, { c: '^' },
                { c: '¥', l: '¥' }, { c: 'Backspace', l: '⌫' }],
            [{ c: 'Tab', l: '⇥', w: 1.5 }, { c: 'Q' }, { c: 'W' }, { c: 'E' }, { c: 'R' }, { c: 'T' },
                { c: 'Y' }, { c: 'U' }, { c: 'I' }, { c: 'O' }, { c: 'P' }, { c: '@' }, { c: '[' },
                { c: 'Enter', l: 'return', w: 1.5, h: 2 }],
            [{ c: 'CapsLock', l: '⇪', w: 1.5 }, { c: 'A' }, { c: 'S' }, { c: 'D' }, { c: 'F' },
                { c: 'G' }, { c: 'H' }, { c: 'J' }, { c: 'K' }, { c: 'L' }, { c: ';' }, { c: ':' },
                { c: ']' }],
            [{ c: 'Shift', l: '⇧', w: 2.25 }, { c: 'Z' }, { c: 'X' }, { c: 'C' }, { c: 'V' },
                { c: 'B' }, { c: 'N' }, { c: 'M' }, { c: ',' }, { c: '.' }, { c: '/' },
                { c: 'Ro', l: 'ろ' }, { c: 'Shift', l: '⇧', w: 1.75 }],
            [{ c: 'Fn', l: 'fn', w: 1.25 }, { c: 'Ctrl', l: '⌃', w: 1.25 }, { c: 'Alt', l: '⌥', w: 1.25 },
                { c: 'Win', l: '⌘', w: 1.25 }, { c: '英数', l: '英数', w: 1.25 }, { c: 'Space', l: '', w: 2.5 },
                { c: 'かな', l: 'かな', w: 1.25 }, { c: 'Win', l: '⌘', w: 1.25 }, { c: 'Alt', l: '⌥', w: 1.25 }],
        ],
    },
};

const ALIAS = {
    control: 'Ctrl', ctrl: 'Ctrl', ctl: 'Ctrl',
    shift: 'Shift',
    alt: 'Alt', option: 'Alt', opt: 'Alt',
    win: 'Win', windows: 'Win', super: 'Win', meta: 'Win', cmd: 'Win', command: 'Win', gui: 'Win',
    esc: 'Esc', escape: 'Esc',
    enter: 'Enter', return: 'Enter', ret: 'Enter',
    fn: 'Fn',
    tab: 'Tab',
    backspace: 'Backspace', bksp: 'Backspace', bs: 'Backspace',
    space: 'Space', spacebar: 'Space', spc: 'Space',
    caps: 'CapsLock', capslock: 'CapsLock',
    menu: 'Menu', apps: 'Menu',
    up: 'Up', arrowup: 'Up', '↑': 'Up',
    down: 'Down', arrowdown: 'Down', '↓': 'Down',
    left: 'Left', arrowleft: 'Left', '←': 'Left',
    right: 'Right', arrowright: 'Right', '→': 'Right',
};

// テンキー名 (numlock / numadd など) の正規化
const NUMPAD_NAMED = {
    numlock: 'NumLock',
    numadd: 'NumAdd', numplus: 'NumAdd',
    numsub: 'NumSub', numminus: 'NumSub',
    nummul: 'NumMul', numstar: 'NumMul', numtimes: 'NumMul',
    numdiv: 'NumDiv', numslash: 'NumDiv',
    numdot: 'NumDot', numperiod: 'NumDot', numdecimal: 'NumDot',
    numenter: 'NumEnter',
};

/** キー名を正規コードへ正規化 (別名・大小・F キー対応) */
export function canonKey(token) {
    const t = String(token == null ? '' : token).trim();
    if (!t) return '';
    const low = t.toLowerCase();
    if (ALIAS[low]) return ALIAS[low];
    if (/^[a-z]$/.test(low)) return low.toUpperCase();
    if (/^f([1-9]|1[0-2])$/.test(low)) return 'F' + low.slice(1);
    if (NUMPAD_NAMED[low]) return NUMPAD_NAMED[low];
    const mnum = low.match(/^(?:num|numpad|kp|np)([0-9])$/);
    if (mnum) return 'Num' + mnum[1];
    return t;
}

// ---------------------------------------------------------------------------
// パーサ
// ---------------------------------------------------------------------------

export function parseKeymapDsl(text) {
    const out = { layout: 'us', highlights: [], chords: [], labels: [], caption: '' };
    const lines = String(text || '').split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || /^keymap\b/i.test(line) || line.startsWith('#')) continue;
        const m = line.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
        if (!m) continue;
        const key = m[1].toLowerCase();
        const val = m[2].trim();
        switch (key) {
            case 'layout':
                if (LAYOUTS[val.toLowerCase()]) out.layout = val.toLowerCase();
                break;
            case 'highlight':
            case 'keys':
                out.highlights.push(...val.split(/[\s+]+/).filter(Boolean));
                break;
            case 'chord': {
                const steps = val.split(/->|→/).map((s) => s.split(/[\s+]+/).filter(Boolean))
                    .filter((arr) => arr.length);
                if (steps.length) out.chords.push(steps);
                break;
            }
            case 'label': {
                const lm = val.match(/^(\S+)\s+"?(.*?)"?$/);
                if (lm) out.labels.push({ key: lm[1], text: lm[2] });
                break;
            }
            case 'caption':
            case 'title':
                out.caption = val.replace(/^"|"$/g, '');
                break;
            default:
                break;
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// レイアウト計算（描画・当たり判定で共有）
// ---------------------------------------------------------------------------

const PAD = 12;

/** data からキー矩形の配列と図全体の寸法を返す */
export function computeKeys(data) {
    const layout = LAYOUTS[(data && data.layout) || 'us'] || LAYOUTS.us;
    const U = layout.unit;
    const capH = data && data.caption ? 30 : 0;
    const top = capH + 10;
    const keys = [];
    let maxRight = 0;
    layout.rows.forEach((row, r) => {
        let x = PAD;
        const y = top + r * U;
        for (const item of row) {
            if (item.gap) { x += item.gap * U; continue; }
            const w = (item.w || 1) * U;
            keys.push({
                code: item.c,
                label: item.l !== undefined ? item.l : item.c,
                x, y, w, h: (item.h || 1) * U,
            });
            x += w;
        }
        if (x > maxRight) maxRight = x;
    });

    let contentRight = maxRight;
    if (layout.full) {
        const G = 0.5 * U;
        // 矢印キークラスタ (逆 T)。row4=↑, row5=←↓→
        const aX = maxRight + G;
        keys.push({ code: 'Up', label: '↑', x: aX + U, y: top + 4 * U, w: U, h: U });
        keys.push({ code: 'Left', label: '←', x: aX, y: top + 5 * U, w: U, h: U });
        keys.push({ code: 'Down', label: '↓', x: aX + U, y: top + 5 * U, w: U, h: U });
        keys.push({ code: 'Right', label: '→', x: aX + 2 * U, y: top + 5 * U, w: U, h: U });
        contentRight = Math.max(contentRight, aX + 3 * U);

        // テンキー (4 列 × row1〜5)。+ と Enter は h:2
        const nX = aX + 3 * U + G;
        const np = (c, r, code, label, w = 1, h = 1) => keys.push({
            code, label, x: nX + c * U, y: top + r * U, w: w * U, h: h * U,
        });
        np(0, 1, 'NumLock', 'Num'); np(1, 1, 'NumDiv', '/'); np(2, 1, 'NumMul', '*'); np(3, 1, 'NumSub', '-');
        np(0, 2, 'Num7', '7'); np(1, 2, 'Num8', '8'); np(2, 2, 'Num9', '9'); np(3, 2, 'NumAdd', '+', 1, 2);
        np(0, 3, 'Num4', '4'); np(1, 3, 'Num5', '5'); np(2, 3, 'Num6', '6');
        np(0, 4, 'Num1', '1'); np(1, 4, 'Num2', '2'); np(2, 4, 'Num3', '3'); np(3, 4, 'NumEnter', 'Enter', 1, 2);
        np(0, 5, 'Num0', '0', 2); np(2, 5, 'NumDot', '.');
        contentRight = Math.max(contentRight, nX + 4 * U);
    }

    return {
        keys,
        width: contentRight + PAD,
        height: top + layout.rows.length * U + PAD,
    };
}

/** SVG 座標 (x,y) がどのキーか。盤外なら null、内なら { code } */
export function hitTest(data, x, y) {
    const { keys } = computeKeys(data);
    for (const k of keys) {
        if (x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h) return { code: k.code };
    }
    return null;
}

// ---------------------------------------------------------------------------
// レンダラ
// ---------------------------------------------------------------------------

const C = {
    keyFill: '#ffffff',
    keyStroke: '#b9b9bd',
    keyText: '#2a2a2e',
    hlFill: '#ffd24a',
    hlStroke: '#d99e00',
    hlText: '#1a1a00',
    badge: '#d8462f',
    badgeText: '#ffffff',
    caption: '#1f1409',
    label: '#1f1409',
};

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function keyFont(label) {
    const n = Array.from(String(label)).length;
    if (n <= 1) return 18;
    if (n <= 2) return 14;
    return 11;
}

/** 描画データから SVG の中身と寸法を返す */
export function renderKeymap(data) {
    const { keys, width, height } = computeKeys(data);

    // ハイライト集合と手順番号
    const hlSet = new Set((data.highlights || []).map(canonKey).filter(Boolean));
    const stepMap = new Map();
    (data.chords || []).forEach((steps) => {
        steps.forEach((tokens, i) => {
            tokens.map(canonKey).forEach((code) => {
                if (!code) return;
                hlSet.add(code);
                if (!stepMap.has(code)) stepMap.set(code, i + 1);
            });
        });
    });

    // ラベルをコード→テキストへ
    const labelMap = new Map();
    for (const lb of (data.labels || [])) labelMap.set(canonKey(lb.key), lb.text);

    const p = [];
    p.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`);

    if (data.caption) {
        p.push(`<text x="${width / 2}" y="20" text-anchor="middle" font-size="16" `
            + `font-weight="bold" fill="${C.caption}">${esc(data.caption)}</text>`);
    }

    for (const k of keys) {
        const code = canonKey(k.code);
        const hot = hlSet.has(code);
        const fill = hot ? C.hlFill : C.keyFill;
        const stroke = hot ? C.hlStroke : C.keyStroke;
        const textFill = hot ? C.hlText : C.keyText;
        const cx = k.x + k.w / 2;
        const cy = k.y + k.h / 2;

        p.push(`<rect x="${k.x + 2}" y="${k.y + 2}" width="${k.w - 4}" height="${k.h - 4}" `
            + `rx="6" ry="6" fill="${fill}" stroke="${stroke}" stroke-width="${hot ? 2 : 1}"/>`);

        if (k.label !== '') {
            p.push(`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" `
                + `font-size="${keyFont(k.label)}" font-weight="${hot ? 'bold' : 'normal'}" `
                + `fill="${textFill}">${esc(k.label)}</text>`);
        }

        // 手順番号バッジ
        if (stepMap.has(code)) {
            const bx = k.x + k.w - 9;
            const by = k.y + 9;
            p.push(`<circle cx="${bx}" cy="${by}" r="8" fill="${C.badge}"/>`);
            p.push(`<text x="${bx}" y="${by}" text-anchor="middle" dominant-baseline="central" `
                + `font-size="10" font-weight="bold" fill="${C.badgeText}">${stepMap.get(code)}</text>`);
        }

        // キー注釈
        if (labelMap.has(code)) {
            p.push(`<text x="${cx}" y="${k.y + k.h - 5}" text-anchor="middle" font-size="9" `
                + `font-weight="bold" fill="${C.label}" stroke="#ffffff" stroke-width="2.5" `
                + `paint-order="stroke">${esc(labelMap.get(code))}</text>`);
        }
    }

    return { inner: p.join(''), width, height };
}

// ---------------------------------------------------------------------------
// 状態 → DSL シリアライズ（双方向 GUI 用）
// ---------------------------------------------------------------------------

export function serializeKeymap(state) {
    const lines = ['keymap'];
    lines.push('  layout: ' + (state.layout || 'us'));
    if (state.highlights && state.highlights.length) {
        lines.push('  highlight: ' + state.highlights.join(' '));
    }
    for (const steps of (state.chords || [])) {
        lines.push('  chord: ' + steps.map((s) => s.join('+')).join(' -> '));
    }
    for (const lb of (state.labels || [])) {
        lines.push('  label: ' + lb.key + ' "' + lb.text + '"');
    }
    if (state.caption) lines.push('  caption: "' + state.caption + '"');
    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Mermaid 外部ダイアグラム登録
// ---------------------------------------------------------------------------

let _data = null;

const db = {
    clear() { _data = null; },
    setData(d) { _data = d; },
    getData() { return _data; },
    getConfig() { return {}; },
    getDiagramTitle() { return (_data && _data.caption) || ''; },
    getAccTitle() { return ''; },
    getAccDescription() { return ''; },
};

const parser = {
    parser: { yy: db },
    parse(text) { db.setData(parseKeymapDsl(text)); },
};

const renderer = {
    draw(text, id) {
        const data = db.getData() || parseKeymapDsl(text);
        const { inner, width, height } = renderKeymap(data);
        const svg = document.getElementById(id) || document.querySelector(`[id="${id}"]`);
        if (!svg) throw new Error(`keymap: SVG element #${id} not found`);
        svg.innerHTML = inner;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.maxWidth = '100%';
    },
};

export function keymapDiagram() {
    return {
        id: 'keymap',
        detector: (txt) => /^\s*keymap\b/.test(txt),
        loader: async () => ({
            id: 'keymap',
            diagram: { db, parser, renderer, styles: () => '' },
        }),
    };
}

export function register(mermaid) {
    mermaid.registerExternalDiagrams([keymapDiagram()]);
}

export default {
    register, keymapDiagram, parseKeymapDsl, renderKeymap, computeKeys,
    hitTest, canonKey, serializeKeymap, LAYOUTS,
};

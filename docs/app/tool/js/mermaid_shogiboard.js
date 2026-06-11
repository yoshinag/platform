/*
 * mermaid-shogiboard
 * Mermaid v10+ 外部ダイアグラムプラグイン。`shogiboard` 記法で将棋の局面図を描く。
 *
 * 記法 (DSL):
 *   shogiboard
 *     sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1
 *     highlight: 7f 2f          # マス目をハイライト (空白区切り、複数可)
 *     arrow: 7g -> 7f           # 矢印 (複数行可)
 *     label: 7f "▲7六歩"        # マスへの注釈ラベル
 *     flip: true                # 後手視点で反転 (省略時 false)
 *     caption: "図1 角換わり"    # 図のキャプション
 *
 * 局面は SFEN を一行でそのまま埋め込む。マス目表記は「筋(1-9)+段(a-i)」(例: 7f = 7 筋 f 段)。
 *
 * 使い方:
 *   import { register } from './mermaid_shogiboard.js';
 *   register(mermaid);
 */

'use strict';

export const INITIAL_SFEN =
    'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';

// 駒の漢字表記
const PIECE_KANJI = { P: '歩', L: '香', N: '桂', S: '銀', G: '金', B: '角', R: '飛', K: '玉' };
const PROMOTED_KANJI = { P: 'と', L: '杏', N: '圭', S: '全', B: '馬', R: '龍' };
// 持ち駒の表示順 (大駒 → 小駒)
const HAND_ORDER = ['R', 'B', 'G', 'S', 'N', 'L', 'P'];
const KANJI_NUM = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九',
    '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八'];

// ---------------------------------------------------------------------------
// パーサ
// ---------------------------------------------------------------------------

/** SFEN 文字列を { board, turn, blackHand, whiteHand } へ。board[row][col]: row0=a 段(上)/col0=9 筋(左) */
export function parseSfen(sfen) {
    const parts = String(sfen || '').trim().split(/\s+/);
    const boardStr = parts[0] || '';
    const turn = parts[1] === 'w' ? 'white' : 'black';
    const handStr = parts[2] || '-';

    const board = [];
    const ranks = boardStr.split('/');
    for (let r = 0; r < 9; r++) {
        const row = new Array(9).fill(null);
        const rs = ranks[r] || '';
        let col = 0;
        let promoted = false;
        for (let i = 0; i < rs.length; i++) {
            const ch = rs[i];
            if (ch === '+') { promoted = true; continue; }
            if (ch >= '0' && ch <= '9') { col += parseInt(ch, 10); promoted = false; continue; }
            const side = ch === ch.toUpperCase() ? 'black' : 'white';
            if (col < 9) row[col] = { letter: ch.toUpperCase(), promoted, side };
            col++;
            promoted = false;
        }
        board.push(row);
    }

    const blackHand = {};
    const whiteHand = {};
    if (handStr && handStr !== '-') {
        let i = 0;
        while (i < handStr.length) {
            let numStr = '';
            while (handStr[i] >= '0' && handStr[i] <= '9') { numStr += handStr[i]; i++; }
            const num = numStr ? parseInt(numStr, 10) : 1;
            const ch = handStr[i];
            i++;
            if (!ch) break;
            const hand = ch === ch.toUpperCase() ? blackHand : whiteHand;
            const letter = ch.toUpperCase();
            hand[letter] = (hand[letter] || 0) + num;
        }
    }

    return { board, turn, blackHand, whiteHand };
}

/** shogiboard DSL をパースして描画用データへ */
export function parseShogiDsl(text) {
    const out = {
        sfen: INITIAL_SFEN,
        highlights: [],
        arrows: [],
        labels: [],
        flip: false,
        caption: '',
    };
    const lines = String(text || '').split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || /^shogiboard\b/i.test(line) || line.startsWith('#')) continue;
        const m = line.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
        if (!m) continue;
        const key = m[1].toLowerCase();
        const val = m[2].trim();
        switch (key) {
            case 'sfen':
                if (val) out.sfen = val;
                break;
            case 'highlight':
                out.highlights.push(...val.split(/[\s,]+/).filter(Boolean));
                break;
            case 'arrow': {
                const am = val.match(/([1-9][a-i])\s*->\s*([1-9][a-i])/i);
                if (am) out.arrows.push({ from: am[1].toLowerCase(), to: am[2].toLowerCase() });
                break;
            }
            case 'label': {
                const lm = val.match(/^([1-9][a-i])\s+"?(.*?)"?$/i);
                if (lm) out.labels.push({ sq: lm[1].toLowerCase(), text: lm[2] });
                break;
            }
            case 'flip':
                out.flip = /^(true|1|yes|on)$/i.test(val);
                break;
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

/** "7f" → { col, row } (実盤面座標: col0=9 筋/row0=a 段) */
function squareToColRow(sq) {
    const file = parseInt(sq[0], 10);
    const rank = sq.charCodeAt(1) - 'a'.charCodeAt(0);
    if (!(file >= 1 && file <= 9) || !(rank >= 0 && rank <= 8)) return null;
    return { col: 9 - file, row: rank };
}

// ---------------------------------------------------------------------------
// レンダラ
// ---------------------------------------------------------------------------

const CELL = 48;
const BOARD = CELL * 9;
const HAND_H = 44;
const TOP = 30;        // 筋ラベル帯
const RIGHT = 30;      // 段ラベル帯
const LEFT_PAD = 10;

const C = {
    boardFill: '#f3d9a4',
    line: '#6b4a23',
    text: '#1f1409',
    highlight: '#ffe46b',
    arrow: '#d8462f',
    label: '#1f1409',
};

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** 実盤面座標 (col0=9 筋/row0=a 段) → "7f" 形式のマス名 */
export function squareName(col, row) {
    return String(9 - col) + String.fromCharCode('a'.charCodeAt(0) + row);
}

/**
 * SVG ビューポート座標 (x,y) がどのマスかを判定。GUI エディタ用。
 * data は { flip, caption } を参照する (描画寸法に影響するため)。
 * 盤外なら null、盤内なら { col, row, square } (実盤面座標) を返す。
 */
export function hitTest(data, x, y) {
    const capH = data && data.caption ? 26 : 0;
    const boardX = LEFT_PAD;
    const boardY = capH + HAND_H + TOP;
    const dCol = Math.floor((x - boardX) / CELL);
    const dRow = Math.floor((y - boardY) / CELL);
    if (dCol < 0 || dCol > 8 || dRow < 0 || dRow > 8) return null;
    const flip = !!(data && data.flip);
    const col = flip ? 8 - dCol : dCol;
    const row = flip ? 8 - dRow : dRow;
    return { col, row, square: squareName(col, row) };
}

/** board / 手番 / 持駒 から SFEN 文字列を生成 */
export function serializeSfen(board, turn, blackHand, whiteHand, moveNo) {
    const rankStrs = [];
    for (let r = 0; r < 9; r++) {
        let s = '';
        let empty = 0;
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (!piece) { empty++; continue; }
            if (empty) { s += empty; empty = 0; }
            const letter = piece.side === 'black'
                ? piece.letter.toUpperCase()
                : piece.letter.toLowerCase();
            s += (piece.promoted ? '+' : '') + letter;
        }
        if (empty) s += empty;
        rankStrs.push(s || '9');
    }

    const handStr = (hand, upper) => {
        let s = '';
        for (const letter of HAND_ORDER) {
            const n = hand && hand[letter];
            if (!n) continue;
            s += (n > 1 ? n : '') + (upper ? letter : letter.toLowerCase());
        }
        return s;
    };
    const hands = handStr(blackHand, true) + handStr(whiteHand, false);

    return [
        rankStrs.join('/'),
        turn === 'white' ? 'w' : 'b',
        hands || '-',
        moveNo || 1,
    ].join(' ');
}

/** 描画用 state ({ board, turn, hands, highlights, arrows, labels, flip, caption, moveNo }) を shogiboard DSL テキストへ */
export function serializeDsl(state) {
    const lines = ['shogiboard'];
    lines.push('  sfen: ' + serializeSfen(
        state.board, state.turn, state.blackHand, state.whiteHand, state.moveNo));
    if (state.highlights && state.highlights.length) {
        lines.push('  highlight: ' + state.highlights.join(' '));
    }
    for (const a of (state.arrows || [])) {
        lines.push('  arrow: ' + a.from + ' -> ' + a.to);
    }
    for (const l of (state.labels || [])) {
        lines.push('  label: ' + l.sq + ' "' + l.text + '"');
    }
    if (state.flip) lines.push('  flip: true');
    if (state.caption) lines.push('  caption: "' + state.caption + '"');
    return lines.join('\n');
}

function handText(prefix, hand) {
    const items = [];
    for (const letter of HAND_ORDER) {
        const n = hand[letter];
        if (!n) continue;
        items.push(PIECE_KANJI[letter] + (n > 1 ? (KANJI_NUM[n] || String(n)) : ''));
    }
    return prefix + (items.length ? items.join('　') : 'なし');
}

/** 描画データから SVG の中身 (inner markup) と寸法を返す */
export function renderBoard(data) {
    const { board, blackHand, whiteHand } = parseSfen(data.sfen);
    const flip = !!data.flip;
    const capH = data.caption ? 26 : 0;

    const boardX = LEFT_PAD;
    const boardY = capH + HAND_H + TOP;
    const W = boardX + BOARD + RIGHT;
    const H = capH + HAND_H + TOP + BOARD + HAND_H;

    // 実座標 → 表示座標 (flip 時は 180 度回転)
    const disp = (col, row) => (flip ? { col: 8 - col, row: 8 - row } : { col, row });
    const cellX = (dCol) => boardX + dCol * CELL;
    const cellY = (dRow) => boardY + dRow * CELL;

    const p = [];

    // 背景 (PNG 化時に白地にする)
    p.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);

    // キャプション
    if (data.caption) {
        p.push(`<text x="${W / 2}" y="17" text-anchor="middle" font-size="15" `
            + `font-weight="bold" fill="${C.text}">${esc(data.caption)}</text>`);
    }

    // 持ち駒 (後手=上, 先手=下)
    p.push(`<text x="${boardX}" y="${capH + HAND_H - 12}" font-size="15" fill="${C.text}">`
        + `${esc(handText('△持駒 ', whiteHand))}</text>`);
    p.push(`<text x="${boardX}" y="${boardY + BOARD + 28}" font-size="15" fill="${C.text}">`
        + `${esc(handText('▲持駒 ', blackHand))}</text>`);

    // 盤の地
    p.push(`<rect x="${boardX}" y="${boardY}" width="${BOARD}" height="${BOARD}" `
        + `fill="${C.boardFill}" stroke="${C.line}" stroke-width="2"/>`);

    // ハイライト (駒の下)
    for (const sq of data.highlights) {
        const cr = squareToColRow(sq);
        if (!cr) continue;
        const d = disp(cr.col, cr.row);
        p.push(`<rect x="${cellX(d.col) + 2}" y="${cellY(d.row) + 2}" `
            + `width="${CELL - 4}" height="${CELL - 4}" fill="${C.highlight}" `
            + `fill-opacity="0.7"/>`);
    }

    // 格子線
    for (let i = 1; i < 9; i++) {
        const x = boardX + i * CELL;
        p.push(`<line x1="${x}" y1="${boardY}" x2="${x}" y2="${boardY + BOARD}" `
            + `stroke="${C.line}" stroke-width="1"/>`);
        const y = boardY + i * CELL;
        p.push(`<line x1="${boardX}" y1="${y}" x2="${boardX + BOARD}" y2="${y}" `
            + `stroke="${C.line}" stroke-width="1"/>`);
    }
    // 星 (3 線・6 線の交点)
    for (const gx of [3, 6]) {
        for (const gy of [3, 6]) {
            p.push(`<circle cx="${boardX + gx * CELL}" cy="${boardY + gy * CELL}" r="3" `
                + `fill="${C.line}"/>`);
        }
    }

    // 筋ラベル (上) / 段ラベル (右)
    for (let dCol = 0; dCol < 9; dCol++) {
        const realCol = flip ? 8 - dCol : dCol;
        const file = 9 - realCol;
        p.push(`<text x="${cellX(dCol) + CELL / 2}" y="${boardY - 8}" `
            + `text-anchor="middle" font-size="14" fill="${C.text}">${file}</text>`);
    }
    for (let dRow = 0; dRow < 9; dRow++) {
        const realRow = flip ? 8 - dRow : dRow;
        p.push(`<text x="${boardX + BOARD + RIGHT / 2}" y="${cellY(dRow) + CELL / 2 + 5}" `
            + `text-anchor="middle" font-size="14" fill="${C.text}">${KANJI_NUM[realRow + 1]}</text>`);
    }

    // 駒
    const bottomSide = flip ? 'white' : 'black';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const d = disp(c, r);
            const cx = cellX(d.col) + CELL / 2;
            const cy = cellY(d.row) + CELL / 2;
            let kanji = piece.promoted
                ? (PROMOTED_KANJI[piece.letter] || PIECE_KANJI[piece.letter])
                : PIECE_KANJI[piece.letter];
            // 玉将は先手=王 / 後手=玉 で書き分ける
            if (piece.letter === 'K') kanji = piece.side === 'black' ? '王' : '玉';
            const rotate = piece.side !== bottomSide;
            const transform = rotate ? ` transform="rotate(180 ${cx} ${cy})"` : '';
            const fill = piece.promoted ? C.arrow : C.text;
            p.push(`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" `
                + `font-size="31" font-weight="bold" fill="${fill}"${transform}>`
                + `${esc(kanji)}</text>`);
        }
    }

    // ラベル (マス下端)
    for (const lb of data.labels) {
        const cr = squareToColRow(lb.sq);
        if (!cr) continue;
        const d = disp(cr.col, cr.row);
        p.push(`<text x="${cellX(d.col) + CELL / 2}" y="${cellY(d.row) + CELL - 4}" `
            + `text-anchor="middle" font-size="10" font-weight="bold" fill="${C.label}" `
            + `stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${esc(lb.text)}</text>`);
    }

    // 矢印 (最前面)
    for (const ar of data.arrows) {
        const f = squareToColRow(ar.from);
        const t = squareToColRow(ar.to);
        if (!f || !t) continue;
        const df = disp(f.col, f.row);
        const dt = disp(t.col, t.row);
        const fx = cellX(df.col) + CELL / 2;
        const fy = cellY(df.row) + CELL / 2;
        const tx = cellX(dt.col) + CELL / 2;
        const ty = cellY(dt.row) + CELL / 2;
        const dx = tx - fx;
        const dy = ty - fy;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const headLen = 15;
        const headW = 9;
        const tipX = tx - ux * 6;
        const tipY = ty - uy * 6;
        const bx = tipX - ux * headLen;
        const by = tipY - uy * headLen;
        const p1x = bx - uy * headW;
        const p1y = by + ux * headW;
        const p2x = bx + uy * headW;
        const p2y = by - ux * headW;
        p.push(`<line x1="${fx}" y1="${fy}" x2="${bx}" y2="${by}" stroke="${C.arrow}" `
            + `stroke-width="4.5" stroke-linecap="round" stroke-opacity="0.9"/>`);
        p.push(`<polygon points="${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}" `
            + `fill="${C.arrow}" fill-opacity="0.9"/>`);
    }

    return { inner: p.join(''), width: W, height: H };
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
    parse(text) {
        db.setData(parseShogiDsl(text));
    },
};

const renderer = {
    draw(text, id) {
        const data = db.getData() || parseShogiDsl(text);
        const { inner, width, height } = renderBoard(data);
        const svg = document.getElementById(id)
            || document.querySelector(`[id="${id}"]`);
        if (!svg) throw new Error(`shogiboard: SVG element #${id} not found`);
        svg.innerHTML = inner;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.maxWidth = '100%';
    },
};

export function shogiboardDiagram() {
    return {
        id: 'shogiboard',
        detector: (txt) => /^\s*shogiboard\b/.test(txt),
        loader: async () => ({
            id: 'shogiboard',
            diagram: { db, parser, renderer, styles: () => '' },
        }),
    };
}

/** mermaid インスタンスに shogiboard プラグインを登録 */
export function register(mermaid) {
    mermaid.registerExternalDiagrams([shogiboardDiagram()]);
}

export default {
    register, shogiboardDiagram, parseSfen, parseShogiDsl, renderBoard,
    serializeSfen, serializeDsl, hitTest, squareName, INITIAL_SFEN,
};

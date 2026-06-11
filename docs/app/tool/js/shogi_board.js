/*
 * 将棋盤ダイアグラム ツールページのグルーコード。
 * Mermaid を CDN から読み込み、shogiboard 外部プラグインを登録して、
 * テキストエリアの DSL をライブ描画する。SVG / PNG ダウンロードに対応。
 */

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import { register } from './mermaid_shogiboard.js';

const codeInput = document.getElementById('codeInput');
const previewBox = document.getElementById('previewBox');
const errorMessage = document.getElementById('errorMessage');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const sampleSelect = document.getElementById('sampleSelect');

const SAMPLES = {
    initial:
        'shogiboard\n'
        + '  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1\n'
        + '  caption: "平手初形"',
    move:
        'shogiboard\n'
        + '  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL w - 2\n'
        + '  highlight: 7f\n'
        + '  arrow: 7g -> 7f\n'
        + '  label: 7f "▲7六歩"\n'
        + '  caption: "▲7六歩まで"',
    hand:
        'shogiboard\n'
        + '  sfen: ln1g4l/1ks2g3/1ppp1pnp1/p3p1p1p/9/P1P1P3P/1P1P1PPP1/1KGS3R1/LN1G4L w B2Pb2p 1\n'
        + '  highlight: 5e\n'
        + '  caption: "持駒の例"',
    flip:
        'shogiboard\n'
        + '  sfen: lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1\n'
        + '  flip: true\n'
        + '  caption: "後手視点 (flip)"',
};

let renderSeq = 0;
let currentSvg = '';

mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
});
register(mermaid);

function showError(msg) {
    if (msg) {
        errorMessage.textContent = msg;
        errorMessage.hidden = false;
    } else {
        errorMessage.textContent = '';
        errorMessage.hidden = true;
    }
}

async function render() {
    const code = codeInput.value.trim();
    if (!code) {
        previewBox.innerHTML = '<p class="placeholder">記法を入力すると、ここに盤面が表示されます。</p>';
        currentSvg = '';
        downloadSvgBtn.disabled = true;
        downloadPngBtn.disabled = true;
        showError(null);
        return;
    }

    const seq = ++renderSeq;
    try {
        const { svg } = await mermaid.render('shogi-graph-' + seq, code);
        if (seq !== renderSeq) return; // 古い描画は破棄
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

function svgDocString() {
    // currentSvg はインライン <svg>。ダウンロード用に xmlns / 宣言を補う
    let s = currentSvg;
    if (!/xmlns=/.test(s)) {
        s = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
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
    const vb = svgEl.getAttribute('viewBox');
    let w = parseFloat(svgEl.getAttribute('width')) || 472;
    let h = parseFloat(svgEl.getAttribute('height')) || 550;
    if (vb) {
        const parts = vb.split(/\s+/).map(Number);
        if (parts.length === 4) { w = parts[2]; h = parts[3]; }
    }
    const scale = 2; // 高解像度で出力
    const img = new Image();
    const svgBlob = new Blob([svgDocString()], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
            if (blob) downloadBlob(blob, 'shogiboard.png');
        }, 'image/png');
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        showError('PNG 変換に失敗しました。');
    };
    img.src = url;
});

sampleSelect.addEventListener('change', () => {
    const s = SAMPLES[sampleSelect.value];
    if (s) {
        codeInput.value = s;
        render();
    }
});

let debounce;
codeInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(render, 250);
});

// 初期表示
codeInput.value = SAMPLES.move;
render();

// iPhone / iPad アイコンサイズ生成ツール
// Apple の AppIcon.appiconset 形式 (Contents.json + 各サイズPNG) を生成する。

// 参考: Assets.xcassets/AppIcon.appiconset/Contents.json と一致する順序・項目
const ICON_ENTRIES = [
    // iPhone
    { idiom: 'iphone',        size: '60x60',     scale: '3x', expectedSize: 180 },
    { idiom: 'iphone',        size: '40x40',     scale: '2x', expectedSize: 80  },
    { idiom: 'iphone',        size: '40x40',     scale: '3x', expectedSize: 120 },
    { idiom: 'iphone',        size: '60x60',     scale: '2x', expectedSize: 120 },
    { idiom: 'iphone',        size: '57x57',     scale: '1x', expectedSize: 57  },
    { idiom: 'iphone',        size: '29x29',     scale: '2x', expectedSize: 58  },
    { idiom: 'iphone',        size: '29x29',     scale: '1x', expectedSize: 29  },
    { idiom: 'iphone',        size: '29x29',     scale: '3x', expectedSize: 87  },
    { idiom: 'iphone',        size: '57x57',     scale: '2x', expectedSize: 114 },
    { idiom: 'iphone',        size: '20x20',     scale: '2x', expectedSize: 40  },
    { idiom: 'iphone',        size: '20x20',     scale: '3x', expectedSize: 60  },
    // App Store
    { idiom: 'ios-marketing', size: '1024x1024', scale: '1x', expectedSize: 1024 },
    // iPad
    { idiom: 'ipad',          size: '40x40',     scale: '2x', expectedSize: 80  },
    { idiom: 'ipad',          size: '72x72',     scale: '1x', expectedSize: 72  },
    { idiom: 'ipad',          size: '76x76',     scale: '2x', expectedSize: 152 },
    { idiom: 'ipad',          size: '50x50',     scale: '2x', expectedSize: 100 },
    { idiom: 'ipad',          size: '29x29',     scale: '2x', expectedSize: 58  },
    { idiom: 'ipad',          size: '76x76',     scale: '1x', expectedSize: 76  },
    { idiom: 'ipad',          size: '29x29',     scale: '1x', expectedSize: 29  },
    { idiom: 'ipad',          size: '50x50',     scale: '1x', expectedSize: 50  },
    { idiom: 'ipad',          size: '72x72',     scale: '2x', expectedSize: 144 },
    { idiom: 'ipad',          size: '40x40',     scale: '1x', expectedSize: 40  },
    { idiom: 'ipad',          size: '83.5x83.5', scale: '2x', expectedSize: 167 },
    { idiom: 'ipad',          size: '20x20',     scale: '1x', expectedSize: 20  },
    { idiom: 'ipad',          size: '20x20',     scale: '2x', expectedSize: 40  },
];

const APPICONSET_FOLDER = 'Assets.xcassets/AppIcon.appiconset/';

const DEVICE_LABEL = {
    iphone: 'iPhone',
    ipad: 'iPad',
    'ios-marketing': 'App Store',
};

const state = {
    sourceImage: null,
    sourceName: 'icon',
};

// ピクセルサイズで重複排除した一覧（プレビュー＆生成単位）
const UNIQUE_FILES = (() => {
    const map = new Map();
    for (const e of ICON_ENTRIES) {
        if (!map.has(e.expectedSize)) {
            map.set(e.expectedSize, {
                px: e.expectedSize,
                filename: `${e.expectedSize}.png`,
                uses: [],
            });
        }
        map.get(e.expectedSize).uses.push(e);
    }
    return Array.from(map.values()).sort((a, b) => a.px - b.px);
})();

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('imageUpload');
const sourceInfo = document.getElementById('sourceInfo');
const sourceName = document.getElementById('sourceName');
const sourceDimensions = document.getElementById('sourceDimensions');
const sourceWarning = document.getElementById('sourceWarning');
const controls = document.getElementById('controls');
const iconGrid = document.getElementById('iconGrid');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const bgColor = document.getElementById('bgColor');
const bgTransparent = document.getElementById('bgTransparent');
const deviceFilters = document.querySelectorAll('.device-filter');

buildGrid();
attachEvents();

function buildGrid() {
    iconGrid.innerHTML = '';
    UNIQUE_FILES.forEach((file) => {
        const card = document.createElement('div');
        card.className = 'icon-card';
        card.dataset.px = String(file.px);
        card.dataset.idioms = Array.from(new Set(file.uses.map((u) => u.idiom))).join(',');

        const preview = document.createElement('div');
        preview.className = 'icon-preview';
        const canvas = document.createElement('canvas');
        canvas.width = file.px;
        canvas.height = file.px;
        preview.appendChild(canvas);
        card.appendChild(preview);

        const meta = document.createElement('div');
        meta.className = 'icon-meta';
        const usesHtml = file.uses
            .map((u) => `<span class="device-tag ${u.idiom}">${DEVICE_LABEL[u.idiom]} ${u.size} @${u.scale}</span>`)
            .join('');
        meta.innerHTML = `
            <span class="name">${file.filename}</span>
            <span class="size">${file.px} × ${file.px} px</span>
            <span class="uses">${usesHtml}</span>
        `;
        card.appendChild(meta);

        const btn = document.createElement('button');
        btn.textContent = 'PNG をダウンロード';
        btn.disabled = true;
        btn.addEventListener('click', () => downloadOne(file, canvas));
        card.appendChild(btn);

        iconGrid.appendChild(card);
    });
}

function attachEvents() {
    fileInput.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) loadFile(f);
    });

    ['dragenter', 'dragover'].forEach((ev) => {
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });
    ['dragleave', 'drop'].forEach((ev) => {
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });
    dropZone.addEventListener('drop', (e) => {
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) loadFile(f);
    });

    bgColor.addEventListener('input', renderAll);
    bgTransparent.addEventListener('change', renderAll);
    deviceFilters.forEach((cb) => cb.addEventListener('change', applyFilter));
    downloadZipBtn.addEventListener('click', downloadZip);
}

function loadFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('画像ファイルを指定してください。');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.sourceImage = img;
            const dot = file.name.lastIndexOf('.');
            state.sourceName = (dot > 0 ? file.name.slice(0, dot) : file.name) || 'icon';

            sourceInfo.hidden = false;
            sourceName.textContent = file.name;
            sourceDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
            if (img.naturalWidth !== img.naturalHeight) {
                sourceWarning.hidden = false;
                sourceWarning.textContent = '※ 正方形画像が推奨です（中央でクロップされます）。';
            } else if (img.naturalWidth < 1024) {
                sourceWarning.hidden = false;
                sourceWarning.textContent = '※ 1024×1024 以上の画像を推奨します（拡大されます）。';
            } else {
                sourceWarning.hidden = true;
            }

            controls.hidden = false;
            renderAll();
            applyFilter();
        };
        img.onerror = () => alert('画像の読み込みに失敗しました。');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderAll() {
    if (!state.sourceImage) return;
    iconGrid.querySelectorAll('.icon-card').forEach((card) => {
        const px = parseInt(card.dataset.px, 10);
        const canvas = card.querySelector('canvas');
        renderIcon(canvas, px);
        card.querySelector('button').disabled = false;
    });
    downloadZipBtn.disabled = false;
}

function renderIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    if (!bgTransparent.checked) {
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, size, size);
    }

    const img = state.sourceImage;
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    const side = Math.min(sw, sh);
    const sx = (sw - side) / 2;
    const sy = (sh - side) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
}

function selectedIdioms() {
    return new Set(
        Array.from(deviceFilters)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value)
    );
}

function applyFilter() {
    const enabled = selectedIdioms();
    iconGrid.querySelectorAll('.icon-card').forEach((card) => {
        const idioms = (card.dataset.idioms || '').split(',');
        const visible = idioms.some((i) => enabled.has(i));
        card.classList.toggle('hidden', !visible);
    });
}

function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

function downloadOne(file, canvas) {
    canvasToBlob(canvas).then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${state.sourceName}_${file.filename}`);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
}

async function downloadZip() {
    if (!state.sourceImage) return;
    const enabled = selectedIdioms();
    const entries = ICON_ENTRIES.filter((e) => enabled.has(e.idiom));
    if (entries.length === 0) {
        alert('対象のデバイスを1つ以上選択してください。');
        return;
    }

    downloadZipBtn.disabled = true;
    const originalLabel = downloadZipBtn.textContent;
    downloadZipBtn.textContent = '生成中...';

    try {
        // 必要な PNG をピクセルサイズ単位で生成
        const neededPx = new Set(entries.map((e) => e.expectedSize));
        const pngs = new Map();
        for (const px of neededPx) {
            const canvas = document.createElement('canvas');
            renderIcon(canvas, px);
            const blob = await canvasToBlob(canvas);
            const buf = new Uint8Array(await blob.arrayBuffer());
            pngs.set(px, buf);
        }

        // Contents.json (参考ファイルのフォーマットに合わせる: 単一行)
        const images = entries.map((e) => ({
            size: e.size,
            'expected-size': String(e.expectedSize),
            filename: `${e.expectedSize}.png`,
            folder: APPICONSET_FOLDER,
            idiom: e.idiom,
            scale: e.scale,
        }));
        const contentsJson = JSON.stringify({ images });

        // ZIP に積むファイル一覧
        const zipFiles = [];
        for (const px of Array.from(neededPx).sort((a, b) => a - b)) {
            zipFiles.push({
                name: `${APPICONSET_FOLDER}${px}.png`,
                data: pngs.get(px),
            });
        }
        zipFiles.push({
            name: `${APPICONSET_FOLDER}Contents.json`,
            data: new TextEncoder().encode(contentsJson),
        });
        // 参考ディレクトリと同様に App Store 用 1024 を最上位にも置く
        if (enabled.has('ios-marketing') && pngs.has(1024)) {
            zipFiles.push({ name: 'appstore.png', data: pngs.get(1024) });
        }

        const zipBytes = createZip(zipFiles);
        const blob = new Blob([zipBytes], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${state.sourceName}_AppIcon.appiconset.zip`);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
        console.error(err);
        alert('ZIP の生成に失敗しました: ' + err.message);
    } finally {
        downloadZipBtn.textContent = originalLabel;
        downloadZipBtn.disabled = false;
    }
}

function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ---------- 簡易 ZIP エンコーダ (STORE 圧縮のみ・外部ライブラリ不使用) ----------

function createZip(files) {
    const encoder = new TextEncoder();
    const localChunks = [];
    const centralChunks = [];
    let offset = 0;
    let centralSize = 0;

    for (const file of files) {
        const nameBytes = encoder.encode(file.name);
        const data = file.data;
        const crc = crc32(data);
        const dosTime = 0;
        const dosDate = 0x21; // 1980-01-01

        const local = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0x0800, true); // UTF-8 filename
        lv.setUint16(8, 0, true);      // method = store
        lv.setUint16(10, dosTime, true);
        lv.setUint16(12, dosDate, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, data.length, true);
        lv.setUint32(22, data.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        local.set(nameBytes, 30);
        localChunks.push(local, data);

        const central = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, dosTime, true);
        cv.setUint16(14, dosDate, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, data.length, true);
        cv.setUint32(24, data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        central.set(nameBytes, 46);
        centralChunks.push(central);

        offset += local.length + data.length;
        centralSize += central.length;
    }

    const centralStart = offset;
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralStart, true);
    ev.setUint16(20, 0, true);

    const total = offset + centralSize + eocd.length;
    const out = new Uint8Array(total);
    let pos = 0;
    for (const c of localChunks) { out.set(c, pos); pos += c.length; }
    for (const c of centralChunks) { out.set(c, pos); pos += c.length; }
    out.set(eocd, pos);
    return out;
}

let crcTable = null;
function crc32(data) {
    if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            crcTable[i] = c >>> 0;
        }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

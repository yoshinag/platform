// App Store スクリーンショットサイズ調整ツール
// 複数画像を一括でアップロード → 各デバイスサイズに変換。

const SCREENSHOT_SPECS = [
    // iPhone (ポートレート基準。縦横比から自動でランドスケープに転換)
    { id: 'iPhone-6.9',  device: 'iPhone 6.9"',  portrait: [1320, 2868], examples: 'iPhone 16 Pro Max',         kind: 'iphone', defaultOn: true },
    { id: 'iPhone-6.7',  device: 'iPhone 6.7"',  portrait: [1290, 2796], examples: 'iPhone 14/15 Pro Max',      kind: 'iphone', defaultOn: true },
    { id: 'iPhone-6.5',  device: 'iPhone 6.5"',  portrait: [1242, 2688], examples: 'iPhone XS Max / 11 Pro Max',kind: 'iphone', defaultOn: true },
    { id: 'iPhone-5.5',  device: 'iPhone 5.5"',  portrait: [1242, 2208], examples: 'iPhone 8 Plus',             kind: 'iphone', defaultOn: false },
    // iPad
    { id: 'iPad-13',     device: 'iPad 13"',     portrait: [2064, 2752], examples: 'iPad Pro M4',               kind: 'ipad',   defaultOn: true },
    { id: 'iPad-12.9',   device: 'iPad 12.9"',   portrait: [2048, 2732], examples: 'iPad Pro 6th gen',          kind: 'ipad',   defaultOn: true },
    { id: 'iPad-11',     device: 'iPad 11"',     portrait: [1668, 2388], examples: 'iPad Pro 11"',              kind: 'ipad',   defaultOn: false },
    // macOS (ランドスケープ固定。App Store Connect が受け付ける 4 サイズ)
    { id: 'mac-2880',    device: 'Mac 2880×1800', portrait: [1800, 2880], examples: 'Retina 16:10',             kind: 'mac',    defaultOn: false, fixedOrientation: 'landscape' },
    { id: 'mac-2560',    device: 'Mac 2560×1600', portrait: [1600, 2560], examples: 'Retina 16:10',             kind: 'mac',    defaultOn: false, fixedOrientation: 'landscape' },
    { id: 'mac-1440',    device: 'Mac 1440×900',  portrait: [900, 1440],  examples: '16:10',                    kind: 'mac',    defaultOn: false, fixedOrientation: 'landscape' },
    { id: 'mac-1280',    device: 'Mac 1280×800',  portrait: [800, 1280],  examples: '16:10',                    kind: 'mac',    defaultOn: false, fixedOrientation: 'landscape' },
];

const PREVIEW_MAX_DIM = 220; // CSS表示と合わせる

const state = {
    images: [], // { id, name, baseName, image, orientation }
    nextId: 1,
};

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('imageUpload');
const controls = document.getElementById('controls');
const fitModeSelect = document.getElementById('fitMode');
const bgColorInput = document.getElementById('bgColor');
const deviceFiltersContainer = document.getElementById('deviceFilters');
const imageList = document.getElementById('imageList');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const clearBtn = document.getElementById('clearBtn');

buildDeviceFilters();
attachEvents();

function buildDeviceFilters() {
    SCREENSHOT_SPECS.forEach((spec) => {
        const label = document.createElement('label');
        label.dataset.specId = spec.id;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = spec.id;
        cb.checked = spec.defaultOn;
        cb.className = 'spec-filter';
        label.appendChild(cb);
        label.appendChild(document.createTextNode(`${spec.device} (${spec.portrait[0]}×${spec.portrait[1]})`));
        deviceFiltersContainer.appendChild(label);
    });
}

function attachEvents() {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files) handleFiles(e.target.files);
        e.target.value = '';
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
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    fitModeSelect.addEventListener('change', renderAll);
    bgColorInput.addEventListener('input', renderAll);
    deviceFiltersContainer.addEventListener('change', applyFilter);
    downloadZipBtn.addEventListener('click', downloadZip);
    clearBtn.addEventListener('click', clearAll);
}

function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    let pending = files.length;
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const dot = file.name.lastIndexOf('.');
                const baseName = (dot > 0 ? file.name.slice(0, dot) : file.name) || 'screenshot';
                const orientation = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
                state.images.push({
                    id: `img-${state.nextId++}`,
                    name: file.name,
                    baseName,
                    image: img,
                    orientation,
                });
                pending--;
                if (pending === 0) renderAll();
            };
            img.onerror = () => { pending--; if (pending === 0) renderAll(); };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function renderAll() {
    if (state.images.length === 0) {
        controls.hidden = true;
        imageList.innerHTML = '';
        return;
    }
    controls.hidden = false;
    imageList.innerHTML = '';
    state.images.forEach((entry) => imageList.appendChild(buildRow(entry)));
    applyFilter();
}

function buildRow(entry) {
    const row = document.createElement('div');
    row.className = 'image-row';
    row.dataset.id = entry.id;

    const header = document.createElement('div');
    header.className = 'image-row-header';

    const thumb = document.createElement('img');
    thumb.className = 'image-thumb';
    thumb.src = entry.image.src;
    header.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = entry.name;
    header.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${entry.image.naturalWidth}×${entry.image.naturalHeight} / ${entry.orientation === 'portrait' ? 'ポートレート' : 'ランドスケープ'}`;
    header.appendChild(meta);

    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.textContent = '削除';
    remove.addEventListener('click', () => removeImage(entry.id));
    header.appendChild(remove);

    row.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'size-grid';
    SCREENSHOT_SPECS.forEach((spec) => {
        const cell = document.createElement('div');
        cell.className = 'size-cell';
        cell.dataset.specId = spec.id;

        const previewBox = document.createElement('div');
        previewBox.className = 'preview';
        const target = targetSize(spec, entry.orientation);
        const previewCanvas = renderToCanvas(entry.image, target, fitModeSelect.value, bgColorInput.value, true);
        previewBox.appendChild(previewCanvas);
        cell.appendChild(previewBox);

        const label = document.createElement('div');
        label.className = 'label';
        label.innerHTML = `<span class="device">${spec.device}</span><span class="px">${target[0]}×${target[1]} px</span>`;
        cell.appendChild(label);

        const dlBtn = document.createElement('button');
        dlBtn.textContent = 'PNG をダウンロード';
        dlBtn.addEventListener('click', () => downloadOne(entry, spec));
        cell.appendChild(dlBtn);

        grid.appendChild(cell);
    });
    row.appendChild(grid);

    return row;
}

function targetSize(spec, orientation) {
    const [w, h] = spec.portrait;
    const o = spec.fixedOrientation || orientation;
    return o === 'landscape' ? [h, w] : [w, h];
}

function renderToCanvas(srcImg, [tw, th], fitMode, bgColor, forPreview) {
    let outW = tw, outH = th;
    if (forPreview) {
        const scale = Math.min(PREVIEW_MAX_DIM / tw, PREVIEW_MAX_DIM / th, 1);
        outW = Math.max(1, Math.round(tw * scale));
        outH = Math.max(1, Math.round(th * scale));
    }
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (fitMode === 'contain') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, outW, outH);
    }

    const sw = srcImg.naturalWidth;
    const sh = srcImg.naturalHeight;
    if (fitMode === 'stretch') {
        ctx.drawImage(srcImg, 0, 0, sw, sh, 0, 0, outW, outH);
    } else if (fitMode === 'cover') {
        const targetAspect = outW / outH;
        const sourceAspect = sw / sh;
        let cropW = sw, cropH = sh, cropX = 0, cropY = 0;
        if (sourceAspect > targetAspect) {
            cropW = sh * targetAspect;
            cropX = (sw - cropW) / 2;
        } else {
            cropH = sw / targetAspect;
            cropY = (sh - cropH) / 2;
        }
        ctx.drawImage(srcImg, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
    } else {
        // contain
        const targetAspect = outW / outH;
        const sourceAspect = sw / sh;
        let drawW, drawH, drawX, drawY;
        if (sourceAspect > targetAspect) {
            drawW = outW;
            drawH = outW / sourceAspect;
            drawX = 0;
            drawY = (outH - drawH) / 2;
        } else {
            drawH = outH;
            drawW = outH * sourceAspect;
            drawY = 0;
            drawX = (outW - drawW) / 2;
        }
        ctx.drawImage(srcImg, 0, 0, sw, sh, drawX, drawY, drawW, drawH);
    }
    return canvas;
}

function selectedSpecIds() {
    return new Set(
        Array.from(deviceFiltersContainer.querySelectorAll('.spec-filter'))
            .filter((cb) => cb.checked)
            .map((cb) => cb.value)
    );
}

function applyFilter() {
    const enabled = selectedSpecIds();
    imageList.querySelectorAll('.size-cell').forEach((cell) => {
        cell.classList.toggle('hidden', !enabled.has(cell.dataset.specId));
    });
}

function findEntry(id) {
    return state.images.find((e) => e.id === id);
}

function removeImage(id) {
    state.images = state.images.filter((e) => e.id !== id);
    renderAll();
}

function clearAll() {
    state.images = [];
    renderAll();
}

function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

async function downloadOne(entry, spec) {
    const target = targetSize(spec, entry.orientation);
    const canvas = renderToCanvas(entry.image, target, fitModeSelect.value, bgColorInput.value, false);
    const blob = await canvasToBlob(canvas);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${spec.id}_${target[0]}x${target[1]}_${entry.baseName}.png`);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function downloadZip() {
    if (state.images.length === 0) return;
    const enabled = selectedSpecIds();
    const targetSpecs = SCREENSHOT_SPECS.filter((s) => enabled.has(s.id));
    if (targetSpecs.length === 0) {
        alert('対象サイズを1つ以上選択してください。');
        return;
    }

    downloadZipBtn.disabled = true;
    const original = downloadZipBtn.textContent;
    const total = state.images.length * targetSpecs.length;
    let done = 0;

    try {
        const zipFiles = [];
        for (const spec of targetSpecs) {
            for (const entry of state.images) {
                const target = targetSize(spec, entry.orientation);
                const canvas = renderToCanvas(entry.image, target, fitModeSelect.value, bgColorInput.value, false);
                const blob = await canvasToBlob(canvas);
                if (!blob) continue;
                const buf = new Uint8Array(await blob.arrayBuffer());
                const folder = `${spec.id}_${target[0]}x${target[1]}`;
                zipFiles.push({
                    name: `${folder}/${entry.baseName}.png`,
                    data: buf,
                });
                done++;
                downloadZipBtn.textContent = `生成中... ${done} / ${total}`;
                // UI 更新を挟む
                await new Promise((r) => setTimeout(r, 0));
            }
        }

        const zipBytes = createZip(zipFiles);
        const blob = new Blob([zipBytes], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, 'AppStore_Screenshots.zip');
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
        console.error(err);
        alert('ZIP の生成に失敗しました: ' + err.message);
    } finally {
        downloadZipBtn.textContent = original;
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

(function () {
    'use strict';

    const urlInput = document.getElementById('urlInput');
    const charCount = document.getElementById('charCount');
    const errorMessage = document.getElementById('errorMessage');
    const sizeInput = document.getElementById('sizeInput');
    const ecLevel = document.getElementById('ecLevel');
    const marginInput = document.getElementById('marginInput');
    const fgColor = document.getElementById('fgColor');
    const bgColor = document.getElementById('bgColor');
    const bgTransparent = document.getElementById('bgTransparent');
    const previewBox = document.getElementById('previewBox');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');

    let currentModules = null;
    let currentModuleCount = 0;

    function showError(msg) {
        if (msg) {
            errorMessage.textContent = msg;
            errorMessage.hidden = false;
        } else {
            errorMessage.textContent = '';
            errorMessage.hidden = true;
        }
    }

    function clearPreview(placeholderText) {
        previewBox.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'placeholder';
        p.textContent = placeholderText || 'URL を入力すると、ここに QR コードが表示されます。';
        previewBox.appendChild(p);
        currentModules = null;
        currentModuleCount = 0;
        downloadPngBtn.disabled = true;
        downloadSvgBtn.disabled = true;
    }

    function buildQr(text, level) {
        const qr = qrcode(0, level);
        qr.addData(text);
        qr.make();
        const count = qr.getModuleCount();
        const modules = [];
        for (let r = 0; r < count; r++) {
            const row = [];
            for (let c = 0; c < count; c++) {
                row.push(qr.isDark(r, c));
            }
            modules.push(row);
        }
        return { modules, count };
    }

    function renderCanvas(modules, count, sizePx, marginModules, fg, bg, transparent) {
        const totalModules = count + marginModules * 2;
        const scale = Math.max(1, Math.floor(sizePx / totalModules));
        const canvasSize = scale * totalModules;

        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');

        if (!transparent) {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
        } else {
            ctx.clearRect(0, 0, canvasSize, canvasSize);
        }

        ctx.fillStyle = fg;
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (modules[r][c]) {
                    ctx.fillRect(
                        (c + marginModules) * scale,
                        (r + marginModules) * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        return canvas;
    }

    function buildSvg(modules, count, marginModules, fg, bg, transparent) {
        const totalModules = count + marginModules * 2;
        const parts = [];
        parts.push('<?xml version="1.0" encoding="UTF-8"?>');
        parts.push(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
            totalModules + ' ' + totalModules +
            '" shape-rendering="crispEdges">'
        );
        if (!transparent) {
            parts.push(
                '<rect width="100%" height="100%" fill="' + bg + '"/>'
            );
        }
        let path = '';
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (modules[r][c]) {
                    path += 'M' + (c + marginModules) + ' ' + (r + marginModules) + 'h1v1h-1z';
                }
            }
        }
        parts.push('<path d="' + path + '" fill="' + fg + '"/>');
        parts.push('</svg>');
        return parts.join('');
    }

    function render() {
        const text = urlInput.value;
        charCount.textContent = text.length + ' 文字';

        if (!text) {
            showError(null);
            clearPreview();
            return;
        }

        const level = ecLevel.value;
        let result;
        try {
            result = buildQr(text, level);
        } catch (e) {
            showError('入力が長すぎるため QR コードを生成できません。誤り訂正レベルを下げるか、文字数を減らしてください。');
            clearPreview('生成エラー');
            return;
        }
        showError(null);

        currentModules = result.modules;
        currentModuleCount = result.count;

        const sizePx = Math.max(64, Math.min(2048, parseInt(sizeInput.value, 10) || 320));
        const marginModules = Math.max(0, Math.min(16, parseInt(marginInput.value, 10) || 0));
        const fg = fgColor.value;
        const bg = bgColor.value;
        const transparent = bgTransparent.checked;

        bgColor.disabled = transparent;

        const canvas = renderCanvas(result.modules, result.count, sizePx, marginModules, fg, bg, transparent);
        previewBox.innerHTML = '';
        previewBox.appendChild(canvas);

        downloadPngBtn.disabled = false;
        downloadSvgBtn.disabled = false;
    }

    function sanitizeFilename(text) {
        const trimmed = (text || '').trim().slice(0, 40);
        const cleaned = trimmed.replace(/[^A-Za-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '');
        return cleaned || 'qrcode';
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

    downloadPngBtn.addEventListener('click', () => {
        if (!currentModules) return;
        const sizePx = Math.max(64, Math.min(2048, parseInt(sizeInput.value, 10) || 320));
        const marginModules = Math.max(0, Math.min(16, parseInt(marginInput.value, 10) || 0));
        const canvas = renderCanvas(
            currentModules,
            currentModuleCount,
            sizePx,
            marginModules,
            fgColor.value,
            bgColor.value,
            bgTransparent.checked
        );
        canvas.toBlob((blob) => {
            if (!blob) return;
            downloadBlob(blob, sanitizeFilename(urlInput.value) + '.png');
        }, 'image/png');
    });

    downloadSvgBtn.addEventListener('click', () => {
        if (!currentModules) return;
        const marginModules = Math.max(0, Math.min(16, parseInt(marginInput.value, 10) || 0));
        const svgText = buildSvg(
            currentModules,
            currentModuleCount,
            marginModules,
            fgColor.value,
            bgColor.value,
            bgTransparent.checked
        );
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        downloadBlob(blob, sanitizeFilename(urlInput.value) + '.svg');
    });

    const liveInputs = [urlInput, sizeInput, marginInput, fgColor, bgColor];
    const changeInputs = [ecLevel, bgTransparent];
    liveInputs.forEach((el) => el.addEventListener('input', render));
    changeInputs.forEach((el) => el.addEventListener('change', render));

    clearPreview();
})();

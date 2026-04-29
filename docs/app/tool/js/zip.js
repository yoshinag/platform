// 簡易 ZIP エンコーダ (STORE 圧縮のみ・外部ライブラリ不使用)
// グローバル: window.createZip, window.crc32

(function (global) {
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

    global.createZip = createZip;
    global.crc32 = crc32;
})(window);

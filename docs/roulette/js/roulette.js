class Roulette {
    constructor(containerId, colors) {
        this.container = document.getElementById(containerId);
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textarea = this.container.querySelector('textarea');
        this.resultDiv = this.container.querySelector('.result');
        this.removeBtn = this.container.querySelector('.remove-btn');
        this.shuffleBtn = this.container.querySelector('.shuffle-btn');
        this.colors = colors;
        
        this.items = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.winningIndex = -1;

        this.textarea.addEventListener('input', () => {
            this.winningIndex = -1;
            this.updateRemoveButton();
            this.draw();
        });
        this.removeBtn.addEventListener('click', () => this.removeItem());
        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.shuffleItems());
        }
    }

    shuffleItems() {
        const text = this.textarea.value.trim();
        if (!text) return;
        const items = text.split('\n').filter(i => i.trim() !== '');
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        this.textarea.value = items.join('\n');
        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';
        this.updateRemoveButton();
        this.draw();
    }

    setRandomPosition() {
        const text = this.textarea.value.trim();
        const items = text ? text.split('\n').filter(i => i.trim() !== '') : ['項目なし'];
        const numItems = items.length;
        if (numItems > 0) {
            const arcSize = (2 * Math.PI) / numItems;
            const randomIndex = Math.floor(Math.random() * numItems);
            // 針の位置（3π/2）にrandomIndexが来るようにcurrentRotationを設定
            // 0.5を加算して扇形の中心が針を指すようにする
            this.currentRotation = (1.5 * Math.PI) - (randomIndex + 0.5) * arcSize;
            this.draw();
            // 初期状態では結果をハイフンにする
            this.resultDiv.textContent = '結果: -';
            this.winningIndex = -1;
            this.updateRemoveButton();
        }
    }

    updateRemoveButton() {
        if (this.winningIndex !== -1 && this.items.length > 1 && this.items[0] !== '項目なし') {
            this.removeBtn.style.display = 'inline-block';
        } else {
            this.removeBtn.style.display = 'none';
        }
    }

    removeItem() {
        if (this.winningIndex === -1) return;
        
        const currentItems = this.textarea.value.trim().split('\n').filter(i => i.trim() !== '');
        currentItems.splice(this.winningIndex, 1);
        this.textarea.value = currentItems.join('\n');
        
        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';
        this.updateRemoveButton();
        this.draw();
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        // wrapper は .roulette-wrapper
        const wrapper = this.container.querySelector('.roulette-wrapper');
        if (wrapper) {
            wrapper.style.width = width + 'px';
            wrapper.style.height = height + 'px';
        }
        this.draw();
    }

    draw() {
        const text = this.textarea.value.trim();
        this.items = text ? text.split('\n').filter(i => i.trim() !== '') : ['項目なし'];
        
        const numItems = this.items.length;
        const arcSize = (2 * Math.PI) / numItems;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.items.forEach((item, i) => {
            const angle = this.currentRotation + i * arcSize;
            
            this.ctx.beginPath();
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.fill();
            this.ctx.stroke();

            // 当選項目を強調
            if (this.winningIndex === i) {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.lineWidth = 6;
                this.ctx.strokeStyle = '#e74c3c';
                // 扇形全体を囲む
                this.ctx.moveTo(centerX, centerY);
                this.ctx.arc(centerX, centerY, radius - 3, angle, angle + arcSize);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.restore();
            }

            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(angle + arcSize / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            const fontSize = this.canvas.width > 350 ? 16 : 14;
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            
            // テキストの折り返し処理
            const maxWidth = radius * 0.7; // 中心付近は狭いので余裕を持たせる
            const words = item.split(''); // 日本語を考慮して1文字ずつに分割
            let line = '';
            const lines = [];
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n];
                let metrics = this.ctx.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n];
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // 複数行を描画
            const lineHeight = fontSize * 1.2;
            const startYOffset = (lines.length - 1) * lineHeight / 2;
            lines.forEach((l, index) => {
                this.ctx.fillText(l, radius - 20, 10 - startYOffset + (index * lineHeight));
            });
            
            this.ctx.restore();
        });
    }

    spin() {
        if (this.isSpinning) return Promise.resolve();
        
        const text = this.textarea.value.trim();
        if (!text) return Promise.resolve();

        this.isSpinning = true;
        // this.resultDiv.textContent = ''; // 前回の結果を保持するため、クリアしない
        this.winningIndex = -1;
        this.updateRemoveButton();

        const spinDuration = 3000 + Math.random() * 2000;
        const spinRotation = 10 * 2 * Math.PI + Math.random() * 2 * Math.PI;
        const startRotation = this.currentRotation;
        const startTime = performance.now();

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / spinDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                this.currentRotation = startRotation + spinRotation * easeOut;
                this.draw();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isSpinning = false;
                    this.determineResult();
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }

    determineResult() {
        const numItems = this.items.length;
        const arcSize = (2 * Math.PI) / numItems;
        let relativeNeedleAngle = (3 * Math.PI / 2 - this.currentRotation) % (2 * Math.PI);
        if (relativeNeedleAngle < 0) relativeNeedleAngle += 2 * Math.PI;
        
        this.winningIndex = Math.floor(relativeNeedleAngle / arcSize);
        if (this.winningIndex >= numItems) this.winningIndex = 0;

        this.resultDiv.textContent = '結果: ' + this.items[this.winningIndex];
        this.updateRemoveButton();
    }
}

class Drum {
    constructor(containerId, colors) {
        this.container = document.getElementById(containerId);
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textarea = this.container.querySelector('textarea');
        this.resultDiv = this.container.querySelector('.result');
        this.removeBtn = this.container.querySelector('.remove-btn');
        this.shuffleBtn = this.container.querySelector('.shuffle-btn');
        this.colors = colors;

        this.items = [];
        this.currentY = 0; // ドラムの現在のスクロール位置
        this.targetIdx = 0; // 描画の基準となるインデックス
        this.isSpinning = false;
        this.winningIndex = -1;
        this.itemHeight = 80; // 各項目の高さ
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.wrapper = this.container.querySelector('.drum-wrapper');
        this.window = this.container.querySelector('.drum-window');

        this.textarea.addEventListener('input', () => {
            this.winningIndex = -1;
            this.updateRemoveButton();
            this.draw();
        });
        this.removeBtn.addEventListener('click', () => this.removeItem());
        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.shuffleItems());
        }
    }

    shuffleItems() {
        const text = this.textarea.value.trim();
        if (!text) return;
        const items = text.split('\n').filter(i => i.trim() !== '');
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        this.textarea.value = items.join('\n');
        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';
        this.updateRemoveButton();
        this.draw();
    }

    setRandomPosition() {
        const text = this.textarea.value.trim();
        const items = text ? text.split('\n').filter(i => i.trim() !== '') : ['項目なし'];
        const numItems = items.length;
        if (numItems > 0) {
            const stopIdx = Math.floor(Math.random() * numItems);
            this.currentY = -stopIdx * this.itemHeight;
            this.draw();
            // 初期状態では結果をハイフンにする
            this.resultDiv.textContent = '結果: -';
            this.winningIndex = -1;
            this.updateRemoveButton();
        }
    }

    updateRemoveButton() {
        if (this.winningIndex !== -1 && this.items.length > 1 && this.items[0] !== '項目なし') {
            this.removeBtn.style.display = 'inline-block';
        } else {
            this.removeBtn.style.display = 'none';
        }
    }

    removeItem() {
        if (this.winningIndex === -1) return;

        const currentItems = this.textarea.value.trim().split('\n').filter(i => i.trim() !== '');
        currentItems.splice(this.winningIndex, 1);
        this.textarea.value = currentItems.join('\n');

        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';
        this.updateRemoveButton();
        this.draw();
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.wrapper) {
            this.wrapper.style.width = width + 'px';
            this.wrapper.style.height = height + 'px';
        }
        if (this.window) {
            this.window.style.width = width + 'px';
            this.window.style.height = height + 'px';
        }
        this.draw();
    }

    draw() {
        const text = this.textarea.value.trim();
        this.items = text ? text.split('\n').filter(i => i.trim() !== '') : ['項目なし'];

        const numItems = this.items.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerY = this.canvas.height / 2;
        const radius = this.canvas.height / 2; // ドラムの「半径」

        // ループするように描画
        // currentY は 0 が「最初の項目が中央」を指すように調整する
        const startIdx = Math.floor(-this.currentY / this.itemHeight) - Math.ceil(this.canvas.height / this.itemHeight);
        const endIdx = startIdx + Math.ceil(this.canvas.height / this.itemHeight) * 2 + 5;

        for (let i = startIdx; i <= endIdx; i++) {
            let actualIdx = i % numItems;
            if (actualIdx < 0) actualIdx += numItems;

            const item = this.items[actualIdx];
            
            // 中央を 0 とした時の座標
            const itemLinearY = (this.currentY + i * this.itemHeight);
            
            // 項目の中心の角度に変換 (中心が 0)
            const angle = itemLinearY / (radius * 0.8);

            // 画面外（裏側）は描画しない
            if (Math.abs(angle) > Math.PI / 2 + 0.2) continue;

            // 項目の上端と下端の角度を計算
            const topAngle = (itemLinearY - this.itemHeight / 2) / (radius * 0.8);
            const bottomAngle = (itemLinearY + this.itemHeight / 2) / (radius * 0.8);

            // 投影後のY位置（上端と下端）
            const drawTopY = centerY + Math.sin(topAngle) * radius;
            const drawBottomY = centerY + Math.sin(bottomAngle) * radius;
            const currentItemHeight = Math.max(1, drawBottomY - drawTopY);
            const drawY = drawTopY;

            // 中央から遠ざかるほど透明にする（フェードアウト効果）
            const opacity = Math.cos(angle);

            // 背景
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = this.colors[actualIdx % this.colors.length];
            this.ctx.fillRect(0, drawY, this.canvas.width, currentItemHeight);

            // 境界線
            this.ctx.strokeStyle = `rgba(0,0,0,${0.2 * opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, drawY, this.canvas.width, currentItemHeight);

            // 当選項目を強調表示
            if (this.winningIndex === actualIdx) {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#e74c3c';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(2, drawY + 2, this.canvas.width - 4, currentItemHeight - 4);
                this.ctx.restore();
            }

            // テキスト
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // フォントサイズのバランス調整
            // 中央で最大、端で最小になるように
            const baseFontSize = 24;
            const fontSize = Math.max(10, baseFontSize * Math.pow(opacity, 0.8));
            this.ctx.font = `bold ${fontSize}px Arial`;
            
            this.ctx.shadowBlur = 4 * opacity;
            this.ctx.shadowColor = `rgba(0,0,0,${0.5 * opacity})`;
            
            // テキストの折り返し処理
            const maxWidth = this.canvas.width * 0.8;
            const words = item.split('');
            let line = '';
            const lines = [];
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n];
                let metrics = this.ctx.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n];
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // 複数行を描画
            const lineHeight = fontSize * 1.1;
            const startYOffset = (lines.length - 1) * lineHeight / 2;
            lines.forEach((l, index) => {
                this.ctx.fillText(l, this.canvas.width / 2, drawY + currentItemHeight / 2 - startYOffset + (index * lineHeight));
            });
            
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1.0;
        }
    }

    spin() {
        if (this.isSpinning) return Promise.resolve();

        const text = this.textarea.value.trim();
        if (!text) return Promise.resolve();

        this.isSpinning = true;
        this.winningIndex = -1;
        this.updateRemoveButton();

        const numItems = this.items.length;
        const totalHeight = numItems * this.itemHeight;
        const spinDuration = 3000 + Math.random() * 2000;
        
        // 当選させるインデックスをランダムに選ぶ
        const stopIdx = Math.floor(Math.random() * numItems);
        
        // 何回転かさせた後に、(stopIdx * itemHeight) で止まるようにする
        // (currentY=0 のときに index 0 が中央にくる)
        const extraSpins = 5 + Math.floor(Math.random() * 5);
        const targetY = (extraSpins * totalHeight - stopIdx * this.itemHeight);
        
        const startY = this.currentY;
        const spinY = targetY - startY;
        const startTime = performance.now();

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / spinDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);

                this.currentY = startY + spinY * easeOut;
                this.draw();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isSpinning = false;
                    // 位置を正規化
                    this.currentY = this.currentY % totalHeight;
                    this.winningIndex = stopIdx;
                    this.resultDiv.textContent = '結果: ' + this.items[this.winningIndex];
                    this.updateRemoveButton();
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
}

const globalColors = [
    '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', 
    '#2ecc71', '#1abc9c', '#34495e', '#16a085', '#27ae60'
];

async function loadDefaultItems() {
    try {
        const response = await fetch('default.txt');
        if (!response.ok) throw new Error('Failed to fetch default.txt');
        const text = await response.text();
        return text.trim();
    } catch (e) {
        console.error(e);
        // フォールバック: 以前のデフォルト値
        return Array.from({length: 32}, (_, i) => i + 1).join('\n');
    }
}
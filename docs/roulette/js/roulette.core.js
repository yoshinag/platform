class BaseRoulette {
    constructor(containerId, colors) {
        this.container = document.getElementById(containerId);
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textarea = this.container.querySelector('textarea');
        this.resultDiv = this.container.querySelector('.result');
        this.removeBtn = this.container.querySelector('.remove-btn');
        this.autoShuffleContainer = this.container.querySelector('.auto-shuffle-container');
        this.autoShuffleCheckbox = this.container.querySelector('.auto-shuffle');
        this.spinShuffleCheckbox = this.container.querySelector('.spin-shuffle');
        this.shuffleBtn = this.container.querySelector('.shuffle-btn');
        this.colors = colors;

        this.items = [];
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
            const j = Math.floor(this._getRandom() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        this.textarea.value = items.join('\n');
        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';
        this.updateRemoveButton();
        this.draw();
    }

    updateRemoveButton() {
        if (this.winningIndex !== -1 && this.items.length > 1 && this.items[0] !== '項目なし') {
            this.removeBtn.style.display = 'inline-block';
            if (this.autoShuffleContainer) this.autoShuffleContainer.style.display = 'flex';
        } else {
            this.removeBtn.style.display = 'none';
            if (this.autoShuffleContainer) this.autoShuffleContainer.style.display = 'none';
        }
    }

    removeItem() {
        if (this.winningIndex === -1) return;

        const currentItems = this.textarea.value.trim().split('\n').filter(i => i.trim() !== '');
        currentItems.splice(this.winningIndex, 1);
        this.textarea.value = currentItems.join('\n');

        this.winningIndex = -1;
        this.resultDiv.textContent = '結果: -';

        if (this.autoShuffleCheckbox && this.autoShuffleCheckbox.checked) {
            this.shuffleItems();
        } else {
            this.updateRemoveButton();
            this.draw();
        }
    }

    // テキストの折り返し処理
    _splitText(text, maxWidth) {
        const words = text.split('');
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
        return lines;
    }

    // 共通の描画準備処理
    _prepareItems() {
        const text = this.textarea.value.trim();
        this.items = text ? text.split('\n').filter(i => i.trim() !== '') : ['項目なし'];
        return this.items.length;
    }

    // 暗号強度の乱数生成
    _getRandom() {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / 4294967296; // 2^32
    }

    // 初期表示用のランダム位置設定
    _setInitialRandom(callback) {
        const numItems = this._prepareItems();
        if (numItems > 0) {
            callback(numItems);
            this.draw();
            this.resultDiv.textContent = '結果: -';
            this.winningIndex = -1;
            this.updateRemoveButton();
        }
    }

    // Abstract methods (to be implemented by subclasses)
    draw() {}
    setRandomPosition() {}
    spin() {}
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
        return Array.from({length: 32}, (_, i) => i + 1).join('\n');
    }
}

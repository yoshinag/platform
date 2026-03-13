class Drum extends BaseRoulette {
    constructor(containerId, colors) {
        super(containerId, colors);
        this.currentY = 0;
        this.itemHeight = 80;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.wrapper = this.container.querySelector('.drum-wrapper');
        this.window = this.container.querySelector('.drum-window');
    }

    setRandomPosition() {
        this._setInitialRandom((numItems) => {
            const stopIdx = Math.floor(Math.random() * numItems);
            this.currentY = -stopIdx * this.itemHeight;
        });
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
        const numItems = this._prepareItems();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerY = this.canvas.height / 2;
        const radius = this.canvas.height / 2;

        const startIdx = Math.floor(-this.currentY / this.itemHeight) - Math.ceil(this.canvas.height / this.itemHeight);
        const endIdx = startIdx + Math.ceil(this.canvas.height / this.itemHeight) * 2 + 5;

        for (let i = startIdx; i <= endIdx; i++) {
            let actualIdx = i % numItems;
            if (actualIdx < 0) actualIdx += numItems;

            const item = this.items[actualIdx];
            const itemLinearY = (this.currentY + i * this.itemHeight);
            const angle = itemLinearY / (radius * 0.8);

            if (Math.abs(angle) > Math.PI / 2 + 0.2) continue;

            const topAngle = (itemLinearY - this.itemHeight / 2) / (radius * 0.8);
            const bottomAngle = (itemLinearY + this.itemHeight / 2) / (radius * 0.8);

            const drawTopY = centerY + Math.sin(topAngle) * radius;
            const drawBottomY = centerY + Math.sin(bottomAngle) * radius;
            const currentItemHeight = Math.max(1, drawBottomY - drawTopY);
            const drawY = drawTopY;

            const opacity = Math.cos(angle);

            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = this.colors[actualIdx % this.colors.length];
            this.ctx.fillRect(0, drawY, this.canvas.width, currentItemHeight);

            this.ctx.strokeStyle = `rgba(0,0,0,${0.2 * opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, drawY, this.canvas.width, currentItemHeight);

            if (this.winningIndex === actualIdx) {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#e74c3c';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(2, drawY + 2, this.canvas.width - 4, currentItemHeight - 4);
                this.ctx.restore();
            }

            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const baseFontSize = 24;
            const fontSize = Math.max(10, baseFontSize * Math.pow(opacity, 0.8));
            this.ctx.font = `bold ${fontSize}px Arial`;
            
            this.ctx.shadowBlur = 4 * opacity;
            this.ctx.shadowColor = `rgba(0,0,0,${0.5 * opacity})`;
            
            const maxWidth = this.canvas.width * 0.8;
            const lines = this._splitText(item, maxWidth);

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
        
        const stopIdx = Math.floor(Math.random() * numItems);
        
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

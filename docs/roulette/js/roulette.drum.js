class Drum extends BaseRoulette {
    constructor(containerId, colors) {
        super(containerId, colors);
        this.currentY = 0;
        this.itemHeight = 80;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.wrapper = this.container.querySelector('.drum-wrapper');
        this.window = this.container.querySelector('.drum-window');
        this.imageInput = this.container.querySelector('.image-upload');
        this.imageMap = new Map(); // キー(テキスト): Imageオブジェクト

        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let loadedCount = 0;
        const newItems = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const imageName = file.name;
                    this.imageMap.set(imageName, img);
                    newItems.push(imageName);
                    loadedCount++;
                    if (loadedCount === files.length) {
                        const currentText = this.textarea.value.trim();
                        const separator = currentText ? '\n' : '';
                        this.textarea.value = currentText + separator + newItems.join('\n');
                        this.winningIndex = -1;
                        this.draw();
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    setRandomPosition() {
        this._setInitialRandom((numItems) => {
            const stopIdx = Math.floor(this._getRandom() * numItems);
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

            const image = this.imageMap.get(item);
            if (image) {
                const imgAspect = image.width / image.height;
                const drawWidth = Math.min(this.canvas.width * 0.9, currentItemHeight * imgAspect * 2); // 2 is a heuristic for drum curvature
                const drawHeight = Math.min(currentItemHeight * 0.9, (this.canvas.width * 0.9) / imgAspect);
                
                const x = (this.canvas.width - drawWidth) / 2;
                const y = drawY + (currentItemHeight - drawHeight) / 2;
                
                this.ctx.drawImage(image, x, y, drawWidth, drawHeight);
            } else {
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
            }
            this.ctx.globalAlpha = 1.0;
        }
    }

    async spin() {
        if (!await super.spin()) return false;

        const numItems = this.items.length;
        const totalHeight = numItems * this.itemHeight;
        const spinDuration = 3000 + this._getRandom() * 2000;
        
        const stopIdx = Math.floor(this._getRandom() * numItems);
        
        const extraSpins = 5 + Math.floor(this._getRandom() * 5);
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
                    
                    let resultText = this.items[this.winningIndex];
                    if (this.imageMap.has(resultText)) {
                        // 画像の場合は拡張子を除く
                        resultText = resultText.replace(/\.[^/.]+$/, "");
                    }
                    this.resultDiv.textContent = '結果: ' + resultText;
                    
                    this.updateRemoveButton();
                    resolve(true);
                }
            };
            requestAnimationFrame(animate);
        });
    }
}

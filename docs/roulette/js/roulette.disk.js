class Roulette extends BaseRoulette {
    constructor(containerId, colors) {
        super(containerId, colors);
        this.currentRotation = 0;
    }

    setRandomPosition() {
        this._setInitialRandom((numItems) => {
            const arcSize = (2 * Math.PI) / numItems;
            const randomIndex = Math.floor(this._getRandom() * numItems);
            // 針の位置（3π/2）にrandomIndexが来るようにcurrentRotationを設定
            // 0.5を加算して扇形の中心が針を指すようにする
            this.currentRotation = (1.5 * Math.PI) - (randomIndex + 0.5) * arcSize;
        });
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        const wrapper = this.container.querySelector('.roulette-wrapper');
        if (wrapper) {
            wrapper.style.width = width + 'px';
            wrapper.style.height = height + 'px';
        }
        this.draw();
    }

    draw() {
        const numItems = this._prepareItems();
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
            const maxWidth = radius * 0.7;
            const lines = this._splitText(item, maxWidth);

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
        this.winningIndex = -1;
        this.updateRemoveButton();
        this.draw();

        const spinDuration = 3000 + this._getRandom() * 2000;
        const spinRotation = 10 * 2 * Math.PI + this._getRandom() * 2 * Math.PI;
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

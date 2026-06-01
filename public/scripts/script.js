class ModernMusicVisualizer {
    constructor() {
        // DOM элементы
        this.wordElement = document.getElementById('changingWord');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playIconSpan = document.getElementById('playIcon');
        this.trackNameSpan = document.getElementById('trackName');
        this.playerCard = document.getElementById('playerCard');
        this.canvas = document.getElementById('bgCanvas');
        this.flashOverlay = document.getElementById('flashOverlay');
        this.particlesContainer = document.getElementById('particlesContainer');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');

        // Аудио переменные
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.audioElement = null;
        this.isPlaying = false;

        // Путь к треку (из той же папки)
        this.trackPath = "./audio/music.mp3";

        // Canvas
        this.ctx = this.canvas.getContext('2d');
        this.barCount = 60;
        this.animationFrameId = null;

        // Анимация слов
        this.words = ["Настя", "я", "тебя", "обожаю", "и", "хочу", "чтобы", "ты", "знала", "что", "не", "смотря", "на", "то", "что", "будет", "дальше", "ты", "очень", "запала", "мне", "в", "душу", "и", "спасла", "спасибо", "<3"];
        this.wordIndex = 0;
        this.wordInterval = null;

        // Частицы
        this.particles = [];

        this.init();
    }

    init() {
        this.initCanvas();
        this.startWordAnimation();
        this.setupEventListeners();
        this.animateBackground();
        this.createParticles();
        this.setupVolumeControl();
        this.loadAudio(); // Автоматическая загрузка трека

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.createParticles();
        });
    }

    initCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupVolumeControl() {
        this.volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.volumeValue.textContent = value + '%';
            if (this.gainNode) {
                this.gainNode.gain.value = value / 100;
            }
        });
    }

    loadAudio() {
        this.trackNameSpan.textContent = '🎵 Загрузка трека... 💜';

        this.audioElement = new Audio();
        this.audioElement.src = this.trackPath;
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.loop = false;

        this.audioElement.addEventListener('canplaythrough', () => {
            console.log('Трек загружен и готов');
            this.trackNameSpan.textContent = '✨ Трек загружен! Нажми PLAY ✨';
        });

        this.audioElement.addEventListener('error', (e) => {
            console.error('Ошибка загрузки трека:', e);
            this.trackNameSpan.innerHTML = '❌ Ошибка: файл music.mp3 не найден!<br>Проверьте что файл в той же папке';
            this.trackNameSpan.style.animation = 'shake 0.3s ease';
        });

        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.playIconSpan.textContent = '▶';
            this.playerCard.classList.remove('playing');
            this.trackNameSpan.textContent = '🎵 Трек завершён! Нажми PLAY снова 💗';
        });

        // Инициализируем AudioContext
        this.initAudioContext().then(() => {
            this.connectAudioToElement();
        });
    }

    createParticles() {
        this.particlesContainer.innerHTML = '';
        this.particles = [];
        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const emojis = ['💜', '💗', '💖', '💕', '💓', '✨', '⭐', '🌙', '🦋', '🎵', '🌸'];
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.position = 'absolute';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.fontSize = (10 + Math.random() * 20) + 'px';
            particle.style.opacity = 0.2 + Math.random() * 0.4;
            particle.style.animation = `floatParticle ${6 + Math.random() * 12}s linear infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.pointerEvents = 'none';
            particle.style.filter = 'drop-shadow(0 0 5px rgba(168,85,247,0.5))';
            this.particlesContainer.appendChild(particle);
            this.particles.push(particle);
        }

        if (!document.querySelector('#particleStyle')) {
            const style = document.createElement('style');
            style.id = 'particleStyle';
            style.textContent = `
                @keyframes floatParticle {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    drawSymmetricalBars(frequencyData) {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const maxHeight = this.canvas.height;
        const barWidth = (this.canvas.width / 2) / (this.barCount / 2);

        // Получаем данные частот
        let heights = [];
        if (frequencyData && this.isPlaying) {
            for (let i = 0; i < this.barCount / 2; i++) {
                const freqIndex = Math.floor(i * (frequencyData.length / (this.barCount / 2)));
                const value = frequencyData[freqIndex] || 0;
                // Чувствительная динамика с нормализацией
                let normalized = Math.pow(value / 255, 0.6) * 1.2;
                let height = normalized * (maxHeight - 60);
                height = Math.max(5, Math.min(maxHeight - 40, height));
                heights.push(height);
            }
        } else {
            for (let i = 0; i < this.barCount / 2; i++) {
                const height = 8 + Math.sin(Date.now() * 0.004 + i * 0.15) * 4;
                heights.push(height);
            }
        }

        // Рисуем симметрично от центра
        for (let i = 0; i < heights.length; i++) {
            const height = heights[i];
            const intensity = Math.min(1, height / (maxHeight - 60));
            const xLeft = centerX - (i + 1) * barWidth;
            const xRight = centerX + i * barWidth;

            // Создаем неоновый градиент
            const hue = (Date.now() * 0.1 + i * 2) % 360;

            // Левая сторона
            const gradientLeft = this.ctx.createLinearGradient(xLeft, maxHeight - height, xLeft, maxHeight);
            gradientLeft.addColorStop(0, `hsla(${hue}, 85%, 65%, ${0.5 + intensity * 0.5})`);
            gradientLeft.addColorStop(1, `hsla(${hue + 40}, 90%, 55%, ${0.7 + intensity * 0.3})`);
            this.ctx.fillStyle = gradientLeft;
            const radius = Math.min(6, barWidth / 2);
            this.ctx.beginPath();
            this.ctx.roundRect(xLeft, maxHeight - height, barWidth - 1, height, radius);
            this.ctx.fill();

            // Правая сторона
            const gradientRight = this.ctx.createLinearGradient(xRight, maxHeight - height, xRight, maxHeight);
            gradientRight.addColorStop(0, `hsla(${hue}, 85%, 65%, ${0.5 + intensity * 0.5})`);
            gradientRight.addColorStop(1, `hsla(${hue + 40}, 90%, 55%, ${0.7 + intensity * 0.3})`);
            this.ctx.fillStyle = gradientRight;
            this.ctx.beginPath();
            this.ctx.roundRect(xRight, maxHeight - height, barWidth - 1, height, radius);
            this.ctx.fill();

            // Эффект свечения
            if (intensity > 0.6) {
                this.ctx.shadowBlur = 12;
                this.ctx.shadowColor = `hsla(${hue}, 85%, 65%, 0.6)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }

            // Добавляем эффекты при сильных битах
            if (intensity > 0.75 && this.isPlaying) {
                this.addFlash();
                this.addShake();
                if (intensity > 0.85 && Math.random() > 0.7) {
                    this.addSparkleEffect(xLeft + barWidth / 2, maxHeight - height, intensity);
                    this.addSparkleEffect(xRight + barWidth / 2, maxHeight - height, intensity);
                }
            }
        }
    }

    addFlash() {
        this.flashOverlay.classList.remove('active');
        void this.flashOverlay.offsetWidth;
        this.flashOverlay.classList.add('active');
        setTimeout(() => {
            this.flashOverlay.classList.remove('active');
        }, 150);
    }

    addShake() {
        this.playerCard.classList.add('shake-effect');
        setTimeout(() => {
            this.playerCard.classList.remove('shake-effect');
        }, 100);
    }

    addSparkleEffect(x, y, intensity) {
        const sparkle = document.createElement('div');
        const emojis = ['💜', '💗', '💖', '✨', '⭐', '💕'];
        sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.bottom = y + 'px';
        sparkle.style.fontSize = (12 + intensity * 15) + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '25';
        sparkle.style.opacity = '1';
        sparkle.style.filter = 'drop-shadow(0 0 5px rgba(168,85,247,0.8))';
        sparkle.style.animation = 'sparklePop 0.4s ease-out forwards';
        document.body.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 400);

        if (!document.querySelector('#sparkleStyle')) {
            const style = document.createElement('style');
            style.id = 'sparkleStyle';
            style.textContent = `
                @keyframes sparklePop {
                    0% {
                        transform: scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.3) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    animateBackground() {
        if (this.analyser && this.isPlaying) {
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dataArray);
            this.drawSymmetricalBars(dataArray);
        } else {
            this.drawSymmetricalBars(null);
        }
        this.animationFrameId = requestAnimationFrame(() => this.animateBackground());
    }

    startWordAnimation() {
        this.wordInterval = setInterval(() => {
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            this.wordElement.classList.add('word-pop');

            let newWord = this.words[this.wordIndex];
            if (newWord === "<3") {
                this.wordElement.innerHTML = "❤️";
            } else {
                this.wordElement.textContent = newWord;
            }

            setTimeout(() => {
                this.wordElement.classList.remove('word-pop');
            }, 300);
        }, 1700);
    }

    async initAudioContext() {
        if (this.audioContext) return this.audioContext;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.1;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volumeSlider.value / 100;

        return this.audioContext;
    }

    async connectAudioToElement() {
        if (!this.audioContext) await this.initAudioContext();
        if (!this.audioElement) return;

        if (this.sourceNode) {
            try {
                this.sourceNode.disconnect();
            } catch (e) { }
        }

        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.handlePlayPause());
        document.addEventListener('click', () => this.handleAudioContextResume());
    }

    async handlePlayPause() {
        if (!this.audioElement) {
            this.trackNameSpan.textContent = '❌ Трек не загружен!';
            return;
        }

        if (!this.audioContext) {
            await this.initAudioContext();
        }

        if (!this.isPlaying) {
            try {
                if (!this.sourceNode) {
                    await this.connectAudioToElement();
                }

                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                await this.audioElement.play();
                this.isPlaying = true;
                this.playIconSpan.textContent = '⏸';
                this.playerCard.classList.add('playing');
                this.trackNameSpan.textContent = '🎵 Музыка играет... Наслаждайся! 💜';
            } catch (err) {
                console.error('Playback error:', err);
                this.trackNameSpan.textContent = '❌ Ошибка воспроизведения';
                this.isPlaying = false;
                this.playIconSpan.textContent = '▶';
            }
        } else {
            this.audioElement.pause();
            this.isPlaying = false;
            this.playIconSpan.textContent = '▶';
            this.playerCard.classList.remove('playing');
            this.trackNameSpan.textContent = '⏸ На паузе... Жми play 💗';
        }
    }

    async handleAudioContextResume() {
        if (this.audioContext && this.audioContext.state === 'suspended' && this.isPlaying) {
            await this.audioContext.resume();
        }
    }
}

// Добавляем метод roundRect в Canvas API
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

// Запуск приложения
window.addEventListener('load', () => {
    new ModernMusicVisualizer();
});
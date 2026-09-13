// ============================================
// RENDERER.JS - Game Renderer
// ============================================

/**
 * Rendering system for the game
 * Handles drawing characters, monsters, spells, UI, etc.
 */

class Renderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.uiElements = [];
        this.animations = [];
        this.particleEffects = [];
        this.lastRenderTime = 0;
        this.renderStats = {
            frameCount: 0,
            lastFpsUpdate: 0,
            fps: 0
        };
        
        this.init();
    }

    /**
     * Initialize renderer
     */
    init() {
        // Find or create canvas
        this.canvas = document.getElementById('combat-canvas') || document.getElementById('game-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            this.canvas.width = 1200;
            this.canvas.height = 600;
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas style
        this.canvas.style.backgroundColor = '#1a1a2e';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // Add event listeners
        this.setupEventListeners();
        
        console.log('Renderer initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Initial resize
        this.handleResize();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const container = document.getElementById('game-container') || document.body;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        
        // Set canvas size
        this.canvas.width = Math.min(width, 1200);
        this.canvas.height = Math.min(height - 100, 600);
        
        // Recenter camera
        if (this.gameEngine && this.gameEngine.character) {
            this.centerCameraOnCharacter();
        }
    }

    /**
     * Main render method
     */
    render(deltaTime) {
        const now = performance.now();
        this.deltaTime = deltaTime;
        
        // Clear canvas
        this.clearCanvas();
        
        // Update render stats
        this.renderStats.frameCount++;
        if (now - this.renderStats.lastFpsUpdate >= 1000) {
            this.renderStats.fps = this.renderStats.frameCount;
            this.renderStats.frameCount = 0;
            this.renderStats.lastFpsUpdate = now;
        }
        
        // Draw based on game mode
        switch (this.gameEngine.gameMode) {
            case 'combat':
            case 'dungeon':
                this.renderCombat();
                break;
            case 'admin':
                this.renderAdmin();
                break;
            default:
                this.renderIdle();
        }
        
        // Draw UI
        this.renderUI();
        
        // Draw animations
        this.renderAnimations();
        
        // Draw particle effects
        this.renderParticles();
        
        this.lastRenderTime = now;
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render combat scene
     */
    renderCombat() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        const dungeon = this.gameEngine.currentDungeon;
        
        // Draw background
        this.drawBackground(dungeon);
        
        // Draw monsters
        if (dungeon) {
            const monsters = dungeon.getCurrentMonsters();
            for (const monster of monsters) {
                this.drawMonster(monster);
            }
        }
        
        // Draw character
        this.drawCharacter(character);
        
        // Draw combat UI
        this.drawCombatUI();
    }

    /**
     * Render idle scene
     */
    renderIdle() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        
        // Draw background
        this.drawBackground();
        
        // Draw character in the center
        character.position.x = this.canvas.width / 2;
        character.position.y = this.canvas.height / 2;
        this.drawCharacter(character);
        
        // Draw idle UI
        this.drawIdleUI();
    }

    /**
     * Render admin panel
     */
    renderAdmin() {
        // The admin panel is rendered separately in HTML
        // This method can be used for any game-specific admin rendering
    }

    /**
     * Draw background
     */
    drawBackground(dungeon) {
        const bgColor = dungeon ? dungeon.definition.color : '#16213e';
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, this.adjustAlpha(bgColor, 0.5));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dungeon-specific background if available
        if (dungeon && dungeon.definition.background) {
            this.drawDungeonBackground(dungeon.definition.background);
        }
    }

    /**
     * Draw dungeon background
     */
    drawDungeonBackground(backgroundType) {
        // Draw background based on type
        switch (backgroundType) {
            case 'forest':
                this.drawForestBackground();
                break;
            case 'crypt':
                this.drawCryptBackground();
                break;
            case 'fortress':
                this.drawFortressBackground();
                break;
            case 'abyss':
                this.drawAbyssBackground();
                break;
            default:
                this.drawDefaultBackground();
        }
    }

    /**
     * Draw forest background
     */
    drawForestBackground() {
        // Draw trees
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillRect(x, y, 20, 100);
        }
    }

    /**
     * Draw crypt background
     */
    drawCryptBackground() {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pillars
        this.ctx.fillStyle = '#555555';
        for (let i = 0; i < 3; i++) {
            const x = (this.canvas.width / 4) * (i + 1);
            this.ctx.fillRect(x - 10, 0, 20, this.canvas.height);
        }
    }

    /**
     * Draw fortress background
     */
    drawFortressBackground() {
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bricks
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    /**
     * Draw abyss background
     */
    drawAbyssBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw default background
     */
    drawDefaultBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw character
     */
    drawCharacter(character) {
        if (!character || !character.isAlive) return;
        
        const x = character.position.x - this.camera.x;
        const y = character.position.y - this.camera.y;
        
        // Draw character body
        this.ctx.fillStyle = this.getClassColor(character.classType);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw character name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(character.name, x, y - 25);
        
        // Draw health bar
        this.drawHealthBar(x, y - 30, character.stats.health, character.stats.maxHealth, 60, 8);
        
        // Draw mana bar
        this.drawManaBar(x, y - 40, character.stats.mana, character.stats.maxMana, 60, 4);
    }

    /**
     * Draw monster
     */
    drawMonster(monster) {
        if (!monster || !monster.isAlive) return;
        
        const x = monster.position.x - this.camera.x;
        const y = monster.position.y - this.camera.y;
        
        // Draw monster body
        this.ctx.fillStyle = monster.color || '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw monster name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(monster.name, x, y - 20);
        
        // Draw health bar
        this.drawHealthBar(x, y - 25, monster.health, monster.maxHealth, 40, 6);
    }

    /**
     * Draw health bar
     */
    drawHealthBar(x, y, current, max, width, height) {
        const percentage = current / max;
        
        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x - width / 2, y, width, height);
        
        // Health fill
        this.ctx.fillStyle = percentage > 0.5 ? '#4CAF50' : percentage > 0.25 ? '#FFC107' : '#F44336';
        this.ctx.fillRect(x - width / 2, y, width * percentage, height);
        
        // Border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - width / 2, y, width, height);
    }

    /**
     * Draw mana bar
     */
    drawManaBar(x, y, current, max, width, height) {
        const percentage = current / max;
        
        // Background
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(x - width / 2, y, width, height);
        
        // Mana fill
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(x - width / 2, y, width * percentage, height);
        
        // Border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - width / 2, y, width, height);
    }

    /**
     * Draw combat UI
     */
    drawCombatUI() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        const dungeon = this.gameEngine.currentDungeon;
        
        // Draw wave counter
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Wave: ${this.gameEngine.currentWave}`, 10, 20);
        
        // Draw enemy count
        if (dungeon) {
            const monsters = dungeon.getCurrentMonsters();
            this.ctx.fillText(`Enemies: ${monsters.length}`, 10, 40);
        }
    }

    /**
     * Draw idle UI
     */
    drawIdleUI() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        
        // Draw character info
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${character.name} - Level ${character.level}`, this.canvas.width / 2, 50);
    }

    /**
     * Draw UI
     */
    renderUI() {
        // Render all UI elements
        for (const element of this.uiElements) {
            element.render(this.ctx);
        }
    }

    /**
     * Draw animations
     */
    renderAnimations() {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            anim.render(this.ctx, this.deltaTime);
            if (anim.isComplete()) {
                this.animations.splice(i, 1);
            }
        }
    }

    /**
     * Draw particle effects
     */
    renderParticles() {
        for (let i = this.particleEffects.length - 1; i >= 0; i--) {
            const effect = this.particleEffects[i];
            effect.render(this.ctx, this.deltaTime);
            if (effect.isComplete()) {
                this.particleEffects.splice(i, 1);
            }
        }
    }

    /**
     * Center camera on character
     */
    centerCameraOnCharacter() {
        if (this.gameEngine && this.gameEngine.character) {
            this.camera.x = this.gameEngine.character.position.x - this.canvas.width / 2;
            this.camera.y = this.gameEngine.character.position.y - this.canvas.height / 2;
        }
    }

    /**
     * Add animation
     */
    addAnimation(animation) {
        this.animations.push(animation);
    }

    /**
     * Add particle effect
     */
    addParticleEffect(effect) {
        this.particleEffects.push(effect);
    }

    /**
     * Add UI element
     */
    addUIElement(element) {
        this.uiElements.push(element);
    }

    /**
     * Remove UI element
     */
    removeUIElement(element) {
        const index = this.uiElements.indexOf(element);
        if (index >= 0) {
            this.uiElements.splice(index, 1);
        }
    }

    /**
     * Adjust alpha of a color
     */
    adjustAlpha(color, alpha) {
        // Simple alpha adjustment for hex colors
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    /**
     * Get class color
     */
    getClassColor(classType) {
        const colors = {
            archer: '#4CAF50',
            warrior: '#F44336',
            mage: '#2196F3',
            rogue: '#FFC107'
        };
        return colors[classType.toLowerCase()] || '#ffffff';
    }
}

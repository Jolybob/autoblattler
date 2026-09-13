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
        const width = container.clientWidth || window.innerWidt

h;
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
        // Draw stone walls
        this.ctx.fillStyle = '#555';
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.fillRect(x, 0, 10, this.canvas.height);
        }
    }

    /**
     * Draw fortress background
     */
    drawFortressBackground() {
        // Draw brick pattern
        this.ctx.fillStyle = '#8B4513';
        for (let x = 0; x < this.canvas.width; x += 30) {
            for (let y = 0; y < this.canvas.height; y += 20) {
                this.ctx.fillRect(x, y, 25, 15);
            }
        }
    }

    /**
     * Draw abyss background
     */
    drawAbyssBackground() {
        // Draw dark swirling pattern
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#800080';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            this.ctx.beginPath();
            this.ctx.arc(
                this.canvas.width / 2,
                this.canvas.height / 2,
                i * 30,
                0,
                Math.PI * 2
            );
            th
is.
ctx.stroke();
        }
    }

    /**
     * Draw default background
     */
    drawDefaultBackground() {
        // Draw simple gradient
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
        
        // Draw character icon or sprite
        const size = 40 * this.camera.zoom;
        
        // Draw health bar background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 10, size, 5);
        
        // Draw health bar
        const healthPercent = (character.stats.health / character.stats.maxHealth) * 100;
        this.ctx.fillStyle = healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FFC107' : '#F44336';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 10, size * (healthPercent / 100), 5);
        
        // Draw mana bar background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 15, size, 3);
        
        // Draw mana bar
        const manaPercent = (character.stats.mana / character.stats.maxMana) * 100;
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 15, size * (manaPercent / 100), 3);
        
        // Draw character icon (using emoji as placeholder)
        const classDef = ClassDefinitions[character.classType];
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(classDef ? classDef.icon : '🧙', x, y);
        

    
    // Draw character name
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(character.name, x, y - size / 2 - 20);
        
        // Draw level
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`Lv. ${character.level}`, x + size / 2 + 5, y - size / 2 - 10);
        
        // Draw casting indicator
        if (character.isCasting && character.currentSpell) {
            this.drawCastingIndicator(x, y, size, character.currentSpell);
        }
    }

    /**
     * Draw casting indicator
     */
    drawCastingIndicator(x, y, size, spell) {
        this.ctx.strokeStyle = spell.definition.color || '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2 + 10, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Draw monster
     */
    drawMonster(monster) {
        if (!monster || !monster.isAlive) return;
        
        const x = monster.position.x - this.camera.x;
        const y = monster.position.y - this.camera.y;
        const size = 30 * this.camera.zoom;
        
        // Draw monster icon
        const def = MonsterDefinitions[monster.type];
        if (def) {
            this.ctx.font = `${size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(def.icon, x, y);
        }
        
        // Draw health bar
        const healthPercent = (monster.stats.health / monster.stats.maxHealth) * 100;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 8, size, 3);
        this.ctx.fillStyle = healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FFC107' : '#F44336';
        this.ctx.fillRect(x - size / 2, y - size / 2 - 8, size * (healthPercent / 100), 3);
        
        // Draw boss indicator
        if (monster.isBoss) {
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#FFD700';
  
     
     this.ctx.fillText('BOSS', x, y + size / 2 + 10);
        }
        
        // Draw stunned/frozen indicators
        if (monster.isStunned) {
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#FFEB3B';
            this.ctx.fillText('STUN', x - 15, y - size / 2 - 5);
        }
        
        if (monster.isFrozen) {
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#2196F3';
            this.ctx.fillText('FROZEN', x - 20, y - size / 2 - 5);
        }
    }

    /**
     * Draw combat UI
     */
    drawCombatUI() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        const dungeon = this.gameEngine.currentDungeon;
        
        // Draw character info panel
        this.drawCharacterPanel(character);
        
        // Draw wave info
        if (dungeon) {
            this.drawWaveInfo(dungeon);
        }
        
        // Draw spell hotbar
        this.drawSpellHotbar(character);
    }

    /**
     * Draw character panel
     */
    drawCharacterPanel(character) {
        const x = 10;
        const y = 10;
        const width = 200;
        const height = 120;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw character info
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(character.name, x + 10, y + 20);
        this.ctx.fillText(`Lv. ${character.level}`, x + 10, y + 35);
        
        // Draw health bar
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(x + 10, y + 50, width - 20, 10);
        const healthPercent = (character.stats.health / character.stats.maxHealth) * 100;
        this.ctx.fillStyle = healthPercent > 
50 ? '
#4CAF50' : healthPercent > 25 ? '#FFC107' : '#F44336';
        this.ctx.fillRect(x + 10, y + 50, (width - 20) * (healthPercent / 100), 10);
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${character.stats.health}/${character.stats.maxHealth}`, x + 10, y + 65);
        
        // Draw mana bar
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(x + 10, y + 70, width - 20, 8);
        const manaPercent = (character.stats.mana / character.stats.maxMana) * 100;
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(x + 10, y + 70, (width - 20) * (manaPercent / 100), 8);
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${character.stats.mana}/${character.stats.maxMana}`, x + 10, y + 85);
        
        // Draw gold and XP
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`💰 ${character.gold}`, x + 10, y + 100);
        this.ctx.fillText(`📈 ${character.experience}/${character.calculateXPRequired()}`, x + 10, y + 115);
    }

    /**
     * Draw wave info
     */
    drawWaveInfo(dungeon) {
        const x = this.canvas.width - 210;
        const y = 10;
        const width = 200;
        const height = 60;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw wave info
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(dungeon.definition.name, x + 10, y + 20);
        this.ctx.fillText(`Wave: ${dungeon.currentWave + 1}/${dungeon.totalWaves}`, x + 10, y + 35);
        
        // Draw progress bar
        const progress = (dungeon.currentWave / dungeon.totalWaves) * 100;
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(x + 10, y + 45, width - 20, 8);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(x + 10, y + 45, (width - 20) * (progress / 100), 8);
    }

    /**
     * Draw spell hotbar
     */
    drawSpellHotbar(character) {
        const x = this.canvas.width / 2 - 200;
        const y = this.canvas.height - 50;
        const width = 400;
        const height = 40;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);
        
        // Draw spell slots
        const spellCount = Math.min(character.abilities.length, 5);
        const slotWidth = width / spellCount;
        
        for (let i = 0; i < spellCount; i++) {
            const spellId = character.abilities[i];
            const spellDef = SpellDefinitions[spellId];
            
            if (spellDef) {
                // Draw slot background
                this.ctx.fillStyle = character.spellCooldowns[spellId] ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(x + i * slotWidth, y, slotWidth, height);
                
                // Draw spell icon
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(spellDef.icon, x + i * slotWidth + slotWidth / 2, y + height / 2);
                
                // Draw cooldown indicator
                if (character.spellCooldowns[spellId]) {
                    const remaining = character.spellCooldowns[spellId] - Date.now();
                    const cooldownPercent = (remaining / spellDef.baseCooldown) * 100;
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.fillRect(x + i * slotWidth, y + height - 5, slotWidth * (cooldownPercent / 100), 5);
                }
                
                // Draw spell name
                this.ctx.font = '8px Arial';
                this.ctx.
fillStyl
e = '#fff';
                this.ctx.fillText(spellDef.name, x + i * slotWidth + slotWidth / 2, y + height - 5);
            }
        }
    }

    /**
     * Draw idle UI
     */
    drawIdleUI() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        
        // Draw character info
        this.drawCharacterPanel(character);
        
        // Draw main menu
        this.drawMainMenu();
    }

    /**
     * Draw main menu
     */
    drawMainMenu() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw title
        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Auto Blattler', centerX, centerY - 100);
        
        // Draw menu options
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Start Dungeon', centerX, centerY - 30);
        this.ctx.fillText('Admin Panel', centerX, centerY + 10);
        this.ctx.fillText('Export/Import', centerX, centerY + 50);
    }

    /**
     * Draw animations
     */
    renderAnimations() {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            if (anim.update) anim.update(this.deltaTime);
            if (anim.draw) anim.draw(this.ctx, this.camera);
            
            if (anim.isComplete && anim.isComplete()) {
                this.animations.splice(i, 1);
            }
        }
    }

    /**
     * Draw particle effects
     */
    renderParticles() {
        for (let i = this.particleEffects.length - 1; i >= 0; i--) {
            const particle = this.particleEffects[i];
            if (particle.update) particle.update(this.deltaTime);
            if (particle.draw) particle.draw(this.ctx, this.camera);
            
            if (particle.isDead && particle.isDead()) {
                this.par
ticleEffe
cts.splice(i, 1);
            }
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
    addParticle(particle) {
        this.particleEffects.push(particle);
    }

    /**
     * Center camera on character
     */
    centerCameraOnCharacter() {
        if (!this.gameEngine || !this.gameEngine.character) return;
        
        const character = this.gameEngine.character;
        this.camera.x = character.position.x - this.canvas.width / 2;
        this.camera.y = character.position.y - this.canvas.height / 2;
    }

    /**
     * Adjust alpha of a color
     */
    adjustAlpha(color, alpha) {
        // Simple hex to rgba conversion
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    /**
     * Get canvas dimensions
     */
    getCanvasDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer };
}
// ============================================
// GAMEENGINE.JS - Main Game Engine
// ============================================

/**
 * Main game engine class
 * Coordinates all game systems and manages game state
 */

class GameEngine {
    constructor() {
        this.version = '1.0.0';
        this.isRunning = false;
        this.isPaused = false;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        this.fpsFrameCount = 0;
        
        // Game systems
        this.combatSystem = null;
        this.progressionSystem = null;
        this.renderer = null;
        this.dataManager = null;
        
        // Game state
        this.character = null;
        this.currentDungeon = null;
        this.currentWave = 0;
        this.gameMode = 'idle'; // 'idle', 'combat', 'dungeon', 'admin'
        
        // Callbacks
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        
        this.init();
    }

    /**
     * Initialize the game engine
     */
    init() {
        console.log('Initializing Game Engine...');
        
        // Initialize systems
        this.combatSystem = new CombatSystem(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.dataManager = getDataManager();
        
        // Load saved data
        this.loadGame();
        
        // Set up renderer if available
        if (typeof Renderer !== 'undefined') {
            this.renderer = new Renderer(this);
        }
        
        console.log('Game Engine initialized');
    }

    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        this.gameLoop();
        
        console.log('Game started');
    }

    /**
     * Stop the game
     */
    stop() {
        this.isRunning = false;
 
     
  console.log('Game stopped');
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        console.log('Game resumed');
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        this.deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Cap delta time to prevent spiral of death
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        if (this.renderer) {
            this.renderer.render(this.deltaTime);
        }
        
        // Update FPS counter
        this.fpsFrameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.fpsFrameCount;
            this.fpsFrameCount = 0;
            this.lastFpsUpdate = now;
        }
        
        // Continue the loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        this.frameCount++;
        
        // Update all systems
        if (this.combatSystem) {
            this.combatSystem.update();
        }
        
        if (this.progressionSystem) {
            this.progressionSystem.update(deltaTime);
        }
        
        // Execute update callbacks
        for (const callback of this.updateCallbacks) {
            callback(deltaTime);
        }
        
        // Update character
        if (this.character) {
            this.updateCharacter(deltaTime);
        }
        
        // Update dungeon
        if (this.currentDungeon) {
            this.updateDungeon(deltaTime);
        }
    }

  
  /**

     * Update character
     */
    updateCharacter(deltaTime) {
        const character = this.character;
        
        // Update cooldowns
        const now = Date.now();
        if (now >= character.attackCooldown) {
            character.attackCooldown = 0;
        }
        
        // Update spell cooldowns
        for (const spellId in character.spellCooldowns) {
            if (now >= character.spellCooldowns[spellId]) {
                delete character.spellCooldowns[spellId];
            }
        }
        
        // Regenerate mana
        const manaRegen = character.stats.maxMana * 0.01 * deltaTime;
        character.stats.mana = Math.min(character.stats.maxMana, character.stats.mana + manaRegen);
        
        // Check for level up
        if (character.experience >= character.calculateXPRequired()) {
            character.levelUp();
        }
    }

    /**
     * Update dungeon
     */
    updateDungeon(deltaTime) {
        // Check if current wave is cleared
        const aliveMonsters = this.currentDungeon.getCurrentMonsters();
        if (aliveMonsters.length === 0) {
            // Wave cleared, advance to next wave
            const nextWave = this.currentDungeon.nextWave();
            if (nextWave === null) {
                // Dungeon completed
                this.completeDungeon();
            } else {
                this.currentWave++;
                this.gameMode = 'combat';
            }
        }
    }

    /**
     * Set the current character
     */
    setCharacter(character) {
        this.character = character;
        if (this.progressionSystem) {
            this.progressionSystem.setCharacter(character);
        }
    }

    /**
     * Start a new dungeon
     */
    startDungeon(dungeonId) {
        if (!this.character) {
            console.error('No character selected');
            return false;
        }
        
        this.currentDungeon = new Dungeon(dungeonId, this.character);
        this.currentWave =
 0;
   
     this.gameMode = 'dungeon';
        
        // Start the first wave
        this.currentDungeon.start();
        const monsters = this.currentDungeon.getCurrentMonsters();
        
        // Start combat
        if (this.combatSystem) {
            this.combatSystem.startBattle(this.character, monsters);
        }
        
        return true;
    }

    /**
     * Complete the current dungeon
     */
    completeDungeon() {
        if (!this.currentDungeon) return;
        
        const reward = this.currentDungeon.complete();
        this.gameMode = 'idle';
        
        // Save progress
        this.saveGame();
        
        return reward;
    }

    /**
     * Fail the current dungeon
     */
    failDungeon() {
        if (!this.currentDungeon) return;
        
        this.currentDungeon.fail();
        this.gameMode = 'idle';
        
        // Save progress
        this.saveGame();
    }

    /**
     * Cast a spell
     */
    castSpell(spellId, targets) {
        if (!this.character) return false;
        if (!this.combatSystem) return false;
        
        return this.combatSystem.castSpell(
            this.combatSystem.activeBattles[0],
            spellId,
            targets
        );
    }

    /**
     * Attack a target
     */
    attackTarget(target) {
        if (!this.character || !this.character.isAlive) return false;
        
        const now = Date.now();
        if (now < this.character.attackCooldown) return false;
        
        const damage = this.character.attack(target);
        if (damage > 0) {
            target.takeDamage(damage);
            this.character.attackCooldown = now + (1000 / this.character.stats.attackSpeed);
            return true;
        }
        
        return false;
    }

    /**
     * Register update callback
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Register render callback
     */
    onRender(callback) {
        this.rend
erCallba
cks.push(callback);
    }

    /**
     * Load game from saved data
     */
    loadGame() {
        if (!this.dataManager) return;
        
        const characters = this.dataManager.getAllCharacters();
        if (characters.length > 0) {
            this.setCharacter(characters[0]);
        } else {
            // Create default character
            const defaultCharacter = new Character('Hero', CharacterClass.ARCHER);
            this.setCharacter(defaultCharacter);
            this.dataManager.saveCharacter(defaultCharacter);
        }
        
        console.log('Game loaded');
    }

    /**
     * Save game to storage
     */
    saveGame() {
        if (!this.dataManager || !this.character) return;
        
        this.dataManager.saveCharacter(this.character);
        console.log('Game saved');
    }

    /**
     * Export game data
     */
    exportGame() {
        if (!this.dataManager) return null;
        return this.dataManager.exportData();
    }

    /**
     * Import game data
     */
    importGame(jsonString) {
        if (!this.dataManager) return false;
        return this.dataManager.importData(jsonString);
    }

    /**
     * Get game state
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            gameMode: this.gameMode,
            fps: this.fps,
            frameCount: this.frameCount,
            character: this.character ? {
                name: this.character.name,
                level: this.character.level,
                health: this.character.stats.health,
                maxHealth: this.character.stats.maxHealth,
                mana: this.character.stats.mana,
                maxMana: this.character.stats.maxMana,
                gold: this.character.gold,
                xp: this.character.experience
            } : null,
            dungeon: this.currentDungeon ? {
                name: this.currentDungeon.definition.name,currentWave: this.currentWave,
                totalWaves: this.currentDungeon.totalWaves
            } : null
        };
    }

    /**
     * Reset the game
     */
    reset() {
        this.stop();
        this.character = null;
        this.currentDungeon = null;
        this.currentWave = 0;
        this.gameMode = 'idle';
        this.frameCount = 0;
        this.fps = 0;
        
        if (this.combatSystem) {
            this.combatSystem.clearAllBattles();
        }
        
        if (this.dataManager) {
            this.dataManager.clearAllData();
        }
        
        console.log('Game reset');
    }
}

// Global game engine instance
let gameEngine = null;

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            gameEngine = new GameEngine();
        });
    } else {
        gameEngine = new GameEngine();
    }
} else {
    gameEngine = new GameEngine();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine, gameEngine };
}

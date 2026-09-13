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
        this.deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
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
        // Update all registered callbacks
        for (const callback of this.updateCallbacks) {
            callback(deltaTime);
        }
        
        // Update game mode specific logic
        switch (this.gameMode) {
            case 'combat':
                this.updateCombat(deltaTime);
                break;
            case 'dungeon':
                this.updateDungeon(deltaTime);
                break;
            case 'admin':
                // Admin mode doesn't need updates
                break;
            default:
                this.updateIdle(deltaTime);
        }
    }

    /**
     * Update combat mode
     */
    updateCombat(deltaTime) {
        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }
    }

    /**
     * Update dungeon mode
     */
    updateDungeon(deltaTime) {
        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }
    }

    /**
     * Update idle mode
     */
    updateIdle(deltaTime) {
        // Idle animations, etc.
    }

    /**
     * Load game data
     */
    loadGame() {
        if (this.dataManager) {
            const characters = this.dataManager.getAllCharacters();
            if (characters.length > 0) {
                this.character = characters[0];
            } else {
                // Create default character
                this.character = new Character('Hero', CharacterClass.ARCHER);
                this.dataManager.saveCharacter(this.character);
            }
        }
    }

    /**
     * Save game data
     */
    saveGame() {
        if (this.dataManager && this.character) {
            this.dataManager.saveCharacter(this.character);
        }
    }

    /**
     * Start a new wave
     */
    startWave() {
        if (this.gameMode !== 'combat' && this.gameMode !== 'dungeon') {
            this.gameMode = 'combat';
        }
        
        this.currentWave++;
        
        if (this.combatSystem) {
            this.combatSystem.startWave(this.currentWave);
        }
        
        console.log(`Starting wave ${this.currentWave}`);
    }

    /**
     * End current wave
     */
    endWave() {
        if (this.combatSystem) {
            this.combatSystem.endWave();
        }
        
        // Save progress
        this.saveGame();
    }

    /**
     * Start a dungeon
     */
    startDungeon(dungeonId) {
        this.gameMode = 'dungeon';
        this.currentWave = 0;
        
        if (this.combatSystem) {
            this.combatSystem.startDungeon(dungeonId);
        }
        
        console.log(`Starting dungeon: ${dungeonId}`);
    }

    /**
     * End dungeon
     */
    endDungeon() {
        this.gameMode = 'idle';
        this.currentWave = 0;
        
        if (this.combatSystem) {
            this.combatSystem.endDungeon();
        }
        
        // Save progress
        this.saveGame();
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
        this.renderCallbacks.push(callback);
    }

    /**
     * Set character
     */
    setCharacter(character) {
        this.character = character;
        if (this.dataManager) {
            this.dataManager.saveCharacter(character);
        }
    }

    /**
     * Get character
     */
    getCharacter() {
        return this.character;
    }

    /**
     * Get current dungeon
     */
    getCurrentDungeon() {
        return this.currentDungeon;
    }

    /**
     * Set current dungeon
     */
    setCurrentDungeon(dungeon) {
        this.currentDungeon = dungeon;
    }

    /**
     * Get current wave
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Set current wave
     */
    setCurrentWave(wave) {
        this.currentWave = wave;
    }

    /**
     * Get game mode
     */
    getGameMode() {
        return this.gameMode;
    }

    /**
     * Set game mode
     */
    setGameMode(mode) {
        this.gameMode = mode;
    }

    /**
     * Get combat system
     */
    getCombatSystem() {
        return this.combatSystem;
    }

    /**
     * Get progression system
     */
    getProgressionSystem() {
        return this.progressionSystem;
    }

    /**
     * Get data manager
     */
    getDataManager() {
        return this.dataManager;
    }

    /**
     * Get renderer
     */
    getRenderer() {
        return this.renderer;
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameEngine = new GameEngine();
    });
} else {
    window.gameEngine = new GameEngine();
}

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
        this.gameMode = 'idle';
        
        // Callbacks
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        
        this.init();
    }

    init() {
        console.log('Initializing Game Engine...');
        this.combatSystem = new CombatSystem(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.dataManager = getDataManager();
        this.loadGame();
        if (typeof Renderer !== 'undefined') {
            this.renderer = new Renderer(this);
        }
        console.log('Game Engine initialized');
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        this.gameLoop();
        console.log('Game started');
    }

    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }

    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }

    resume() {
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        console.log('Game resumed');
    }

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
        this.fpsFrameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.fpsFrameCount;
            this.fpsFrameCount = 0;
            this.lastFpsUpdate = now;
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        for (const callback of this.updateCallbacks) {
            callback(deltaTime);
        }
        switch (this.gameMode) {
            case 'combat':
                this.updateCombat(deltaTime);
                break;
            case 'dungeon':
                this.updateDungeon(deltaTime);
                break;
            case 'admin':
                break;
            default:
                this.updateIdle(deltaTime);
        }
    }

    updateCombat(deltaTime) {
        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }
    }

    updateDungeon(deltaTime) {
        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }
    }

    updateIdle(deltaTime) {}

    loadGame() {
        if (this.dataManager) {
            const characters = this.dataManager.getAllCharacters();
            if (characters.length > 0) {
                this.character = characters[0];
            } else {
                this.character = new Character('Hero', CharacterClass.ARCHER);
                this.dataManager.saveCharacter(this.character);
            }
        }
    }

    saveGame() {
        if (this.dataManager && this.character) {
            this.dataManager.saveCharacter(this.character);
        }
    }

    loadGameState() {
        if (this.dataManager && this.character) {
            const characters = this.dataManager.getAllCharacters();
            if (characters.length > 0) {
                this.character = characters[0];
            }
        }
    }

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

    castSpell(spellIndex) {
        if (this.character && this.character.abilities && this.character.abilities.length > spellIndex) {
            const spellId = this.character.abilities[spellIndex];
            if (spellId) {
                this.character.castSpell(spellId, this.combatSystem ? this.combatSystem.getCurrentMonsters() : null);
            }
        }
    }

    toggleAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.toggle('hidden');
        }
    }

    endWave() {
        if (this.combatSystem) {
            this.combatSystem.endWave();
        }
        this.saveGame();
    }

    startDungeon(dungeonId) {
        this.gameMode = 'dungeon';
        this.currentWave = 0;
        if (this.combatSystem) {
            this.combatSystem.startDungeon(dungeonId);
        }
        console.log(`Starting dungeon: ${dungeonId}`);
    }

    endDungeon() {
        this.gameMode = 'idle';
        this.currentWave = 0;
        if (this.combatSystem) {
            this.combatSystem.endDungeon();
        }
        this.saveGame();
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    onRender(callback) {
        this.renderCallbacks.push(callback);
    }

    setCharacter(character) {
        this.character = character;
        if (this.dataManager) {
            this.dataManager.saveCharacter(character);
        }
    }

    getCharacter() {
        return this.character;
    }

    getCurrentDungeon() {
        return this.currentDungeon;
    }

    setCurrentDungeon(dungeon) {
        this.currentDungeon = dungeon;
    }

    getCurrentWave() {
        return this.currentWave;
    }

    setCurrentWave(wave) {
        this.currentWave = wave;
    }

    getGameMode() {
        return this.gameMode;
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    getCombatSystem() {
        return this.combatSystem;
    }

    getProgressionSystem() {
        return this.progressionSystem;
    }

    getDataManager() {
        return this.dataManager;
    }

    getRenderer() {
        return this.renderer;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameEngine = new GameEngine();
    });
} else {
    window.gameEngine = new GameEngine();
}

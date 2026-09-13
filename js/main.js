// ============================================
// MAIN.JS - Main Game Initialization
// ============================================

/**
 * Main game initialization file
 * Sets up the game engine and all systems
 */

// ============================================
// GAME INITIALIZATION
// ============================================

// Global game instance
let game = null;

// ============================================
// DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Auto Blattler Game - Initializing...');
    
    // Initialize the game
    initGame();
});

// ============================================
// GAME INITIALIZATION FUNCTION
// ============================================

function initGame() {
    try {
        // Create game engine
        game = new GameEngine();
        
        // Setup global references
        window.game = game;
        window.GameConfig = GameConfig;
        
        // Log initialization
        console.log('Game initialized successfully');
        console.log('Available configurations:', Object.keys(GameConfig));
        
        // Setup additional UI events
        setupAdditionalUI();
        
        // Start game loop
        startGameLoop();
        
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('Failed to initialize game: ' + error.message);
    }
}

// ============================================
// GAME LOOP
// ============================================

function startGameLoop() {
    if (!game) return;
    
    // The game engine handles its own loop
    // This is just a fallback
    function gameLoop() {
        if (game) {
            game.update(game.deltaTime || 16);
            game.render();
        }
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// ============================================
// UI SETUP
// ============================================

function setupAdditionalUI() {
    // Setup admin panel toggle
    const adminToggle = document.getElementById('admin-toggle');
    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            if (game) {
                game.toggleAdminPanel();
            }
        });
    }
    
    // Setup start wave button
    const startWaveBtn = document.getElementById('start-wave');
    if (startWaveBtn) {
        startWaveBtn.addEventListener('click', () => {
            if (game) {
                game.startWave();
            }
        });
    }
    
    // Setup spell buttons
    const spellButtons = [
        document.getElementById('use-spell-1'),
        document.getElementById('use-spell-2'),
        document.getElementById('use-spell-3')
    ];
    
    spellButtons.forEach((btn, index) => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (game) {
                    game.castSpell(index);
                }
            });
        }
    });
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!game) return;
        
        // Space bar for next wave
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            game.startWave();
        }
        
        // Number keys for spells
        if (e.code >= 'Digit1' && e.code <= 'Digit3') {
            const spellIndex = parseInt(e.code.replace('Digit', '')) - 1;
            game.castSpell(spellIndex);
        }
        
        // Escape to close admin panel
        if (e.code === 'Escape') {
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel && !adminPanel.classList.contains('hidden')) {
                game.toggleAdminPanel();
            }
        }
    });
}

// ============================================
// ERROR HANDLING
// ============================================

function showError(message) {
    console.error('Game Error:', message);
    
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #d32f2f;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 80%;
        text-align: center;
    `;
    
    errorDiv.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: white;
            color: #d32f2f;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// ============================================
// GAME SAVE/LOAD
// ============================================

// Expose save/load functions globally for debugging
function saveGame() {
    if (game && game.dataManager) {
        game.dataManager.saveGame();
        return true;
    }
    return false;
}

function loadGame(slot = 0) {
    if (game && game.dataManager) {
        game.dataManager.loadGame(slot);
        game.loadGameState();
        return true;
    }
    return false;
}

function exportGame() {
    if (game && game.dataManager) {
        game.dataManager.exportGame();
        return true;
    }
    return false;
}

async function importGame() {
    if (game && game.dataManager) {
        try {
            const file = await selectJSONFile();
            await game.dataManager.importGame(file);
            game.loadGameState();
            return true;
        } catch (error) {
            console.error('Error importing game:', error);
            return false;
        }
    }
    return false;
}

// ============================================
// DEBUG FUNCTIONS
// ============================================

// Debug function to log game state
function debugGameState() {
    if (!game) {
        console.log('Game not initialized');
        return;
    }
    
    console.group('Game State Debug');
    console.log('Current State:', game.state.current);
    console.log('Player:', game.player ? {
        name: game.player.name,
        level: game.player.level,
        health: game.player.stats.health,
        mana: game.player.stats.mana,
        gold: game.player.gold
    } : null);
    console.log('Combat:', {
        isInCombat: game.combatSystem.isInCombat,
        waveNumber: game.combatSystem.waveNumber,
        monsters: game.combatSystem.monsters.length
    });
    console.groupEnd();
}

// Debug function to spawn monsters
function spawnMonsters(count = 5) {
    if (!game) return;
    
    for (let i = 0; i < count; i++) {
        const monsterTypes = Object.keys(MonsterDefinitions);
        const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        const monster = new Monster(randomType, 1);
        game.combatSystem.monsters.push(monster);
    }
    
    game.combatSystem.isInCombat = true;
    console.log(`Spawned ${count} monsters`);
}

// Debug function to level up player
function levelUp() {
    if (game && game.player) {
        game.player.addExperience(game.player.calculateXPRequired());
        console.log(`Player leveled up to ${game.player.level}`);
    }
}

// ============================================
// EXPORT FOR MODULES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        saveGame,
        loadGame,
        exportGame,
        importGame,
        debugGameState,
        spawnMonsters,
        levelUp
    };
}

// ============================================
// GLOBAL ACCESS
// ============================================

// Make functions available globally for debugging
window.saveGame = saveGame;
window.loadGame = loadGame;
window.exportGame = exportGame;
window.importGame = importGame;
window.debugGameState = debugGameState;
window.spawnMonsters = spawnMonsters;
window.levelUp = levelUp;
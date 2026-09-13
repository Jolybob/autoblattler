// ============================================
// DUNGEON.JS - Dungeon System
// ============================================

/**
 * Dungeon system for managing dungeon progression
 * Handles wave-based combat with monsters and bosses
 */

class Dungeon {
    constructor(dungeonId, character) {
        this.id = this.generateId();
        this.dungeonId = dungeonId;
        this.definition = DungeonDefinitions[dungeonId];
        if (!this.definition) {
            console.error(`Unknown dungeon: ${dungeonId}`);
            this.definition = DungeonDefinitions.forest;
        }
        this.character = character;
        this.currentWave = 0;
        this.totalWaves = this.definition.waves || GameConfig.dungeons.dungeonLength;
        this.isComplete = false;
        this.isFailed = false;
        this.waves = [];
        this.currentMonsters = [];
        this.reward = null;
        this.startTime = null;
        this.completionTime = null;
        this.init();
    }

    generateId() {
        return 'dungeon_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    init() {
        this.currentWave = 0;
        this.isComplete = false;
        this.isFailed = false;
        this.currentMonsters = [];
        this.waves = [];
        
        // Generate all waves
        for (let i = 0; i < this.totalWaves; i++) {
            this.waves.push(this.generateWave(i + 1));
        }
    }

    /**
     * Generate a wave of monsters
     */
    generateWave(waveNumber) {
        const wave = {
            number: waveNumber,
            monsters: [],
            isBossWave: waveNumber === this.totalWaves
        };

        const monsterTypes = this.definition.monsters || [];
        const totalWeight = monsterTypes.reduce((sum, m) => sum + (m.weight || 0), 0);

        // Calculate number of monsters for this wave
        const enemiesPerWave = GameConfig.monsters.enemiesPerWave;
        const waveMultiplier = Math.pow(GameConfig.monsters.waveScaling, waveNumber - 1);
        const numMonsters = wave.isBossWave 
            ? 1 // Boss wave has just the boss
            : Math.floor(enemiesPerWave * Math.min(1 + (waveNumber * 0.2), 3));

        for (let i = 0; i < numMonsters; i++) {
            // For boss wave, create the boss
            if (wave.isBossWave) {
                const bossType = this.definition.boss;
                wave.monsters.push(new Monster(bossType, waveNumber, true));
            } else {
                // Randomly select a monster type based on weights
                let random = Math.random() * totalWeight;
                let selectedType = null;
                
                for (const monster of monsterTypes) {
                    random -= monster.weight || 0;
                    if (random <= 0) {
                        selectedType = monster.type;
                        break;
                    }
                }

                if (selectedType) {
                    wave.monsters.push(new Monster(selectedType, waveNumber));
                }
            }
        }

        return wave;
    }

    /**
     * Start the dungeon
     */
    start() {
        this.startTime = Date.now();
        this.currentWave = 0;
        this.loadWave(0);
        console.log(`Dungeon started: ${this.definition.name}`);
        return this.getCurrentWave();
    }

    /**
     * Load a specific wave
     */
    loadWave(waveIndex) {
        if (waveIndex < 0 || waveIndex >= this.waves.length) return null;
        this.currentWave = waveIndex;
        this.currentMonsters = this.waves[waveIndex].monsters.map(m => {
            // Clone monster for fresh instance
            const newMonster = new Monster(m.type, waveIndex + 1, m.isBoss);
            newMonster.position = { x: Math.random() * 800 + 400, y: 300 };
            return newMonster;
        });
        return this.currentMonsters;
    }

    /**
     * Get current wave
     */
    getCurrentWave() {
        return this.waves[this.currentWave];
    }

    /**
     * Get current monsters
     */
    getCurrentMonsters() {
        return this.currentMonsters.filter(m => m.isAlive);
    }

    /**
     * Advance to next wave
     */
    nextWave() {
        this.currentWave++;
        if (this.currentWave >= this.waves.length) {
            this.complete();
            return null;
        }
        return this.loadWave(this.currentWave);
    }

    /**
     * Complete the dungeon
     */
    complete() {
        this.isComplete = true;
        this.completionTime = Date.now();
        this.reward = this.calculateReward();
        this.character.addGold(this.reward.gold);
        this.character.addExperience(this.reward.xp);
        this.character.dungeonsCompleted++;
        console.log(`Dungeon completed: ${this.definition.name}`);
        return this.reward;
    }

    /**
     * Fail the dungeon
     */
    fail() {
        this.isFailed = true;
        console.log(`Dungeon failed: ${this.definition.name}`);
    }

    /**
     * Calculate dungeon reward
     */
    calculateReward() {
        const baseReward = this.definition.reward || {};
        const multiplier = GameConfig.dungeons.dungeonRewardMultiplier || 1;
        
        return {
            gold: Math.floor((baseReward.gold || 0) * multiplier),
            xp: Math.floor((baseReward.xp || 0) * multiplier),
            loot: baseReward.loot || [],
            lootDrops: this.rollLootDrops(baseReward.loot || [])
        };
    }

    /**
     * Roll for loot drops
     */
    rollLootDrops(lootTable) {
        const drops = [];
        const dropChance = GameConfig.progression.lootDropChance || 25;
        
        for (const lootId of lootTable) {
            if (Math.random() * 100 < dropChance) {
                drops.push(lootId);
            }
        }
        return drops;
    }

    /**
     * Get dungeon progress
     */
    getProgress() {
        return {
            currentWave: this.currentWave,
            totalWaves: this.totalWaves,
            progress: (this.currentWave / this.totalWaves) * 100,
            isComplete: this.isComplete,
            isFailed: this.isFailed
        };
    }

    /**
     * Get dungeon info
     */
    getInfo() {
        return {
            id: this.id,
            dungeonId: this.dungeonId,
            name: this.definition.name,
            description: this.definition.description,
            difficulty: this.definition.difficulty || 1,
            color: this.definition.color || '#fff',
            background: this.definition.background || 'forest',
            ...this.getProgress()
        };
    }
}

class DungeonManager {
    constructor() {
        this.dungeons = DungeonDefinitions;
        this.currentDungeon = null;
        this.completedDungeons = {};
    }

    /**
     * Get all available dungeons
     */
    getAllDungeons() {
        return Object.keys(this.dungeons).map(dungeonId => ({
            id: dungeonId,
            ...this.dungeons[dungeonId]
        }));
    }

    /**
     * Start a dungeon
     */
    startDungeon(dungeonId, character) {
        this.currentDungeon = new Dungeon(dungeonId, character);
        return this.currentDungeon.start();
    }

    /**
     * Get current dungeon
     */
    getCurrentDungeon() {
        return this.currentDungeon;
    }

    /**
     * Get dungeon by ID
     */
    getDungeon(dungeonId) {
        return this.dungeons[dungeonId];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Dungeon, DungeonManager };
}

// ============================================
// DATAMANAGER.JS - Data Management System
// ============================================

/**
 * Central data manager for the game
 * Handles loading, saving, and managing all game data
 */

class DataManager {
    constructor() {
        this.gameData = {
            version: '1.0.0',
            lastUpdated: null,
            characters: [],
            config: null,
            unlockedContent: {
                classes: {},
                dungeons: {},
                spells: {}
            },
            statistics: {
                totalKills: 0,
                totalGold: 0,
                totalXP: 0,
                dungeonsCompleted: 0,
                playTime: 0
            }
        };
        this.fileUtils = new FileUtils();
    }

    /**
     * Initialize with default data
     */
    init() {
        this.gameData.lastUpdated = new Date().toISOString();
        
        // Create default character if none exists        if (this.gameData.characters.length === 0) {
            const defaultCharacter = new Character('Hero', CharacterClass.ARCHER);
            this.gameData.characters.push(this.serializeCharacter(defaultCharacter));
        }
    }

    /**
     * Save character
     */
    saveCharacter(character) {
        const serialized = this.serializeCharacter(character);
        const index = this.gameData.characters.findIndex(c => c.id === character.id);
        
        if (index >= 0) {
            this.gameData.characters[index] = serialized;
        } else {
            this.gameData.characters.push(serialized);
        }
        
        this.gameData.lastUpdated = new Date().toISOString();
        return serialized;
    }

    /**
     * Load character by ID
     */
    loadCharacter(characterId) {
        const data = this.gameData.characters.find(c => c.id === characterId);
        if (!data) return null;
        return this.deserializeCharacter(data);
    }

    /**
     * Get all c


haracters
     */
    getAllCharacters() {
        return this.gameData.characters.map(data => this.deserializeCharacter(data));
    }

    /**
     * Delete character
     */
    deleteCharacter(characterId) {
        this.gameData.characters = this.gameData.characters.filter(c => c.id !== characterId);
        this.gameData.lastUpdated = new Date().toISOString();
    }

    /**
     * Serialize character for storage
     */
    serializeCharacter(character) {
        return {
            id: character.id,
            name: character.name,
            classType: character.classType,
            level: character.level,
            experience: character.experience,
            skillPoints: character.skillPoints,
            stats: character.stats,
            baseStats: character.baseStats,
            position: character.position,
            equipment: character.equipment,
            skills: character.skills,
            abilities: character.abilities,
            gold: character.gold,
            kills: character.kills,
            dungeonsCompleted: character.dungeonsCompleted,
            wavesSurvived: character.wavesSurvived,
            spellCooldowns: {},
            attackCooldown: 0
        };
    }

    /**
     * Deserialize character from storage
     */
    deserializeCharacter(data) {
        const character = new Character(data.name, data.classType);
        character.id = data.id;
        character.level = data.level || 1;
        character.experience = data.experience || 0;
        character.skillPoints = data.skillPoints || 0;
        character.stats = data.stats || character.stats;
        character.baseStats = data.baseStats || character.baseStats;
        character.position = data.position || character.position;
        character.equipment = data.equipment || character.equipment;
        character.skills = data.skills || character.skills;
        character.abilities = data.abilities || character.abilities;
        character.gold = data.gold 
||
 0;
        character.kills = data.kills || 0;
        character.dungeonsCompleted = data.dungeonsCompleted || 0;
        character.wavesSurvived = data.wavesSurvived || 0;
        return character;
    }

    /**
     * Save game configuration
     */
    saveConfig(config) {
        this.gameData.config = config;
        this.gameData.lastUpdated = new Date().toISOString();
    }

    /**
     * Load game configuration
     */
    loadConfig() {
        return this.gameData.config || {};
    }

    /**
     * Unlock content
     */
    unlockContent(type, id) {
        if (!this.gameData.unlockedContent[type]) {
            this.gameData.unlockedContent[type] = {};
        }
        this.gameData.unlockedContent[type][id] = true;
        this.gameData.lastUpdated = new Date().toISOString();
    }

    /**
     * Check if content is unlocked
     */
    isUnlocked(type, id) {
        return this.gameData.unlockedContent[type] && this.gameData.unlockedContent[type][id];
    }

    /**
     * Update statistics
     */
    updateStat(statName, value) {
        if (this.gameData.statistics[statName] !== undefined) {
            this.gameData.statistics[statName] += value;
            this.gameData.lastUpdated = new Date().toISOString();
        }
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return { ...this.gameData.statistics };
    }

    /**
     * Export all game data as JSON
     */
    exportData() {
        return JSON.stringify(this.gameData, null, 2);
    }

    /**
     * Import game data from JSON
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // Validate and merge data            if (data.version) {
                this.gameData = this.migrateData(data);
            } else {
                // Legacy data format                this.gameData = { ...this.gameData, ...data };
            }
            this.gameData.lastUpdated = new Date().toISOString();
      
  
  
  return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    /**
     * Migrate data from older versions
     */
    migrateData(data) {
        // Add version-specific migrations here        if (data.version === '1.0.0') {
            return data;
        }
        return data;
    }

    /**
     * Export to file
     */
    exportToFile(filename = 'autoblattler_save.json') {
        const data = this.exportData();
        return this.fileUtils.downloadFile(data, filename, 'application/json');
    }

    /**
     * Import from file
     */
    async importFromFile(file) {
        const content = await this.fileUtils.readFile(file);
        return this.importData(content);
    }

    /**
     * Save to local storage (fallback)
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('autoblattler_save', this.exportData());
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    /**
     * Load from local storage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('autoblattler_save');
            if (data) {
                return this.importData(data);
            }
            return false;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return false;
        }
    }

    /**
     * Clear all data
     */
    clearAllData() {
        this.gameData = {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            characters: [],
            config: null,
            unlockedContent: {
                classes: {},
                dungeons: {},
                spells: {}
            },
            statistics: {
                totalKills: 0,
                totalGold: 0,
                totalXP: 0,
                dungeonsCompleted: 
0,

   
             playTime: 0
            }
        };
    }

    /**
     * Get complete game state
     */
    getGameState() {
        return { ...this.gameData };
    }
}

// Global data manager instanceconst dataManager = new DataManager();

// Export for use in other modulesif (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, dataManager };
}

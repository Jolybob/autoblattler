// ============================================
// PROGRESSIONSYSTEM.JS - Progression System
// ============================================

/**
 * Progression system for managing character growth
 * Handles leveling, skill points, and unlocking new content
 */

class ProgressionSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.character = null;
        this.skillPointNotifications = [];
        this.levelUpNotifications = [];
        this.unlockNotifications = [];
    }

    /**
     * Set the current character
     */
    setCharacter(character) {
        this.character = character;
    }

    /**
     * Update progression system
     */
    update(deltaTime) {
        if (!this.character) return;
        
        // Check for level up
        this.checkLevelUp();
        
        // Update skill tree progression
        this.updateSkillTree();
        
        // Check for content unlocks
        this.checkContentUnlocks();
    }

    /**
     * Check if character should level up
     */
    checkLevelUp() {
        if (!this.character) return;
        
        const xpRequired = this.character.calculateXPRequired();
        if (this.character.experience >= xpRequired) {
            this.levelUp();
        }
    }

    /**
     * Level up the character
     */
    levelUp() {
        if (!this.character) return;
        
        this.character.levelUp();
        this.notifyLevelUp(this.character.level);
        
        // Check for class unlocks
        this.checkClassUnlocks(this.character.level);
        
        // Check for dungeon unlocks
        this.checkDungeonUnlocks(this.character.level);
        
        console.log(`Character leveled up to level ${this.character.level}`);
    }

    /**
     * Check for class unlocks based on level
     */
    checkClassUnlocks(level) {
        const unlockLevel = GameConfig.classes.unlockLevel || 10;
        
        if (level >= unlockLevel * 1 && !this.character.classDef) {
            // Already has a class
        }
        
        // Unlock warrior at level 5
        if (level >= 5) {
            this.unlockClass(CharacterClass.WARRIOR);
        }
        
        // Unlock mage at level 10
        if (level >= 10) {
            this.unlockClass(CharacterClass.MAGE);
        }
        
        // Unlock rogue at level 15
        if (level >= 15) {
            this.unlockClass(CharacterClass.ROGUE);
        }
        
        // Unlock paladin at level 20
        if (level >= 20) {
            this.unlockClass(CharacterClass.PALADIN);
        }
    }

    /**
     * Unlock a character class
     */
    unlockClass(classId) {
        if (!this.character) return;
        
        // Mark class as unlocked in character data
        if (!this.character.unlockedClasses) {
            this.character.unlockedClasses = {};
        }
        
        this.character.unlockedClasses[classId] = true;
        this.notifyUnlock('class', classId);
        
        // Save progress
        if (this.gameEngine && this.gameEngine.dataManager) {
            this.gameEngine.dataManager.saveCharacter(this.character);
        }
    }

    /**
     * Check for dungeon unlocks based on level
     */
    checkDungeonUnlocks(level) {
        // Unlock crypt at level 5
        if (level >= 5) {
            this.unlockDungeon('crypt');
        }
        
        // Unlock fortress at level 10
        if (level >= 10) {
            this.unlockDungeon('fortress');
        }
        
        // Unlock abyss at level 15
        if (level >= 15) {
            this.unlockDungeon('abyss');
        }
    }

    /**
     * Unlock a dungeon
     */
    unlockDungeon(dungeonId) {
        if (!this.character) return;
        
        if (!this.character.unlockedDungeons) {
            this.character.unlockedDungeons = {};
        }
        
        this.character.unlockedDungeons[dungeonId] = true;
        this.notifyUnlock('dungeon', dungeonId);
        
        // Save progress
        if (this.gameEngine && this.gameEngine.dataManager) {
            this.gameEngine.dataManager.saveCharacter(this.character);
        }
    }

    /**
     * Check for content unlocks
     */
    checkContentUnlocks() {
        if (!this.character) return;
        
        // Check for skill tree nodes that can be unlocked
        if (this.character.skillTree) {
            const availableNodes = this.character.skillTree.getAvailableNodes();
            if (availableNodes.length > 0) {
                this.notifySkillPointsAvailable(this.character.skillPoints);
            }
        }
    }

    /**
     * Update skill tree progression
     */
    updateSkillTree() {
        if (!this.character || !this.character.skillTree) return;
        
        // Auto-unlock root node if not already unlocked
        const rootNode = this.character.skillTree.rootNode;
        if (rootNode && !rootNode.unlocked) {
            rootNode.unlock();
        }
    }

    /**
     * Spend skill point on a node
     */
    spendSkillPoint(nodeId) {
        if (!this.character) return false;
        if (this.character.skillPoints <= 0) return false;
        if (!this.character.skillTree) return false;
        
        const node = this.character.skillTree.getNode(nodeId);
        if (!node) return false;
        
        if (node.unlocked) {
            // Level up the node
            if (node.levelUp()) {
                this.character.skillPoints--;
                this.character.updateStats();
                this.notifySkillPointSpent(nodeId, node.level);
                return true;
            }
        } else {
            // Unlock the node
            if (node.unlock()) {
                this.character.skillPoints--;
                this.character.updateStats();
                this.notifySkillPointSpent(nodeId, 1);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get available skill points
     */
    getAvailableSkillPoints() {
        return this.character ? this.character.skillPoints : 0;
    }

    /**
     * Get unlocked classes
     */
    getUnlockedClasses() {
        if (!this.character) return [];
        
        const unlocked = this.character.unlockedClasses || {};
        return Object.keys(unlocked).filter(classId => unlocked[classId]);
    }

    /**
     * Get unlocked dungeons
     */
    getUnlockedDungeons() {
        if (!this.character) return [];
        
        const unlocked = this.character.unlockedDungeons || {};
        return Object.keys(unlocked).filter(dungeonId => unlocked[dungeonId]);
    }

    /**
     * Get progression info
     */
    getProgressionInfo() {
        if (!this.character) return {};
        
        return {
            level: this.character.level,
            experience: this.character.experience,
            xpRequired: this.character.calculateXPRequired(),
            xpProgress: (this.character.experience / this.character.calculateXPRequired()) * 100,
            skillPoints: this.character.skillPoints,
            unlockedClasses: this.getUnlockedClasses(),
            unlockedDungeons: this.getUnlockedDungeons(),
            kills: this.character.kills,
            gold: this.character.gold,
            dungeonsCompleted: this.character.dungeonsCompleted,
            wavesSurvived: this.character.wavesSurvived
        };
    }

    /**
     * Register level up notification callback
     */
    onLevelUp(callback) {
        this.levelUpNotifications.push(callback);
    }

    /**
     * Register skill point notification callback
     */
    onSkillPointsAvailable(callback) {
        this.skillPointNotifications.push(callback);
    }

    /**
     * Register unlock notification callback
     */
    onUnlock(callback) {
        this.unlockNotifications.push(callback);
    }

    /**
     * Notify level up
     */
    notifyLevelUp(level) {
        for (const callback of this.levelUpNotifications) {
            callback(level);
        }
    }

    /**
     * Notify skill points available
     */
    notifySkillPointsAvailable(points) {
        for (const callback of this.skillPointNotifications) {
            callback(points);
        }
    }

    /**
     * Notify unlock
     */
    notifyUnlock(type, id) {
        for (const callback of this.unlockNotifications) {
            callback(type, id);
        }
    }

    /**
     * Notify skill point spent
     */
    notifySkillPointSpent(nodeId, level) {
        // Could add specific callbacks for this if needed
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProgressionSystem };
}

// ============================================
// CLASS.JS - Character Class System
// ============================================

/**
 * Class system for character classes
 * Manages class definitions, unlocking, and class-specific abilities
 */

class CharacterClassManager {
    constructor() {
        this.classes = ClassDefinitions;
        this.unlockedClasses = { [CharacterClass.ARCHER]: true };
        this.currentClass = CharacterClass.ARCHER;
    }

    /**
     * Get all available character classes
     */
    getAllClasses() {
        return Object.keys(this.classes).map(classId => ({
            id: classId,
            ...this.classes[classId]
        }));
    }

    /**
     * Get unlocked classes
     */
    getUnlockedClasses() {
        return Object.keys(this.unlockedClasses)
            .filter(classId => this.unlockedClasses[classId])
            .map(classId => ({
                id: classId,
                ...this.classes[classId]
            }));
    }

    /**
     * Unlock a new class
     */
    unlockClass(classId, characterLevel) {
        if (this.unlockedClasses[classId]) return true;
        if (!this.classes[classId]) return false;
        if (characterLevel < (GameConfig.classes.unlockLevel || 10)) return false;
        this.unlockedClasses[classId] = true;
        return true;
    }

    /**
     * Change character class
     */
    changeClass(newClassId, character) {
        if (!this.unlockedClasses[newClassId]) return false;
        if (!this.classes[newClassId]) return false;
        
        character.classType = newClassId;
        character.classDef = this.classes[newClassId];
        character.skillTree = newClassId in SkillTreeDefinitions 
            ? SkillTreeDefinitions[newClassId + '_tree'] 
            : SkillTreeDefinitions.archer_tree;
        character.abilities = [...(character.classDef.abilities || [])];
        character.updateStats();
        character.initializeSkillTree();
        
        this.currentClass = newClassId;
        return true;
    }

    /**
     * Get class by ID
     */
    getClass(classId) {
        return this.classes[classId];
    }

    /**
     * Get class abilities
     */
    getClassAbilities(classId) {
        const classDef = this.classes[classId];
        return classDef ? classDef.abilities || [] : [];
    }

    /**
     * Get class stats at a specific level
     */
    getClassStats(classId, level) {
        const classDef = this.classes[classId];
        if (!classDef) return null;
        
        const growth = classDef.growthRates || {};
        return {
            health: classDef.baseStats.health + (level - 1) * (growth.health || 0),
            mana: classDef.baseStats.mana + (level - 1) * (growth.mana || 0),
            attack: classDef.baseStats.attack + (level - 1) * (growth.attack || 0),
            defense: classDef.baseStats.defense + (level - 1) * (growth.defense || 0)
        };
    }

    /**
     * Check if a class is unlocked
     */
    isUnlocked(classId) {
        return this.unlockedClasses[classId] || false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterClassManager };
}

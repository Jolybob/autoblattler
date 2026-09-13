// ============================================
// CONFIGMANAGER.JS - Configuration Management System
// ============================================

class ConfigManager {
    constructor() {
        this.configs = {
            character: { ...GameConfig.character },
            monsters: { ...GameConfig.monsters },
            spells: { ...GameConfig.spells },
            dungeons: { ...GameConfig.dungeons },
            classes: { ...GameConfig.classes },
            skills: { ...GameConfig.skills },
            progression: { ...GameConfig.progression }
        };
        this.defaults = {
            character: { ...GameConfig.character },
            monsters: { ...GameConfig.monsters },
            spells: { ...GameConfig.spells },
            dungeons: { ...GameConfig.dungeons },
            classes: { ...GameConfig.classes },
            skills: { ...GameConfig.skills },
            progression: { ...GameConfig.progression }
        };
        this.listeners = {};
    }
    getConfig(category) { return this.configs[category] || {}; }
    getConfigValue(category, key) { const config = this.getConfig(category); return config[key]; }
    getAllConfigs() { return { ...this.configs }; }
    setConfig(category, config) {
        if (!this.configs[category]) this.configs[category] = {};
        this.configs[category] = { ...this.configs[category], ...config };
        this.applyToGlobal(category, config);
        this.notifyListeners(category, config);
    }
    setConfigValue(category, key, value) {
        if (!this.configs[category]) this.configs[category] = {};
        this.configs[category][key] = value;
        this.applyToGlobal(category, { [key]: value });
        this.notifyListeners(category, { [key]: value });
    }
    applyToGlobal(category, config) {
        if (GameConfig[category]) GameConfig[category] = { ...GameConfig[category], ...config };
    }
    resetConfig(category) {
        if (this.defaults[category]) {
            this.configs[category] = { ...this.defaults[category] };
            this.applyToGlobal(category, this.defaults[category]);
            this.notifyListeners(category, this.defaults[category]);
        }
    }
    resetAllConfigs() {
        for (const category in this.defaults) this.resetConfig(category);
    }
    addListener(category, callback) {
        if (!this.listeners[category]) this.listeners[category] = [];
        this.listeners[category].push(callback);
    }
    removeListener(category, callback) {
        if (this.listeners[category]) this.listeners[category] = this.listeners[category].filter(listener => listener !== callback);
    }
    notifyListeners(category, config) {
        if (this.listeners[category]) this.listeners[category].forEach(callback => { try { callback(config); } catch (error) { console.error('Error in config listener:', error); } });
    }
    validateConfig(category, config) {
        const validators = {
            character: this.validateCharacterConfig.bind(this),
            monsters: this.validateMonsterConfig.bind(this),
            spells: this.validateSpellConfig.bind(this),
            dungeons: this.validateDungeonConfig.bind(this),
            classes: this.validateClassConfig.bind(this),
            skills: this.validateSkillConfig.bind(this),
            progression: this.validateProgressionConfig.bind(this)
        };
        if (validators[category]) return validators[category](config);
        return { valid: true, errors: [] };
    }
    validateCharacterConfig(config) {
        const errors = [];
        if (config.baseHealth !== undefined && (config.baseHealth <= 0 || !Number.isFinite(config.baseHealth))) errors.push('baseHealth must be a positive number');
        if (config.baseMana !== undefined && (config.baseMana < 0 || !Number.isFinite(config.baseMana))) errors.push('baseMana must be a non-negative number');
        if (config.baseAttack !== undefined && (config.baseAttack <= 0 || !Number.isFinite(config.baseAttack))) errors.push('baseAttack must be a positive number');
        if (config.baseDefense !== undefined && (config.baseDefense < 0 || !Number.isFinite(config.baseDefense))) errors.push('baseDefense must be a non-negative number');
        return { valid: errors.length === 0, errors };
    }
    validateMonsterConfig(config) {
        const errors = [];
        if (config.healthMultiplier !== undefined && (config.healthMultiplier <= 0 || !Number.isFinite(config.healthMultiplier))) errors.push('healthMultiplier must be a positive number');
        if (config.attackMultiplier !== undefined && (config.attackMultiplier <= 0 || !Number.isFinite(config.attackMultiplier))) errors.push('attackMultiplier must be a positive number');
        if (config.goldDropMultiplier !== undefined && (config.goldDropMultiplier < 0 || !Number.isFinite(config.goldDropMultiplier))) errors.push('goldDropMultiplier must be a non-negative number');
        if (config.xpMultiplier !== undefined && (config.xpMultiplier <= 0 || !Number.isFinite(config.xpMultiplier))) errors.push('xpMultiplier must be a positive number');
        if (config.enemiesPerWave !== undefined && (config.enemiesPerWave <= 0 || !Number.isInteger(config.enemiesPerWave))) errors.push('enemiesPerWave must be a positive integer');
        if (config.waveScaling !== undefined && (config.waveScaling <= 1 || !Number.isFinite(config.waveScaling))) errors.push('waveScaling must be a number greater than 1');
        return { valid: errors.length === 0, errors };
    }
    validateSpellConfig(config) {
        const errors = [];
        if (config.cooldownReduction !== undefined && (config.cooldownReduction <= 0 || !Number.isFinite(config.cooldownReduction))) errors.push('cooldownReduction must be a positive number');
        if (config.damageMultiplier !== undefined && (config.damageMultiplier <= 0 || !Number.isFinite(config.damageMultiplier))) errors.push('damageMultiplier must be a positive number');
        if (config.manaCostMultiplier !== undefined && (config.manaCostMultiplier <= 0 || !Number.isFinite(config.manaCostMultiplier))) errors.push('manaCostMultiplier must be a positive number');
        return { valid: errors.length === 0, errors };
    }
    validateDungeonConfig(config) {
        const errors = [];
        if (config.dungeonLength !== undefined && (config.dungeonLength <= 0 || !Number.isInteger(config.dungeonLength))) errors.push('dungeonLength must be a positive integer');
        if (config.bossHealthMultiplier !== undefined && (config.bossHealthMultiplier <= 1 || !Number.isFinite(config.bossHealthMultiplier))) errors.push('bossHealthMultiplier must be a number greater than 1');
        if (config.bossDamageMultiplier !== undefined && (config.bossDamageMultiplier <= 1 || !Number.isFinite(config.bossDamageMultiplier))) errors.push('bossDamageMultiplier must be a number greater than 1');
        if (config.dungeonRewardMultiplier !== undefined && (config.dungeonRewardMultiplier <= 1 || !Number.isFinite(config.dungeonRewardMultiplier))) errors.push('dungeonRewardMultiplier must be a number greater than 1');
        return { valid: errors.length === 0, errors };
    }
    validateClassConfig(config) {
        const errors = [];
        if (config.unlockLevel !== undefined && (config.unlockLevel <= 0 || !Number.isInteger(config.unlockLevel))) errors.push('unlockLevel must be a positive integer');
        return { valid: errors.length === 0, errors };
    }
    validateSkillConfig(config) {
        const errors = [];
        if (config.skillPointsPerLevel !== undefined && (config.skillPointsPerLevel < 0 || !Number.isInteger(config.skillPointsPerLevel))) errors.push('skillPointsPerLevel must be a non-negative integer');
        if (config.maxSkillDepth !== undefined && (config.maxSkillDepth <= 0 || !Number.isInteger(config.maxSkillDepth))) errors.push('maxSkillDepth must be a positive integer');
        if (config.skillEffectMultiplier !== undefined && (config.skillEffectMultiplier <= 0 || !Number.isFinite(config.skillEffectMultiplier))) errors.push('skillEffectMultiplier must be a positive number');
        return { valid: errors.length === 0, errors };
    }
    validateProgressionConfig(config) {
        const errors = [];
        if (config.xpBase !== undefined && (config.xpBase <= 0 || !Number.isInteger(config.xpBase))) errors.push('xpBase must be a positive integer');
        if (config.xpScaling !== undefined && (config.xpScaling <= 1 || !Number.isFinite(config.xpScaling))) errors.push('xpScaling must be a number greater than 1');
        if (config.goldBase !== undefined && (config.goldBase <= 0 || !Number.isInteger(config.goldBase))) errors.push('goldBase must be a positive integer');
        if (config.goldScaling !== undefined && (config.goldScaling <= 1 || !Number.isFinite(config.goldScaling))) errors.push('goldScaling must be a number greater than 1');
        if (config.lootDropChance !== undefined && (config.lootDropChance < 0 || config.lootDropChance > 100 || !Number.isFinite(config.lootDropChance))) errors.push('lootDropChance must be a number between 0 and 100');
        return { valid: errors.length === 0, errors };
    }
    toJSON() { return { ...this.configs }; }
    fromJSON(data) {
        for (const category in data) {
            if (this.configs[category]) {
                this.configs[category] = { ...this.configs[category], ...data[category] };
                this.applyToGlobal(category, data[category]);
            }
        }
    }
    getConfigSummary(category) {
        const config = this.getConfig(category);
        const summary = {};
        for (const [key, value] of Object.entries(config)) {
            summary[key] = typeof value === 'number' ? parseFloat(value.toFixed(2)) : value;
        }
        return summary;
    }
    compareWithDefaults(category) {
        const current = this.getConfig(category);
        const defaults = this.defaults[category];
        const differences = {};
        for (const key in current) {
            if (defaults[key] !== undefined && current[key] !== defaults[key]) {
                differences[key] = { current: current[key], default: defaults[key] };
            }
        }
        return differences;
    }
}

const configManager = new ConfigManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, configManager };
}
// ============================================
// ADMINPANEL.JS - Admin Panel Functionality
// ============================================

class AdminPanel {
    constructor() {
        this.panel = document.getElementById('admin-panel');
        this.adminTabs = document.querySelectorAll('.admin-tab');
        this.tabContents = document.querySelectorAll('.admin-tab-content');
        this.configManager = configManager;
        this.init();
    }
    
    init() {
        if (!this.panel) return;
        this.setupTabs();
        this.setupCloseButton();
        this.loadConfigurations();
        this.setupSaveButtons();
        this.setupExportImport();
    }
    
    setupTabs() {
        this.adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    }
    
    switchTab(tabId) {
        this.adminTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }
    
    setupCloseButton() {
        const closeBtn = document.getElementById('close-admin');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => { this.hide(); });
        }
    }
    
    show() { if (this.panel) { this.panel.classList.remove('hidden'); this.panel.classList.add('active'); } }
    hide() { if (this.panel) { this.panel.classList.add('hidden'); this.panel.classList.remove('active'); } }
    toggle() { if (this.panel.classList.contains('hidden')) this.show(); else this.hide(); }
    isVisible() { return this.panel && !this.panel.classList.contains('hidden'); }
    
    loadConfigurations() {
        this.loadCharacterConfig(); this.loadMonsterConfig(); this.loadSpellConfig();
        this.loadDungeonConfig(); this.loadClassConfig(); this.loadSkillConfig(); this.loadProgressionConfig();
    }
    
    loadCharacterConfig() {
        const config = this.configManager.getConfig('character');
        this.setInputValue('config-base-health', config.baseHealth);
        this.setInputValue('config-base-mana', config.baseMana);
        this.setInputValue('config-base-attack', config.baseAttack);
        this.setInputValue('config-base-defense', config.baseDefense);
        this.setInputValue('config-health-per-level', config.healthPerLevel);
        this.setInputValue('config-mana-per-level', config.manaPerLevel);
        this.setInputValue('config-attack-per-level', config.attackPerLevel);
        this.setInputValue('config-starting-gold', config.startingGold);
    }
    
    loadMonsterConfig() {
        const config = this.configManager.getConfig('monsters');
        this.setInputValue('config-monster-health', config.healthMultiplier);
        this.setInputValue('config-monster-attack', config.attackMultiplier);
        this.setInputValue('config-monster-gold', config.goldDropMultiplier);
        this.setInputValue('config-monster-xp', config.xpMultiplier);
        this.setInputValue('config-enemies-per-wave', config.enemiesPerWave);
        this.setInputValue('config-wave-scaling', config.waveScaling);
    }
    
    loadSpellConfig() {
        const config = this.configManager.getConfig('spells');
        this.setInputValue('config-spell-cooldown', config.cooldownReduction);
        this.setInputValue('config-spell-damage', config.damageMultiplier);
        this.setInputValue('config-spell-mana-cost', config.manaCostMultiplier);
        this.loadSpellList();
    }
    
    loadDungeonConfig() {
        const config = this.configManager.getConfig('dungeons');
        this.setInputValue('config-dungeon-length', config.dungeonLength);
        this.setInputValue('config-boss-health', config.bossHealthMultiplier);
        this.setInputValue('config-boss-damage', config.bossDamageMultiplier);
        this.setInputValue('config-dungeon-reward', config.dungeonRewardMultiplier);
        this.loadDungeonList();
    }
    
    loadClassConfig() {
        const config = this.configManager.getConfig('classes');
        this.setInputValue('config-class-unlock-level', config.unlockLevel);
        this.loadClassList();
    }
    
    loadSkillConfig() {
        const config = this.configManager.getConfig('skills');
        this.setInputValue('config-skill-points-per-level', config.skillPointsPerLevel);
        this.setInputValue('config-max-skill-depth', config.maxSkillDepth);
        this.setInputValue('config-skill-effect', config.skillEffectMultiplier);
    }
    
    loadProgressionConfig() {
        const config = this.configManager.getConfig('progression');
        this.setInputValue('config-xp-base', config.xpBase);
        this.setInputValue('config-xp-scaling', config.xpScaling);
        this.setInputValue('config-gold-base', config.goldBase);
        this.setInputValue('config-gold-scaling', config.goldScaling);
        this.setInputValue('config-loot-chance', config.lootDropChance);
    }
    
    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) input.value = value;
    }
    
    loadSpellList() {
        const container = document.getElementById('spell-config-list');
        if (!container) return;
        container.innerHTML = '';
        for (const spellId in SpellDefinitions) {
            const spell = SpellDefinitions[spellId];
            const spellItem = document.createElement('div');
            spellItem.className = 'spell-item';
            spellItem.innerHTML = '<h5>' + (spell.icon || '') + ' ' + spell.name + '</h5>' +
                '<div><strong>Type:</strong> ' + spell.type + '</div>' +
                '<div><strong>Description:</strong> ' + spell.description + '</div>' +
                '<div><strong>Damage:</strong> ' + (spell.baseDamage || 0) + '</div>' +
                '<div><strong>Mana Cost:</strong> ' + (spell.baseManaCost || 0) + '</div>' +
                '<div><strong>Cooldown:</strong> ' + (spell.baseCooldown || 0) + 'ms</div>' +
                '<div><strong>Range:</strong> ' + (spell.range || 0) + '</div>';
            container.appendChild(spellItem);
        }
    }
    
    loadDungeonList() {
        const container = document.getElementById('dungeon-config-list');
        if (!container) return;
        container.innerHTML = '';
        for (const dungeonId in DungeonDefinitions) {
            const dungeon = DungeonDefinitions[dungeonId];
            const dungeonItem = document.createElement('div');
            dungeonItem.className = 'dungeon-item';
            dungeonItem.innerHTML = '<h5>' + dungeon.name + '</h5>' +
                '<div><strong>Description:</strong> ' + dungeon.description + '</div>' +
                '<div><strong>Waves:</strong> ' + dungeon.waves + '</div>' +
                '<div><strong>Difficulty:</strong> ' + dungeon.difficulty + '</div>' +
                '<div><strong>Boss:</strong> ' + (dungeon.boss || 'None') + '</div>' +
                '<div><strong>Monsters:</strong> ' + dungeon.monsters.map(m => m.type).join(', ') + '</div>';
            container.appendChild(dungeonItem);
        }
    }
    
    loadClassList() {
        const container = document.getElementById('class-config-list');
        if (!container) return;
        container.innerHTML = '';
        for (const classId in ClassDefinitions) {
            const classDef = ClassDefinitions[classId];
            const classItem = document.createElement('div');
            classItem.className = 'class-item';
            classItem.innerHTML = '<h5>' + (classDef.icon || '') + ' ' + classDef.name + '</h5>' +
                '<div>' + classDef.description + '</div>' +
                '<div><strong>Base Stats:</strong></div>' +
                '<div>  Attack: ' + classDef.baseStats.attack + ' (+' + classDef.growthRates.attack + '/lvl)</div>' +
                '<div>  Defense: ' + classDef.baseStats.defense + ' (+' + classDef.growthRates.defense + '/lvl)</div>' +
                '<div>  Health: ' + classDef.baseStats.health + ' (+' + classDef.growthRates.health + '/lvl)</div>' +
                '<div>  Mana: ' + classDef.baseStats.mana + ' (+' + classDef.growthRates.mana + '/lvl)</div>' +
                '<div><strong>Abilities:</strong> ' + classDef.abilities.join(', ') + '</div>';
            container.appendChild(classItem);
        }
    }
    
    setupSaveButtons() {
        const tabs = ['characters', 'monsters', 'spells', 'dungeons', 'classes', 'skills', 'progression'];
        tabs.forEach(tab => {
            const btn = document.querySelector('#tab-' + tab + ' .save-button');
            if (btn) btn.onclick = () => this['save' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Config']();
        });
    }
    
    saveCharacterConfig() {
        const config = {
            baseHealth: parseFloat(this.getInputValue('config-base-health')) || 100,
            baseMana: parseFloat(this.getInputValue('config-base-mana')) || 50,
            baseAttack: parseFloat(this.getInputValue('config-base-attack')) || 10,
            baseDefense: parseFloat(this.getInputValue('config-base-defense')) || 5,
            healthPerLevel: parseFloat(this.getInputValue('config-health-per-level')) || 20,
            manaPerLevel: parseFloat(this.getInputValue('config-mana-per-level')) || 10,
            attackPerLevel: parseFloat(this.getInputValue('config-attack-per-level')) || 2,
            startingGold: parseFloat(this.getInputValue('config-starting-gold')) || 0
        };
        const validation = this.configManager.validateConfig('character', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('character', config);
        this.showNotification('Character configuration saved!');
    }
    
    saveMonsterConfig() {
        const config = {
            healthMultiplier: parseFloat(this.getInputValue('config-monster-health')) || 1.0,
            attackMultiplier: parseFloat(this.getInputValue('config-monster-attack')) || 1.0,
            goldDropMultiplier: parseFloat(this.getInputValue('config-monster-gold')) || 1.0,
            xpMultiplier: parseFloat(this.getInputValue('config-monster-xp')) || 1.0,
            enemiesPerWave: parseInt(this.getInputValue('config-enemies-per-wave')) || 5,
            waveScaling: parseFloat(this.getInputValue('config-wave-scaling')) || 1.1
        };
        const validation = this.configManager.validateConfig('monsters', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('monsters', config);
        this.showNotification('Monster configuration saved!');
    }
    
    saveSpellConfig() {
        const config = {
            cooldownReduction: parseFloat(this.getInputValue('config-spell-cooldown')) || 1.0,
            damageMultiplier: parseFloat(this.getInputValue('config-spell-damage')) || 1.0,
            manaCostMultiplier: parseFloat(this.getInputValue('config-spell-mana-cost')) || 1.0
        };
        const validation = this.configManager.validateConfig('spells', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('spells', config);
        this.showNotification('Spell configuration saved!');
    }
    
    saveDungeonConfig() {
        const config = {
            dungeonLength: parseInt(this.getInputValue('config-dungeon-length')) || 10,
            bossHealthMultiplier: parseFloat(this.getInputValue('config-boss-health')) || 3.0,
            bossDamageMultiplier: parseFloat(this.getInputValue('config-boss-damage')) || 2.0,
            dungeonRewardMultiplier: parseFloat(this.getInputValue('config-dungeon-reward')) || 2.0
        };
        const validation = this.configManager.validateConfig('dungeons', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('dungeons', config);
        this.showNotification('Dungeon configuration saved!');
    }
    
    saveClassConfig() {
        const config = { unlockLevel: parseInt(this.getInputValue('config-class-unlock-level')) || 10 };
        const validation = this.configManager.validateConfig('classes', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('classes', config);
        this.showNotification('Class configuration saved!');
    }
    
    saveSkillConfig() {
        const config = {
            skillPointsPerLevel: parseInt(this.getInputValue('config-skill-points-per-level')) || 1,
            maxSkillDepth: parseInt(this.getInputValue('config-max-skill-depth')) || 5,
            skillEffectMultiplier: parseFloat(this.getInputValue('config-skill-effect')) || 1.0
        };
        const validation = this.configManager.validateConfig('skills', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('skills', config);
        this.showNotification('Skill configuration saved!');
    }
    
    saveProgressionConfig() {
        const config = {
            xpBase: parseInt(this.getInputValue('config-xp-base')) || 100,
            xpScaling: parseFloat(this.getInputValue('config-xp-scaling')) || 1.5,
            goldBase: parseInt(this.getInputValue('config-gold-base')) || 10,
            goldScaling: parseFloat(this.getInputValue('config-gold-scaling')) || 1.2,
            lootDropChance: parseInt(this.getInputValue('config-loot-chance')) || 25
        };
        const validation = this.configManager.validateConfig('progression', config);
        if (!validation.valid) { alert('Validation errors:\n' + validation.errors.join('\n')); return; }
        this.configManager.setConfig('progression', config);
        this.showNotification('Progression configuration saved!');
    }
    
    getInputValue(id) { const input = document.getElementById(id); return input ? input.value : ''; }
    
    setupExportImport() {
        const exportBtn = document.getElementById('export-config');
        const importBtn = document.getElementById('import-config');
        const fileInput = document.getElementById('config-file-input');
        const resetBtn = document.getElementById('reset-config');
        if (exportBtn) exportBtn.onclick = () => this.exportConfigurations();
        if (importBtn && fileInput) {
            importBtn.onclick = () => fileInput.click();
            fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) this.importConfigurations(e.target.files[0]); });
        }
        if (resetBtn) resetBtn.onclick = () => this.resetConfigurations();
    }
    
    exportConfigurations() {
        const data = this.configManager.toJSON();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autoblattler_config_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Configurations exported!');
    }
    
    importConfigurations(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.configManager.fromJSON(data);
                this.loadConfigurations();
                this.showNotification('Configurations imported!');
            } catch (error) {
                alert('Error importing configurations: ' + error.message);
            }
        };
        reader.onerror = (error) => { alert('Error reading file: ' + error.message); };
        reader.readAsText(file);
    }
    
    resetConfigurations() {
        if (confirm('Are you sure you want to reset all configurations to default?')) {
            this.configManager.resetAllConfigs();
            this.loadConfigurations();
            this.showNotification('Configurations reset to default!');
        }
    }
    
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(0, 0, 0, 0.8); color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000; animation: slideIn 0.3s ease;';
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.animation = 'slideOut 0.3s ease'; setTimeout(() => { notification.remove(); }, 300); }, duration);
    }
}

let adminPanel = null;
document.addEventListener('DOMContentLoaded', () => { adminPanel = new AdminPanel(); });
if (typeof module !== 'undefined' && module.exports) { module.exports = { AdminPanel, adminPanel }; }
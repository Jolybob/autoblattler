// ============================================
// CHARACTER.JS - Character Class and Management
// ============================================

class Character {
    constructor(name, classType = 'archer') {
        this.id = this.generateId();
        this.name = name || 'Hero';
        this.classType = classType;
        this.level = 1;
        this.experience = 0;
        this.skillPoints = 0;
        this.classDef = ClassDefinitions[classType] || ClassDefinitions[CharacterClass.ARCHER];
        this.baseStats = { health: this.classDef.baseStats.health || GameConfig.character.baseHealth, mana: this.classDef.baseStats.mana || GameConfig.character.baseMana, attack: this.classDef.baseStats.attack || GameConfig.character.baseAttack, defense: this.classDef.baseStats.defense || GameConfig.character.baseDefense };
        this.stats = { health: this.baseStats.health, maxHealth: this.baseStats.health, mana: this.baseStats.mana, maxMana: this.baseStats.mana, attack: this.baseStats.attack, defense: this.baseStats.defense, speed: 1.0, attackSpeed: 1.0, critChance: 5, critMultiplier: 2.0, evasion: 0, accuracy: 100 };
        this.position = { x: 100, y: 300 };
        this.isAlive = true;
        this.isCasting = false;
        this.currentSpell = null;
        this.attackCooldown = 0;
        this.spellCooldowns = {};
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.skills = {};
        this.skillTree = new SkillTree(classType + '_tree', this);
        this.abilities = [...(this.classDef.abilities || [])];
        this.kills = 0;
        this.gold = GameConfig.character.startingGold || 0;
        this.dungeonsCompleted = 0;
        this.wavesSurvived = 0;
    }
    generateId() { return 'char_' + Date.now() + '_' + Math.floor(Math.random() * 10000); }
    initializeSkillTree() { if (this.skillTree && this.skillTree.nodes) { for (
const nodeId in this.skillTree.nodes) { this.skills[nodeId] = { level: 0, unlocked: false }; } const rootId = this.skillTree.root; if (rootId && this.skills[rootId]) { this.skills[rootId].level = 1; this.skills[rootId].unlocked = true; } } }
    calculateMaxHealth() { const base = this.baseStats.health + (this.level - 1) * GameConfig.character.healthPerLevel; const classGrowth = (this.level - 1) * (this.classDef.growthRates?.health || 0); const equipmentBonus = this.getEquipmentStatBonus('health') || 0; const skillBonus = this.getSkillBonus('health') || 0; return Math.floor(base + classGrowth + equipmentBonus + skillBonus); }
    calculateMaxMana() { const base = this.baseStats.mana + (this.level - 1) * GameConfig.character.manaPerLevel; const classGrowth = (this.level - 1) * (this.classDef.growthRates?.mana || 0); const equipmentBonus = this.getEquipmentStatBonus('mana') || 0; const skillBonus = this.getSkillBonus('mana') || 0; return Math.floor(base + classGrowth + equipmentBonus + skillBonus); }
    calculateAttack() { const base = this.baseStats.attack + (this.level - 1) * GameConfig.character.attackPerLevel; const classGrowth = (this.level - 1) * (this.classDef.growthRates?.attack || 0); const equipmentBonus = this.getEquipmentStatBonus('attack') || 0; const skillBonus = this.getSkillBonus('attack') || 0; return Math.floor(base + classGrowth + equipmentBonus + skillBonus); }
    calculateDefense() { const base = this.baseStats.defense + (this.level - 1) * GameConfig.character.defensePerLevel; const classGrowth = (this.level - 1) * (this.classDef.growthRates?.defense || 0); const equipmentBonus = this.getEquipmentStatBonus('defense') || 0; const skillBonus = this.getSkillBonus('defense') || 0; return Math.floor(base + classGrowth + equipmentBonus + skillBonus); }
    getEquipmentStatBonus(stat) { let bonus = 0; for (const slot in this.equipment) { const item = this.equipment[slot]; if (item && item.stats && item.stats[stat]) { bonus += item.stats[stat]; } } return bonus; }
    getSkillBonus(stat) { let bonus = 0; for (const skillId in this.skills) { const skill = this.skills[skillId]; if (skill.unlocked && skill.level > 0 && this.skillTree.nodes[skillId]) { const node = this.skillTree.nodes[skillId]; if (node.effect && node.effect[stat]) { bonus += node.effect[stat] * skill.level * GameConfig.skills.skillEffectMultiplier; } } } return bonus; }
    updateStats() { this.stats.maxHealth = this.calculateMaxHealth(); this.stats.maxMana = this.calculateMaxMana(); this.stats.attack = this.calculateAttack(); this.stats.defense = this.calculateDefense(); if (this.stats.health > this.stats.maxHealth) this.stats.health = this.stats.maxHealth; if (this.stats.mana > this.stats.maxMana) this.stats.mana = this.stats.maxMana; }
    addExperience(xp) { const xpRequired = this.calculateXPRequired(); this.experience += xp * GameConfig.progression.xpMultiplier; while (this.experience >= xpRequired) { this.experience -= xpRequired; this.levelUp(); } return this.experience >= xpRequired; }
    calculateXPRequired() { return Math.floor(GameConfig.progression.xpBase * Math.pow(GameConfig.progression.xpScaling, this.level - 1)); }
    levelUp() { this.level++; this.skillPoints += GameConfig.skills.skillPointsPerLevel; this.updateStats(); this.heal(this.stats.maxHealth); console.log(`Level up! Now level ${this.level}`); }
    addGold(amount) { this.gold += amount * GameConfig.progression.goldMultiplier; return this.gold; }
    attack(target) { if (!this.isAlive || this.isCasting) return 0; const now = Date.now(); if (now < this.attackCooldown) return 0; const baseDamage = this.stats.attack; const crit = Math.random() * 100 < this.stats.critChance; const damage = crit ? baseDamage * this.stats.critMultiplier : baseDamage; const cooldown = 1000 / this.stats.attackSpeed; this.attackCooldown = now + cooldown; return Math.floor(damage); }
    castSpell(spellId, targets) { if (!this.isAlive) return false; const spell = SpellDefinitions[spellId]; if (!spell) return false; if (!this.abilities.includes(spellId)) return false; const manaCost = spell.baseMana
Cost * GameConfig.spells.manaCostMultiplier; if (this.stats.mana < manaCost) return false; const now = Date.now(); if (this.spellCooldowns[spellId] && now < this.spellCooldowns[spellId]) return false; this.stats.mana -= manaCost; const cooldown = spell.baseCooldown * GameConfig.spells.cooldownReduction; this.spellCooldowns[spellId] = now + cooldown; this.isCasting = true; this.currentSpell = spell; switch (spell.type) { case 'damage': this.castDamageSpell(spell, targets); break; case 'heal': this.castHealSpell(spell, targets); break; case 'aoe': this.castAoESpell(spell, targets); break; case 'buff': this.castBuffSpell(spell, targets); break; case 'debuff': this.castDebuffSpell(spell, targets); break; } setTimeout(() => { this.isCasting = false; this.currentSpell = null; }, 500); return true; }
    castDamageSpell(spell, targets) { const damage = spell.baseDamage * GameConfig.spells.damageMultiplier; if (Array.isArray(targets)) { targets.forEach(target => { if (target && target.isAlive) target.takeDamage(Math.floor(damage)); }); } else if (targets) { targets.takeDamage(Math.floor(damage)); } }
    castHealSpell(spell, targets) { const healAmount = spell.baseHeal * GameConfig.spells.damageMultiplier; if (Array.isArray(targets)) { targets.forEach(target => { if (target && target.isAlive) target.heal(Math.floor(healAmount)); }); } else if (targets) { targets.heal(Math.floor(healAmount)); } else { this.heal(Math.floor(healAmount)); } }
    castAoESpell(spell, targets) { const damage = spell.baseDamage * GameConfig.spells.damageMultiplier; if (Array.isArray(targets)) { targets.forEach(target => { if (target && target.isAlive) target.takeDamage(Math.floor(damage)); }); } }
    castBuffSpell(spell, targets) { if (Array.isArray(targets)) { targets.forEach(target => { if (target && target.isAlive) this.applyBuff(target, spell); }); } else if (targets) { this.applyBuff(targets, spell); } else { this.applyBuff(this, spell); } }
    castDebuffSpell(spell, targets) { if (Array.isArray(targets)) { targets.forEach(target => { if (target && target.isAlive) this.applyDebuff(target, spell); }); } else if (targets) { this.applyDebuff(targets, spell); } }
    applyBuff(target, spell) { if (spell.effect) { for (const [key, value] of Object.entries(spell.effect)) { if (key !== 'cooldown' && key !== 'duration' && key !== 'damage' && key !== 'heal') { if (target.stats[key] !== undefined) target.stats[key] += value * GameConfig.spells.damageMultiplier; } } } }
    applyDebuff(target, spell) { if (spell.effect) { for (const [key, value] of Object.entries(spell.effect)) { if (key !== 'cooldown' && key !== 'duration' && key !== 'damage' && key !== 'heal') { if (target.stats[key] !== undefined) target.stats[key] -= value * GameConfig.spells.damageMultiplier; } } } }
    takeDamage(amount) { if (!this.isAlive) return 0; const damage = Math.max(1, amount - this.stats.defense); this.stats.health -= damage; if (this.stats.health <= 0) { this.stats.health = 0; this.isAlive = false; this.die(); } return damage; }
    heal(amount) { if (!this.isAlive) return 0; const actualHeal = Math.min(amount, this.stats.maxHealth - this.stats.health); this.stats.health += actualHeal; return actualHeal; }
    die() { this.isAlive = false; console.log(`${this.name} has died!`); }
    revive() { this.isAlive = true; this.stats.health = Math.floor(this.stats.maxHealth * 0.5); this.stats.mana = Math.floor(this.stats.maxMana * 0.5); }
    equipItem(item, slot) { if (!item || !slot) return false; if (item.class && item.class !== this.classType) return false; if (this.equipment[slot]) this.unequipItem(slot); this.equipment[slot] = item; this.updateStats(); return true; }
    unequipItem(slot) { const item = this.equipment[slot]; if (item) { this.equipment[slot] = null; this.updateStats(); return item; } return null; }
    canUnlockSkill(skillId) { const node = this.skillTree.nodes[sk
illId]; if (!node) return false; if (this.skills[skillId] && this.skills[skillId].unlocked) return
 false; if (this.skillPoints < 1) return false; for (const req of node.requirements || []) { const requiredSkill = this.skills[req.skill]; if (!requiredSkill || !requiredSkill.unlocked || requiredSkill.level < req.level) return false; } const depth = this.calculateSkillDepth(skillId); if (depth > GameConfig.skills.maxSkillDepth) return false; return true; }
    calculateSkillDepth(skillId) { const node = this.skillTree.nodes[skillId]; if (!node || !node.requirements || node.requirements.length === 0) return 0; let maxDepth = 0; for (const req of node.requirements) { const depth = this.calculateSkillDepth(req.skill); maxDepth = Math.max(maxDepth, depth + 1); } return maxDepth; }
    unlockSkill(skillId) { if (!this.canUnlockSkill(skillId)) return false; const node = this.skillTree.nodes[skillId]; if (!node) return false; this.skills[skillId] = { level: 1, unlocked: true }; this.skillPoints--; this.updateStats(); return true; }
    upgradeSkill(skillId) { const skill = this.skills[skillId]; if (!skill || !skill.unlocked) return false; const node = this.skillTree.nodes[skillId]; if (!node) return false; if (skill.level >= node.maxLevel) return false; if (this.skillPoints < 1) return false; skill.level++; this.skillPoints--; this.updateStats(); return true; }
    toJSON() { return { id: this.id, name: this.name, classType: this.classType, level: this.level, experience: this.experience, skillPoints: this.skillPoints, baseStats: this.baseStats, stats: this.stats, position: this.position, isAlive: this.isAlive, equipment: this.equipment, skills: this.skills, abilities: this.abilities, kills: this.kills, gold: this.gold, dungeonsCompleted: this.dungeonsCompleted, wavesSurvived: this.wavesSurvived }; }
    fromJSON(data) { this.id = data.id || this.id; this.name = data.name || this.name; this.classType = data.classType || this.classType; this.level = data.level || this.level; this.experience = data.experience || this.experience; this.skillPoints = data.skillPoints || this.
skillPoints; this.baseStats = data.baseStats || this.baseStats; this.stats = data.stats || this.stats; this.position = data.position || this.position; this.isAlive = data.isAlive !== undefined ? data.isAlive : this.isAlive; this.equipment = data.equipment || this.equipment; this.skills = data.skills || this.skills; this.abilities = data.abilities || this.abilities; this.kills = data.kills || this.kills; this.gold = data.gold || this.gold; this.dungeonsCompleted = data.dungeonsCompleted || this.dungeonsCompleted; this.wavesSurvived = data.wavesSurvived || this.wavesSurvived; this.classDef = ClassDefinitions[this.classType] || ClassDefinitions[CharacterClass.ARCHER]; this.skillTree = new SkillTree(this.classType + '_tree', this); return this; }
    static fromJSON(data) { const character = new Character(data.name, data.classType); return character.fromJSON(data); }
}
// FORCE UPDATE TEST
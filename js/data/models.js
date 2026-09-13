// ============================================
// MODELS.JS - Core Data Models and Types
// ============================================

/**
 * Game Configuration Model
 * Central configuration for all game parameters
 */
const GameConfig = {
    character: {
        baseHealth: 100,
        baseMana: 50,
        baseAttack: 10,
        baseDefense: 5,
        healthPerLevel: 20,
        manaPerLevel: 10,
        attackPerLevel: 2,
        defensePerLevel: 1,
        startingGold: 0
    },
    monsters: {
        healthMultiplier: 1.0,
        attackMultiplier: 1.0,
        goldDropMultiplier: 1.0,
        xpMultiplier: 1.0,
        enemiesPerWave: 5,
        waveScaling: 1.1
    },
    spells: {
        cooldownReduction: 1.0,
        damageMultiplier: 1.0,
        manaCostMultiplier: 1.0
    },
    dungeons: {
        dungeonLength: 10,
        bossHealthMultiplier: 3.0,
        bossDamageMultiplier: 2.0,
        dungeonRewardMultiplier: 2.0
    },
    classes: {
        unlockLevel: 10
    },
    skills: {
        skillPointsPerLevel: 1,
        maxSkillDepth: 5,
        skillEffectMultiplier: 1.0
    },
    progression: {
        xpBase: 100,
        xpScaling: 1.5,
        goldBase: 10,
        goldScaling: 1.2,
        lootDropChance: 25
    }
};

const CharacterClass = {
    ARCHER: 'archer',
    WARRIOR: 'warrior',
    MAGE: 'mage',
    ROGUE: 'rogue',
    PALADIN: 'paladin'
};

const ClassDefinitions = {
    archer: {
        name: 'Archer',
        description: 'Ranged attacker with high damage',
        baseStats: { attack: 15, defense: 3, health: 80, mana: 60 },
        growthRates: { attack: 3, defense: 0.5, health: 15, mana: 10 },
        abilities: ['double_shot', 'piercing_arrows', 'rain_of_arrows'],
        color: '#4dabf7',
        icon: '🏹'
    },
    warrior: {
        name: 'Warrior',
        description: 'Melee fighter with high health',
        baseStats: { attack: 12, defense: 8, health: 120, mana: 30 },
        growthRates: { attack: 2, defense: 1.5, health: 25, mana: 5 },
        abilities: ['whirlwind', 'shield_bash', 'cleave'],
        color: '#ff6b6b',
        icon: '⚔️'
    },
    mage: {
        name: 'Mage',
        description: 'Spellcaster with high mana',
        baseStats: { attack: 8, defense: 2, health: 60, mana: 100 },
        growthRates: { attack: 1, defense: 0.3, health: 10, mana: 20 },
        abilities: ['fireball', 'ice_shard', 'lightning_bolt'],
        color: '#a855f7',
        icon: '🔮'
    },
    rogue: {
        name: 'Rogue',
        description: 'Fast attacker with critical hits',
        baseStats: { attack: 14, defense: 4, health: 70, mana: 40 },
        growthRates: { attack: 2.5, defense: 0.8, health: 12, mana: 8 },
        abilities: ['backstab', 'poison_dagger', 'shadow_step'],
        color: '#28a745',
        icon: '🗡️'
    },
    paladin: {
        name: 'Paladin',
        description: 'Holy warrior with healing abilities',
        baseStats: { attack: 10, defense: 6, health: 100, mana: 70 },
        growthRates: { attack: 1.8, defense: 1.2, health: 20, mana: 12 },
        abilities: ['holy_strike', 'heal', 'divine_shield'],
        color: '#ffc107',
        icon: '🛡️'
    }
};

const MonsterType = {
    NORMAL: 'normal',
    ELITE: 'elite',
    BOSS: 'boss',
    FLYING: 'flying',
    ARMOR: 'armor',
    MAGIC: 'magic'
};

const MonsterDefinitions = {
    goblin: { name: 'Goblin', type: MonsterType.NORMAL, baseHealth: 30, baseAttack: 5, baseDefense: 1, baseGold: 10, baseXP: 15, speed: 1.0, color: '#28a745', icon: '👹' },
    skeleton: { name: 'Skeleton', type: MonsterType.NORMAL, baseHealth: 40, baseAttack: 7, baseDefense: 3, baseGold: 12, baseXP: 20, speed: 0.9, color: '#fff', icon: '💀' },
    orc: { name: 'Orc', type: MonsterType.NORMAL, baseHealth: 60, baseAttack: 10, baseDefense: 5, baseGold: 15, baseXP: 25, speed: 0.8, color: '#ff6b6b', icon: '🧌' },
    goblin_archer: { name: 'Goblin Archer', type: MonsterType.ELITE, baseHealth: 25, baseAttack: 12, baseDefense: 1, baseGold: 20, baseXP: 30, speed: 1.2, color: '#4dabf7', icon: '🏹', ranged: true, attackRange: 200 },
    skeleton_mage: { name: 'Skeleton Mage', type: MonsterType.ELITE, baseHealth: 35, baseAttack: 15, baseDefense: 2, baseGold: 25, baseXP: 35, speed: 0.8, color: '#a855f7', icon: '🔮', ranged: true, attackRange: 250 },
    orc_berzerker: { name: 'Orc Berzerker', type: MonsterType.ELITE, baseHealth: 80, baseAttack: 18, baseDefense: 8, baseGold: 30, baseXP: 40, speed: 1.1, color: '#dc3545', icon: '🪓' },
    goblin_king: { name: 'Goblin King', type: MonsterType.BOSS, baseHealth: 200, baseAttack: 25, baseDefense: 10, baseGold: 100, baseXP: 100, speed: 0.7, color: '#ffc107', icon: '👑', abilities: ['summon_minions', 'mighty_blow'] },
    skeleton_lord: { name: 'Skeleton Lord', type: MonsterType.BOSS, baseHealth: 250, baseAttack: 30, baseDefense: 12, baseGold: 120, baseXP: 120, speed: 0.6, color: '#6f42c1', icon: '☠️', abilities: ['raise_dead', 'bone_prison'] },
    orc_warlord: { name: 'Orc Warlord', type: MonsterType.BOSS, baseHealth: 300, baseAttack: 35, baseDefense: 15, baseGold: 150, baseXP: 150, speed: 0.8, color: '#fd7e14', icon: '🛡️', abilities: ['war_cry', 'crushing_blow'] }
};

const SpellType = {
    DAMAGE: 'damage',
    HEAL: 'heal',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    AOE: 'aoe'
};

const SpellDefinitions = {
    double_shot: { name: 'Double Shot', type: SpellType.DAMAGE, description: 'Fire two arrows at once', baseDamage: 20, baseManaCost: 15, baseCooldown: 5000, range: 300, targets: 2, color: '#4dabf7', icon: '🏹🏹' },
    piercing_arrows: { name: 'Piercing Arrows', type: SpellType.DAMAGE, description: 'Arrows pierce through enemies', baseDamage: 15, baseManaCost: 20, baseCooldown: 8000, range: 400, pierce: true, color: '#4dabf7', icon: '🎯' },
    rain_of_arrows: { name: 'Rain of Arrows', type: SpellType.AOE, description: 'Rain arrows on all enemies', baseDamage: 10, baseManaCost: 30, baseCooldown: 12000, range: 500, aoeRadius: 150, color: '#4dabf7', icon: '☔🏹' },
    whirlwind: { name: 'Whirlwind', type: SpellType.AOE, description: 'Spin around hitting all nearby enemies', baseDamage: 25, baseManaCost: 20, baseCooldown: 10000, range: 100, aoeRadius: 120, color: '#ff6b6b', icon: '🌪️' },
    shield_bash: { name: 'Shield Bash', type: SpellType.DAMAGE, description: 'Stun and damage a single enemy', baseDamage: 30, baseManaCost: 15, baseCooldown: 7000, range: 80, stunDuration: 2000, color: '#ff6b6b', icon: '🛡️✋' },
    cleave: { name: 'Cleave', type: SpellType.AOE, description: 'Hit multiple enemies in a cone', baseDamage: 20, baseManaCost: 25, baseCooldown: 8000, range: 100, coneAngle: 90, color: '#ff6b6b', icon: '⚔️⚔️' },
    fireball: { name: 'Fireball', type: SpellType.DAMAGE, description: 'Launch a powerful fireball', baseDamage: 40, baseManaCost: 30, baseCooldown: 6000, range: 400, burnDamage: 5, burnDuration: 3000, color: '#a855f7', icon: '🔥' },
    ice_shard: { name: 'Ice Shard', type: SpellType.DAMAGE, description: 'Freeze and damage enemies', baseDamage: 25, baseManaCost: 20, baseCooldown: 5000, range: 350, freezeDuration: 2000, color: '#a855f7', icon: '❄️' },
    lightning_bolt: { name: 'Lightning Bolt', type: SpellType.DAMAGE, description: 'Chain lightning between enemies', baseDamage: 15, baseManaCost: 25, baseCooldown: 4000, range: 300, chainCount: 3, color: '#a855f7', icon: '⚡' },
    backstab: { name: 'Backstab', type: SpellType.DAMAGE, description: 'Deal massive damage from behind', baseDamage: 50, baseManaCost: 20, baseCooldown: 10000, range: 100, requiresBehind: true, critMultiplier: 2.0, color: '#28a745', icon: '🗡️💨' },
    poison_dagger: { name: 'Poison Dagger', type: SpellType.DAMAGE, description: 'Apply poison that deals damage over time', baseDamage: 10, baseManaCost: 15, baseCooldown: 4000, range: 200, poisonDamage: 8, poisonDuration: 5000, poisonInterval: 1000, color: '#28a745', icon: '💉' },
    shadow_step: { name: 'Shadow Step', type: SpellType.BUFF, description: 'Become invisible and move quickly', baseManaCost: 25, baseCooldown: 15000, duration: 5000, invisibility: true, speedBoost: 2.0, color: '#28a745', icon: '👻💨' },
    holy_strike: { name: 'Holy Strike', type: SpellType.DAMAGE, description: 'Deal holy damage to an enemy', baseDamage: 35, baseManaCost: 20, baseCooldown: 6000, range: 100, color: '#ffc107', icon: '✝️⚔️' },
    heal: { name: 'Heal', type: SpellType.HEAL, description: 'Restore health', baseHeal: 40, baseManaCost: 25, baseCooldown: 8000, range: 0, color: '#ffc107', icon: '❤️' },
    divine_shield: { name: 'Divine Shield', type: SpellType.BUFF, description: 'Block all damage for a short time', baseManaCost: 30, baseCooldown: 12000, duration: 5000, damageReduction: 1.0, color: '#ffc107', icon: '🛡️✨' }
};

const SkillNodeType = {
    PASSIVE: 'passive',
    ACTIVE: 'active',
    UPGRADE: 'upgrade'
};

const SkillTreeDefinitions = {
    archer_tree: {
        name: 'Archer Skill Tree',
        root: 'precision',
        nodes: {
            precision: { name: 'Precision', type: SkillNodeType.PASSIVE, description: 'Increase attack accuracy', maxLevel: 5, effect: { accuracy: 5 }, requirements: [], children: ['quick_draw', 'eagle_eye'], position: { x: 0, y: 0 } },
            quick_draw: { name: 'Quick Draw', type: SkillNodeType.PASSIVE, description: 'Increase attack speed', maxLevel: 5, effect: { attackSpeed: 0.1 }, requirements: [{ skill: 'precision', level: 1 }], children: ['rapid_fire'], position: { x: -100, y: 100 } },
            eagle_eye: { name: 'Eagle Eye', type: SkillNodeType.PASSIVE, description: 'Increase critical hit chance', maxLevel: 5, effect: { critChance: 2 }, requirements: [{ skill: 'precision', level: 1 }], children: ['headshot'], position: { x: 100, y: 100 } },
            rapid_fire: { name: 'Rapid Fire', type: SkillNodeType.ACTIVE, description: 'Fire multiple arrows quickly', maxLevel: 3, effect: { arrows: 3, cooldown: 10000 }, requirements: [{ skill: 'quick_draw', level: 3 }], children: [], position: { x: -100, y: 200 } },
            headshot: { name: 'Headshot', type: SkillNodeType.PASSIVE, description: 'Critical hits deal more damage', maxLevel: 3, effect: { critMultiplier: 0.5 }, requirements: [{ skill: 'eagle_eye', level: 3 }], children: [], position: { x: 100, y: 200 } }
        }
    },
    warrior_tree: {
        name: 'Warrior Skill Tree',
        root: 'strength',
        nodes: {
            strength: { name: 'Strength', type: SkillNodeType.PASSIVE, description: 'Increase attack damage', maxLevel: 5, effect: { attack: 2 }, requirements: [], children: ['toughness', 'berserker'], position: { x: 0, y: 0 } },
            toughness: { name: 'Toughness', type: SkillNodeType.PASSIVE, description: 'Increase defense', maxLevel: 5, effect: { defense: 2 }, requirements: [{ skill: 'strength', level: 1 }], children: ['iron_skin'], position: { x: -100, y: 100 } },
            berserker: { name: 'Berserker', type: SkillNodeType.PASSIVE, description: 'Gain attack when health is low', maxLevel: 5, effect: { lowHealthAttackBoost: 0.1 }, requirements: [{ skill: 'strength', level: 1 }], children: ['frenzy'], position: { x: 100, y: 100 } },
            iron_skin: { name: 'Iron Skin', type: SkillNodeType.ACTIVE, description: 'Reduce all damage for a short time', maxLevel: 3, effect: { damageReduction: 0.5, duration: 5000, cooldown: 15000 }, requirements: [{ skill: 'toughness', level: 3 }], children: [], position: { x: -100, y: 200 } },
            frenzy: { name: 'Frenzy', type: SkillNodeType.ACTIVE, description: 'Increase attack speed and damage', maxLevel: 3, effect: { attackSpeed: 0.5, attack: 5, duration: 8000, cooldown: 20000 }, requirements: [{ skill: 'berserker', level: 3 }], children: [], position: { x: 100, y: 200 } }
        }
    },
    mage_tree: {
        name: 'Mage Skill Tree',
        root: 'arcane_knowledge',
        nodes: {
            arcane_knowledge: { name: 'Arcane Knowledge', type: SkillNodeType.PASSIVE, description: 'Increase spell damage', maxLevel: 5, effect: { spellDamage: 0.05 }, requirements: [], children: ['mana_flow', 'elemental_mastery'], position: { x: 0, y: 0 } },
            mana_flow: { name: 'Mana Flow', type: SkillNodeType.PASSIVE, description: 'Increase mana regeneration', maxLevel: 5, effect: { manaRegen: 0.5 }, requirements: [{ skill: 'arcane_knowledge', level: 1 }], children: ['mana_shield'], position: { x: -100, y: 100 } },
            elemental_mastery: { name: 'Elemental Mastery', type: SkillNodeType.PASSIVE, description: 'Increase elemental damage', maxLevel: 5, effect: { elementalDamage: 0.1 }, requirements: [{ skill: 'arcane_knowledge', level: 1 }], children: ['elemental_surge'], position: { x: 100, y: 100 } },
            mana_shield: { name: 'Mana Shield', type: SkillNodeType.ACTIVE, description: 'Create a shield from mana', maxLevel: 3, effect: { shieldAmount: 50, manaCost: 30, duration: 10000, cooldown: 15000 }, requirements: [{ skill: 'mana_flow', level: 3 }], children: [], position: { x: -100, y: 200 } },
            elemental_surge: { name: 'Elemental Surge', type: SkillNodeType.ACTIVE, description: 'Empower next spell', maxLevel: 3, effect: { damageMultiplier: 2.0, cooldown: 20000 }, requirements: [{ skill: 'elemental_mastery', level: 3 }], children: [], position: { x: 100, y: 200 } }
        }
    },
    rogue_tree: {
        name: 'Rogue Skill Tree',
        root: 'stealth',
        nodes: {
            stealth: { name: 'Stealth', type: SkillNodeType.PASSIVE, description: 'Increase evasion chance', maxLevel: 5, effect: { evasion: 2 }, requirements: [], children: ['shadow_walk', 'deadly_strike'], position: { x: 0, y: 0 } },
            shadow_walk: { name: 'Shadow Walk', type: SkillNodeType.PASSIVE, description: 'Increase movement speed', maxLevel: 5, effect: { speed: 0.05 }, requirements: [{ skill: 'stealth', level: 1 }], children: ['phantom'], position: { x: -100, y: 100 } },
            deadly_strike: { name: 'Deadly Strike', type: SkillNodeType.PASSIVE, description: 'Increase critical hit damage', maxLevel: 5, effect: { critDamage: 0.1 }, requirements: [{ skill: 'stealth', level: 1 }], children: ['assassinate'], position: { x: 100, y: 100 } },
            phantom: { name: 'Phantom', type: SkillNodeType.ACTIVE, description: 'Become invisible and untargetable', maxLevel: 3, effect: { duration: 3000, cooldown: 15000 }, requirements: [{ skill: 'shadow_walk', level: 3 }], children: [], position: { x: -100, y: 200 } },
            assassinate: { name: 'Assassinate', type: SkillNodeType.ACTIVE, description: 'Instantly kill low health enemies', maxLevel: 3, effect: { maxHealthPercent: 20, cooldown: 20000 }, requirements: [{ skill: 'deadly_strike', level: 3 }], children: [], position: { x: 100, y: 200 } }
        }
    },
    paladin_tree: {
        name: 'Paladin Skill Tree',
        root: 'holy_light',
        nodes: {
            holy_light: { name: 'Holy Light', type: SkillNodeType.PASSIVE, description: 'Increase healing power', maxLevel: 5, effect: { healingPower: 0.05 }, requirements: [], children: ['divine_favor', 'holy_resistance'], position: { x: 0, y: 0 } },
            divine_favor: { name: 'Divine Favor', type: SkillNodeType.PASSIVE, description: 'Increase holy damage', maxLevel: 5, effect: { holyDamage: 0.1 }, requirements: [{ skill: 'holy_light', level: 1 }], children: ['holy_wrath'], position: { x: -100, y: 100 } },
            holy_resistance: { name: 'Holy Resistance', type: SkillNodeType.PASSIVE, description: 'Reduce damage from unholy sources', maxLevel: 5, effect: { unholyResistance: 0.05 }, requirements: [{ skill: 'holy_light', level: 1 }], children: ['divine_protection'], position: { x: 100, y: 100 } },
            holy_wrath: { name: 'Holy Wrath', type: SkillNodeType.ACTIVE, description: 'Deal holy damage to all enemies', maxLevel: 3, effect: { damage: 40, cooldown: 12000 }, requirements: [{ skill: 'divine_favor', level: 3 }], children: [], position: { x: -100, y: 200 } },
            divine_protection: { name: 'Divine Protection', type: SkillNodeType.ACTIVE, description: 'Protect all allies from damage', maxLevel: 3, effect: { duration: 5000, cooldown: 20000 }, requirements: [{ skill: 'holy_resistance', level: 3 }], children: [], position: { x: 100, y: 200 } }
        }
    }
};

const DungeonDefinitions = {
    forest: { name: 'Forest Dungeon', description: 'A dark and mysterious forest', waves: 10, monsters: [{ type: 'goblin', weight: 60 }, { type: 'goblin_archer', weight: 30 }, { type: 'skeleton', weight: 10 }], boss: 'goblin_king', reward: { gold: 200, xp: 300, loot: ['wooden_bow', 'leather_armor'] }, difficulty: 1, color: '#28a745', background: 'forest' },
    crypt: { name: 'Ancient Crypt', description: 'A haunted tomb filled with undead', waves: 12, monsters: [{ type: 'skeleton', weight: 50 }, { type: 'skeleton_mage', weight: 30 }, { type: 'goblin', weight: 20 }], boss: 'skeleton_lord', reward: { gold: 250, xp: 350, loot: ['bone_staff', 'chainmail'] }, difficulty: 2, color: '#6f42c1', background: 'crypt' },
    fortress: { name: 'Orc Fortress', description: 'A heavily guarded orc stronghold', waves: 15, monsters: [{ type: 'orc', weight: 40 }, { type: 'orc_berzerker', weight: 30 }, { type: 'goblin_archer', weight: 20 }, { type: 'skeleton', weight: 10 }], boss: 'orc_warlord', reward: { gold: 300, xp: 400, loot: ['steel_sword', 'plate_armor'] }, difficulty: 3, color: '#dc3545', background: 'fortress' },
    abyss: { name: 'Abyssal Depths', description: 'A dark dimension filled with horrors', waves: 20, monsters: [{ type: 'skeleton_mage', weight: 40 }, { type: 'orc_berzerker', weight: 30 }, { type: 'goblin_archer', weight: 20 }, { type: 'skeleton', weight: 10 }], boss: 'abyssal_lord', reward: { gold: 500, xp: 600, loot: ['abyssal_staff', 'dragon_armor'] }, difficulty: 4, color: '#000', background: 'abyss' }
};

MonsterDefinitions.abyssal_lord = { name: 'Abyssal Lord', type: MonsterType.BOSS, baseHealth: 400, baseAttack: 40, baseDefense: 20, baseGold: 200, baseXP: 200, speed: 0.5, color: '#800080', icon: '👹', abilities: ['dark_blast', 'summon_minions', 'fear'] };

const LootDefinitions = {
    wooden_bow: { name: 'Wooden Bow', type: 'weapon', class: CharacterClass.ARCHER, stats: { attack: 5 }, rarity: 'common', color: '#8B4513', icon: '🏹' },
    leather_armor: { name: 'Leather Armor', type: 'armor', class: null, stats: { defense: 3 }, rarity: 'common', color: '#8B4513', icon: '👕' },
    bone_staff: { name: 'Bone Staff', type: 'weapon', class: CharacterClass.MAGE, stats: { attack: 8, mana: 10 }, rarity: 'uncommon', color: '#FFF', icon: '💀🪄' },
    chainmail: { name: 'Chainmail', type: 'armor', class: null, stats: { defense: 5 }, rarity: 'uncommon', color: '#C0C0C0', icon: '🧥' },
    steel_sword: { name: 'Steel Sword', type: 'weapon', class: CharacterClass.WARRIOR, stats: { attack: 10 }, rarity: 'rare', color: '#C0C0C0', icon: '⚔️' },
    plate_armor: { name: 'Plate Armor', type: 'armor', class: null, stats: { defense: 8 }, rarity: 'rare', color: '#C0C0C0', icon: '🛡️' },
    abyssal_staff: { name: 'Abyssal Staff', type: 'weapon', class: CharacterClass.MAGE, stats: { attack: 15, mana: 20 }, rarity: 'legendary', color: '#800080', icon: '💜🪄' },
    dragon_armor: { name: 'Dragon Armor', type: 'armor', class: null, stats: { defense: 15, health: 50 }, rarity: 'legendary', color: '#FF4500', icon: '🐉🛡️' }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConfig, CharacterClass, ClassDefinitions, MonsterType, MonsterDefinitions, SpellType, SpellDefinitions, SkillNodeType, SkillTreeDefinitions, DungeonDefinitions, LootDefinitions };
}
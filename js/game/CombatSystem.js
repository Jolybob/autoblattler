// ============================================
// COMBATSYSTEM.JS - Combat System
// ============================================

/**
 * Combat system for managing battles between characters and monsters
 * Handles damage calculation, hit detection, and combat resolution
 */

class CombatSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeBattles = [];
        this.combatLog = [];
        this.maxLogEntries = 50;
        this.currentWave = 0;
        this.monsters = [];
        this.isInCombat = false;
        this.waveNumber = 0;
    }

    init() {
    }

    startBattle(character, monsters) {
        const battle = {
            id: this.generateId(),
            character: character,
            monsters: monsters.map(m => ({ ...m })),
            startTime: Date.now(),
            isActive: true,
            winner: null,
            log: []
        };
        this.activeBattles.push(battle);
        this.log(`Battle started: ${character.name} vs ${monsters.length} monsters`);
        return battle;
    }

    generateId() {
        return 'battle_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    update(deltaTime) {
        const now = Date.now();
        for (let i = this.activeBattles.length - 1; i >= 0; i--) {
            const battle = this.activeBattles[i];
            if (!battle.isActive) continue;
            if (this.isBattleOver(battle)) {
                this.endBattle(battle);
                continue;
            }
            this.updateCharacterAttacks(battle, now);
            this.updateMonsterAttacks(battle, now);
            this.updateCooldowns(battle, now);
        }
    }

    isBattleOver(battle) {
        if (!battle.character.isAlive) return true;
        if (battle.monsters.every(m => !m.isAlive)) return true;
        return false;
    }

    endBattle(battle) {
        battle.isActive = false;
        battle.endTime = Date.now();
        if (battle.character.isAlive) {
            battle.winner = 'character';
            this.log(`Battle won by ${battle.character.name}!`);
            const reward = this.calculateBattleReward(battle);
            battle.reward = reward;
            battle.character.addGold(reward.gold);
            battle.character.addExperience(reward.xp);
            battle.character.kills += reward.kills;
            battle.character.wavesSurvived++;
        } else {
            battle.winner = 'monsters';
            this.log(`Battle lost! ${battle.character.name} was defeated.`);
        }
        this.activeBattles.splice(this.activeBattles.indexOf(battle), 1);
    }

    calculateBattleReward(battle) {
        let gold = 0, xp = 0, kills = 0;
        for (const monster of battle.monsters) {
            if (!monster.isAlive) {
                gold += monster.stats.gold || 0;
                xp += monster.stats.xp || 0;
                kills++;
            }
        }
        return { gold, xp, kills };
    }

    updateCharacterAttacks(battle, now) {
        const character = battle.character;
        if (now >= character.attackCooldown && character.isAlive) {
            const target = this.findClosestTarget(character, battle.monsters);
            if (target && target.isAlive) {
                const damage = character.attack(target);
                if (damage > 0) {
                    target.takeDamage(damage);
                    this.log(`${character.name} attacks ${target.type} for ${damage} damage`);
                }
            }
        }
    }

    updateMonsterAttacks(battle, now) {
        for (const monster of battle.monsters) {
            if (!monster.isAlive || monster.isStunned || monster.isFrozen) continue;
            if (now >= monster.attackCooldown) {
                const target = battle.character;
                if (target.isAlive) {
                    const damage = this.calculateMonsterDamage(monster);
                    target.takeDamage(damage);
                    this.log(`${monster.type} attacks ${target.name} for ${damage} damage`);
                    monster.attackCooldown = now + (1000 / (monster.stats.speed || 1));
                }
            }
        }
    }

    calculateMonsterDamage(monster) {
        let damage = monster.stats.attack || 0;
        if (monster.isBoss) {
            damage *= GameConfig.dungeons.bossDamageMultiplier || 2;
        }
        if (battle.character) {
            const defense = battle.character.stats.defense || 0;
            damage = Math.max(1, damage - Math.floor(defense * 0.5));
        }
        return Math.floor(damage);
    }

    updateCooldowns(battle, now) {
        const character = battle.character;
        for (const spellId in character.spellCooldowns) {
            if (now >= character.spellCooldowns[spellId]) {
                delete character.spellCooldowns[spellId];
            }
        }
        for (const monster of battle.monsters) {
            for (const abilityId in monster.abilityCooldowns) {
                if (now >= monster.abilityCooldowns[abilityId]) {
                    delete monster.abilityCooldowns[abilityId];
                }
            }
        }
    }

    findClosestTarget(source, targets) {
        let closest = null;
        let closestDistance = Infinity;
        for (const target of targets) {
            if (!target.isAlive) continue;
            const distance = this.calculateDistance(source, target);
            if (distance < closestDistance) {
                closest = target;
                closestDistance = distance;
            }
        }
        return closest;
    }

    calculateDistance(a, b) {
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    castSpell(battle, spellId, targets) {
        const character = battle.character;
        const spell = new Spell(spellId, character);
        if (!spell.canCast(targets)) {
            this.log(`Cannot cast ${spell.definition.name}: not enough mana or on cooldown`);
            return false;
        }
        const success = spell.cast(targets);
        if (success) {
            this.log(`${character.name} casts ${spell.definition.name}!`);
            character.spellCooldowns[spellId] = spell.cooldownEnd;
        }
        return success;
    }

    log(message) {
        this.combatLog.unshift({ time: Date.now(), message: message });
        if (this.combatLog.length > this.maxLogEntries) {
            this.combatLog.pop();
        }
    }

    getCombatLog() {
        return [...this.combatLog];
    }

    getActiveBattles() {
        return [...this.activeBattles];
    }

    getBattle(battleId) {
        return this.activeBattles.find(b => b.id === battleId);
    }

    clearAllBattles() {
        this.activeBattles = [];
        this.combatLog = [];
    }

    // WAVE-BASED COMBAT METHODS
    startWave(waveNumber) {
        this.waveNumber = waveNumber;
        this.currentWave = waveNumber;
        this.isInCombat = true;
        this.monsters = this.generateWaveMonsters(waveNumber);
        console.log(`Wave ${waveNumber} started with ${this.monsters.length} monsters`);
        this.log(`Wave ${waveNumber} started!`);
        if (this.gameEngine && this.gameEngine.character) {
            this.startBattle(this.gameEngine.character, this.monsters);
        }
    }

    generateWaveMonsters(waveNumber) {
        const monsters = [];
        const count = GameConfig.combat.enemiesPerWave || 5;
        for (let i = 0; i < count; i++) {
            const monsterType = this.getRandomMonsterType(waveNumber);
            const monster = new Monster(monsterType, waveNumber);
            monsters.push(monster);
        }
        return monsters;
    }

    getRandomMonsterType(waveNumber) {
        const monsterTypes = Object.keys(MonsterDefinitions);
        const tier = Math.min(Math.floor(waveNumber / 5), monsterTypes.length - 1);
        return monsterTypes[tier] || monsterTypes[0];
    }

    getCurrentMonsters() {
        return [...this.monsters];
    }

    endWave() {
        this.isInCombat = false;
        this.monsters = [];
        this.clearAllBattles();
        console.log('Wave ended');
        this.log('Wave completed!');
    }

    startDungeon(dungeonId) {
        this.waveNumber = 0;
        this.currentWave = 0;
        this.isInCombat = false;
        this.monsters = [];
        this.clearAllBattles();
        console.log(`Dungeon ${dungeonId} started`);
        this.log(`Dungeon ${dungeonId} started!`);
    }

    endDungeon() {
        this.isInCombat = false;
        this.monsters = [];
        this.waveNumber = 0;
        this.currentWave = 0;
        this.clearAllBattles();
        console.log('Dungeon ended');
        this.log('Dungeon completed!');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CombatSystem };
}

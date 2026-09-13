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
    }

    /**
     * Initialize combat system
     */
    init() {
        // Set up event listeners if needed
    }

    /**
     * Start a new battle
     */
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

    /**
     * Generate unique ID
     */
    generateId() {
        return 'battle_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    /**
     * Update combat for all active battles
     */
    update() {
        const now = Date.now();
        
        for (let i = this.activeBattles.length - 1; i >= 0; i--) {
            const battle = this.activeBattles[i];
            
            if (!battle.isActive) continue;
            
            // Check if battle is over
            if (this.isBattleOver(battle)) {
                this.endBattle(battle);
                continue;
            }
            
            // Update character attacks
            this.updateCharacterAttacks(battle, now);
            
            // Update monster attacks
            this.updateMonsterAttacks(battle, now);
            
            // Update spell cooldowns
            this.updateCooldowns(battle, now);
        }
    }

    /**
     * Check if battle is over
     */
    isBattleOver(battle) {
        // Character dead
        if (!battle.character.isAlive) return true;
        
        // All monsters dead
        if (battle.monsters.every(m => !m.isAlive)) return true;
        
        return false;
    }

    /**
     * End a battle
     */
    endBattle(battle) {
        battle.isActive = false;
        battle.endTime = Date.now();
        
        if (battle.character.isAlive) {
            battle.winner = 'character';
            this.log(`Battle won by ${battle.character.name}!`);
            
            // Calculate rewards
            const reward = this.calculateBattleReward(battle);
            battle.reward = reward;
            
            // Award to character
            battle.character.addGold(reward.gold);
            battle.character.addExperience(reward.xp);
            battle.character.kills += reward.kills;
            battle.character.wavesSurvived++;
        } else {
            battle.winner = 'monsters';
            this.log(`Battle lost! ${battle.character.name} was defeated.`);
        }
        
        // Clean up
        this.activeBattles.splice(this.activeBattles.indexOf(battle), 1);
    }

    /**
     * Calculate battle reward
     */
    calculateBattleReward(battle) {
        let gold = 0;
        let xp = 0;
        let kills = 0;
        
        for (const monster of battle.monsters) {
            if (!monster.isAlive) {
                gold += monster.stats.gold || 0;
                xp += monster.stats.xp || 0;
                kills++;
            }
        }
        
        return { gold, xp, kills };
    }

    /**
     * Update character attacks
     */
    updateCharacterAttacks(battle, now) {
        const character = battle.character;
        
        // Check auto-attack
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

    /**
     * Update monster attacks
     */
    updateMonsterAttacks(battle, now) {
        for (const monster of battle.monsters) {
            if (!monster.isAlive) continue;
            if (monster.isStunned || monster.isFrozen) continue;
            
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

    /**
     * Calculate monster damage
     */
    calculateMonsterDamage(monster) {
        let damage = monster.stats.attack || 0;
        
        // Apply boss multiplier if applicable
        if (monster.isBoss) {
            damage *= GameConfig.dungeons.bossDamageMultiplier || 2;
        }
        
        // Apply defense reduction
        if (battle.character) {
            const defense = battle.character.stats.defense || 0;
            damage = Math.max(1, damage - Math.floor(defense * 0.5));
        }
        
        return Math.floor(damage);
    }

    /**
     * Update cooldowns
     */
    updateCooldowns(battle, now) {
        const character = battle.character;
        
        // Update spell cooldowns
        for (const spellId in character.spellCooldowns) {
            if (now >= character.spellCooldowns[spellId]) {
                delete character.spellCooldowns[spellId];
            }
        }
        
        // Update monster ability cooldowns
        for (const monster of battle.monsters) {
            for (const abilityId in monster.abilityCooldowns) {
                if (now >= monster.abilityCooldowns[abilityId]) {
                    delete monster.abilityCooldowns[abilityId];
                }
            }
        }
    }

    /**
     * Find closest target for a character
     */
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

    /**
     * Calculate distance between two entities
     */
    calculateDistance(a, b) {
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Cast a spell in combat
     */
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

    /**
     * Add combat log entry
     */
    log(message) {
        this.combatLog.unshift({
            time: Date.now(),
            message: message
        });
        
        // Limit log size
        if (this.combatLog.length > this.maxLogEntries) {
            this.combatLog.pop();
        }
    }

    /**
     * Get combat log
     */
    getCombatLog() {
        return [...this.combatLog];
    }

    /**
     * Get active battles
     */
    getActiveBattles() {
        return [...this.activeBattles];
    }

    /**
     * Get battle by ID
     */
    getBattle(battleId) {
        return this.activeBattles.find(b => b.id === battleId);
    }

    /**
     * Clear all battles
     */
    clearAllBattles() {
        this.activeBattles = [];
        this.combatLog = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CombatSystem };
}

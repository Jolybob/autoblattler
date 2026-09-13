// ============================================
// SPELL.JS - Spell System
// ============================================

/**
 * Spell system for character abilities
 * Manages spell casting, cooldowns, and effects
 */

class Spell {
    constructor(spellId, caster) {
        this.id = spellId;
        this.definition = SpellDefinitions[spellId];
        if (!this.definition) {
            console.error(`Unknown spell: ${spellId}`);
            this.definition = SpellDefinitions.fireball;
        }
        this.caster = caster;
        this.level = 1;
        this.cooldownEnd = 0;
        this.isCasting = false;
        this.castStartTime = 0;
    }

    /**
     * Check if spell can be cast
     */
    canCast(targets) {
        if (!this.caster || !this.caster.isAlive) return false;
        if (this.isCasting) return false;
        
        const now = Date.now();
        if (now < this.cooldownEnd) return false;
        
        const manaCost = this.getManaCost();
        if (this.caster.stats.mana < manaCost) return false;
        
        // Check target requirements
        if (this.definition.requiresBehind && (!targets || !this.isBehindTarget(targets))) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if caster is behind target
     */
    isBehindTarget(target) {
        if (!target || !this.caster) return false;
        // Simplified: check if caster is to the left of target (assuming left-to-right movement)
        return this.caster.position.x < target.position.x;
    }

    /**
     * Cast the spell
     */
    cast(targets) {
        if (!this.canCast(targets)) return false;
        
        const manaCost = this.getManaCost();
        this.caster.stats.mana -= manaCost;
        
        this.isCasting = true;
        this.castStartTime = Date.now();
        
        // Calculate cooldown
        const cooldown = this.getCooldown();
        this.cooldownEnd = now + cooldown;
        
        // Execute spell effect
        this.execute(targets);
        
        // End casting after animation time
        const castTime = this.definition.castTime || 500;
        setTimeout(() => {
            this.isCasting = false;
        }, castTime);
        
        return true;
    }

    /**
     * Execute spell effect
     */
    execute(targets) {
        if (!this.definition) return;
        
        const effect = this.definition;
        const caster = this.caster;
        
        switch (effect.type) {
            case SpellType.DAMAGE:
                this.executeDamageEffect(targets);
                break;
            case SpellType.HEAL:
                this.executeHealEffect(targets);
                break;
            case SpellType.AOE:
                this.executeAOEEffect(targets);
                break;
            case SpellType.BUFF:
                this.executeBuffEffect(targets);
                break;
            case SpellType.DEBUFF:
                this.executeDebuffEffect(targets);
                break;
        }
    }

    /**
     * Execute damage effect
     */
    executeDamageEffect(targets) {
        const effect = this.definition;
        const caster = this.caster;
        
        const damage = this.calculateDamage();
        
        if (Array.isArray(targets)) {
            // Handle multiple targets
            const targetsToHit = effect.targets ? targets.slice(0, effect.targets) : targets;
            
            if (effect.pierce) {
                // Pierce through all targets
                targetsToHit.forEach(target => {
                    if (target && target.isAlive) {
                        target.takeDamage(damage);
                        this.applySpecialEffects(target);
                    }
                });
            } else {
                // Hit each target individually
                targetsToHit.forEach(target => {
                    if (target && target.isAlive) {
                        target.takeDamage(damage);
                        this.applySpecialEffects(target);
                    }
                });
            }
        } else if (targets) {
            // Single target
            targets.takeDamage(damage);
            this.applySpecialEffects(targets);
        }
    }

    /**
     * Execute heal effect
     */
    executeHealEffect(targets) {
        const effect = this.definition;
        const healAmount = this.calculateHeal();
        
        if (targets === this.caster || !targets) {
            // Heal self
            this.caster.heal(healAmount);
        } else if (Array.isArray(targets)) {
            targets.forEach(target => {
                if (target && target.isAlive) {
                    target.heal(healAmount);
                }
            });
        } else if (targets) {
            targets.heal(healAmount);
        }
    }

    /**
     * Execute AOE effect
     */
    executeAOEEffect(targets) {
        const effect = this.definition;
        const damage = this.calculateDamage();
        
        if (Array.isArray(targets)) {
            targets.forEach(target => {
                if (target && target.isAlive) {
                    // Check if target is in range
                    if (this.isInRange(target)) {
                        target.takeDamage(damage);
                        this.applySpecialEffects(target);
                    }
                }
            });
        }
    }

    /**
     * Execute buff effect
     */
    executeBuffEffect(targets) {
        const effect = this.definition;
        const target = targets || this.caster;
        
        if (target && target.isAlive) {
            // Apply buff based on effect properties
            if (effect.invisibility) {
                target.isInvisible = true;
                setTimeout(() => {
                    target.isInvisible = false;
                }, effect.duration || 5000);
            }
            
            if (effect.damageReduction) {
                target.damageReductionBuff = effect.damageReduction;
                setTimeout(() => {
                    target.damageReductionBuff = 0;
                }, effect.duration || 5000);
            }
            
            if (effect.speedBoost) {
                target.speedBoost = effect.speedBoost;
                setTimeout(() => {
                    target.speedBoost = 0;
                }, effect.duration || 5000);
            }
            
            if (effect.attackSpeed) {
                target.attackSpeedBuff = effect.attackSpeed;
                setTimeout(() => {
                    target.attackSpeedBuff = 0;
                }, effect.duration || 5000);
            }
            
            if (effect.shieldAmount) {
                target.shield = effect.shieldAmount;
                setTimeout(() => {
                    target.shield = 0;
                }, effect.duration || 5000);
            }
        }
    }

    /**
     * Execute debuff effect
     */
    executeDebuffEffect(targets) {
        if (!Array.isArray(targets)) {
            targets = [targets];
        }
        
        targets.forEach(target => {
            if (target && target.isAlive) {
                const effect = this.definition;
                
                if (effect.stunDuration) {
                    target.isStunned = true;
                    target.stunEnd = Date.now() + effect.stunDuration;
                    setTimeout(() => { target.isStunned = false; }, effect.stunDuration);
                }
                
                if (effect.freezeDuration) {
                    target.isFrozen = true;
                    target.freezeEnd = Date.now() + effect.freezeDuration;
                    setTimeout(() => { target.isFrozen = false; }, effect.freezeDuration);
                }
                
                if (effect.burnDamage) {
                    target.isBurning = true;
                    target.burnDamage = effect.burnDamage;
                    target.burnEnd = Date.now() + (effect.burnDuration || 3000);
                    
                    const burnInterval = setInterval(() => {
                        if (target.isAlive && target.isBurning) {
                            target.takeDamage(target.burnDamage);
                        } else {
                            clearInterval(burnInterval);
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        target.isBurning = false;
                        clearInterval(burnInterval);
                    }, effect.burnDuration || 3000);
                }
                
                if (effect.poisonDamage) {
                    target.isPoisoned = true;
                    target.poisonDamage = effect.poisonDamage;
                    target.poisonEnd = Date.now() + (effect.poisonDuration || 5000);
                    
                    const poisonInterval = setInterval(() => {
                        if (target.isAlive && target.isPoisoned) {
                            target.takeDamage(target.poisonDamage);
                        } else {
                            clearInterval(poisonInterval);
                        }
                    }, effect.poisonInterval || 1000);
                    
                    setTimeout(() => {
                        target.isPoisoned = false;
                        clearInterval(poisonInterval);
                    }, effect.poisonDuration || 5000);
                }
            }
        });
    }

    /**
     * Calculate damage
     */
    calculateDamage() {
        const effect = this.definition;
        let damage = effect.baseDamage || 0;
        damage *= GameConfig.spells.damageMultiplier || 1;
        damage *= this.level;
        
        // Apply class-based damage modifiers
        if (this.caster && this.caster.classDef) {
            // Archers get bonus damage
            if (this.caster.classType === CharacterClass.ARCHER) {
                damage *= 1.1;
            }
            // Mages get bonus spell damage
            if (this.caster.classType === CharacterClass.MAGE) {
                damage *= 1.2;
            }
        }
        
        // Apply skill tree modifiers
        if (this.caster && this.caster.skillTree) {
            const skillBonus = this.caster.getSkillBonus('spellDamage') || 0;
            damage *= (1 + skillBonus);
        }
        
        return Math.floor(damage);
    }

    /**
     * Calculate heal amount
     */
    calculateHeal() {
        const effect = this.definition;
        let heal = effect.baseHeal || 0;
        
        // Apply healing power from skills
        if (this.caster && this.caster.skillTree) {
            const healingPower = this.caster.getSkillBonus('healingPower') || 0;
            heal *= (1 + healingPower * 10);
        }
        
        return Math.floor(heal);
    }

    /**
     * Get mana cost
     */
    getManaCost() {
        const baseCost = this.definition.baseManaCost || 0;
        return Math.floor(baseCost * (GameConfig.spells.manaCostMultiplier || 1));
    }

    /**
     * Get cooldown
     */
    getCooldown() {
        const baseCooldown = this.definition.baseCooldown || 0;
        return baseCooldown * (GameConfig.spells.cooldownReduction || 1);
    }

    /**
     * Get remaining cooldown time
     */
    getRemainingCooldown() {
        const now = Date.now();
        return Math.max(0, this.cooldownEnd - now);
    }

    /**
     * Check if target is in range
     */
    isInRange(target) {
        if (!target || !this.caster) return false;
        const range = this.definition.range || 100;
        const dx = target.position.x - this.caster.position.x;
        const dy = target.position.y - this.caster.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= range;
    }

    /**
     * Apply special effects (burn, freeze, etc.)
     */
    applySpecialEffects(target) {
        const effect = this.definition;
        
        if (effect.burnDamage) {
            target.isBurning = true;
            target.burnDamage = effect.burnDamage;
            target.burnEnd = Date.now() + (effect.burnDuration || 3000);
        }
        
        if (effect.freezeDuration) {
            target.isFrozen = true;
            target.freezeEnd = Date.now() + effect.freezeDuration;
        }
        
        if (effect.stunDuration) {
            target.isStunned = true;
            target.stunEnd = Date.now() + effect.stunDuration;
        }
    }

    /**
     * Get spell info
     */
    getInfo() {
        return {
            id: this.id,
            name: this.definition.name,
            description: this.definition.description,
            type: this.definition.type,
            icon: this.definition.icon,
            color: this.definition.color,
            level: this.level,
            manaCost: this.getManaCost(),
            cooldown: this.getCooldown(),
            remainingCooldown: this.getRemainingCooldown(),
            range: this.definition.range,
            isCasting: this.isCasting,
            canCast: this.canCast()
        };
    }
}

class SpellManager {
    constructor() {
        this.spells = SpellDefinitions;
    }

    /**
     * Get spell by ID
     */
    getSpell(spellId) {
        return this.spells[spellId];
    }

    /**
     * Get all spells
     */
    getAllSpells() {
        return Object.keys(this.spells).map(spellId => ({
            id: spellId,
            ...this.spells[spellId]
        }));
    }

    /**
     * Get spells by type
     */
    getSpellsByType(type) {
        return Object.keys(this.spells)
            .filter(spellId => this.spells[spellId].type === type)
            .map(spellId => this.spells[spellId]);
    }

    /**
     * Create a spell instance
     */
    createSpell(spellId, caster) {
        return new Spell(spellId, caster);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Spell, SpellManager };
}

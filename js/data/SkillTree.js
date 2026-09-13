// ============================================
// SKILLTREE.JS - Skill Tree System
// ============================================

/**
 * Skill tree system for character progression
 * Manages skill nodes, unlocking, and effects
 */

class SkillNode {
    constructor(nodeId, treeDefinition, skillTree) {
        this.id = nodeId;
        this.definition = treeDefinition.nodes[nodeId];
        this.tree = skillTree;
        this.level = 0;
        this.unlocked = false;
        this.maxLevel = this.definition.maxLevel || 5;
    }

    /**
     * Check if this node can be unlocked
     */
    canUnlock() {
        if (this.unlocked) return false;
        if (this.level >= this.maxLevel) return false;
        
        // Check requirements
        for (const req of this.definition.requirements || []) {
            const requiredNode = this.tree.nodes[req.skill];
            if (!requiredNode || !requiredNode.unlocked) return false;
            if (requiredNode.level < (req.level || 1)) return false;
        }
        
        return true;
    }

    /**
     * Unlock this node
     */
    unlock() {
        if (!this.canUnlock()) return false;
        this.unlocked = true;
        this.level = 1;
        return true;
    }

    /**
     * Level up this node
     */
    levelUp() {
        if (!this.unlocked) return false;
        if (this.level >= this.maxLevel) return false;
        this.level++;
        return true;
    }

    /**
     * Get the effect of this node at current level
     */
    getEffect() {
        if (!this.unlocked || this.level <= 0) return {};
        
        const effect = {};
        for (const [key, value] of Object.entries(this.definition.effect || {})) {
            effect[key] = value * this.level * (GameConfig.skills.skillEffectMultiplier || 1);
        }
        return effect;
    }

    /**
     * Get node info
     */
    getInfo() {
        return {
            id: this.id,
            name: this.definition.name,
            description: this.definition.description,
            type: this.definition.type,
            level: this.level,
            maxLevel: this.maxLevel,
            unlocked: this.unlocked,
            effect: this.getEffect(),
            position: this.definition.position || { x: 0, y: 0 },
            requirements: this.definition.requirements || []
        };
    }
}

class SkillTree {
    constructor(treeId, character) {
        this.id = treeId;
        this.definition = SkillTreeDefinitions[treeId];
        if (!this.definition) {
            console.error(`Unknown skill tree: ${treeId}`);
            this.definition = SkillTreeDefinitions.archer_tree;
        }
        this.character = character;
        this.nodes = {};
        this.rootNode = null;
        this.init();
    }

    init() {
        // Create all nodes
        for (const nodeId in this.definition.nodes) {
            this.nodes[nodeId] = new SkillNode(nodeId, this.definition, this);
        }
        
        // Set root node
        if (this.definition.root && this.nodes[this.definition.root]) {
            this.rootNode = this.nodes[this.definition.root];
            this.rootNode.unlocked = true;
            this.rootNode.level = 1;
        }
    }

    /**
     * Get node by ID
     */
    getNode(nodeId) {
        return this.nodes[nodeId];
    }

    /**
     * Unlock a node
     */
    unlockNode(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return false;
        return node.unlock();
    }

    /**
     * Level up a node
     */
    levelUpNode(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return false;
        return node.levelUp();
    }

    /**
     * Get all nodes
     */
    getAllNodes() {
        return Object.values(this.nodes);
    }

    /**
     * Get unlocked nodes
     */
    getUnlockedNodes() {
        return this.getAllNodes().filter(n => n.unlocked);
    }

    /**
     * Get available nodes (can be unlocked)
     */
    getAvailableNodes() {
        return this.getAllNodes().filter(n => n.canUnlock() && !n.unlocked);
    }

    /**
     * Get children of a node
     */
    getChildren(nodeId) {
        const node = this.getNode(nodeId);
        if (!node || !node.definition.children) return [];
        return node.definition.children
            .map(childId => this.getNode(childId))
            .filter(n => n);
    }

    /**
     * Get parents of a node
     */
    getParents(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return [];
        
        const parents = [];
        for (const otherNode of this.getAllNodes()) {
            if (otherNode.definition.children && otherNode.definition.children.includes(nodeId)) {
                parents.push(otherNode);
            }
        }
        return parents;
    }

    /**
     * Get tree info
     */
    getInfo() {
        return {
            id: this.id,
            name: this.definition.name,
            root: this.definition.root,
            totalNodes: this.getAllNodes().length,
            unlockedNodes: this.getUnlockedNodes().length,
            nodes: this.getAllNodes().map(n => n.getInfo())
        };
    }

    /**
     * Reset the tree
     */
    reset() {
        for (const node of this.getAllNodes()) {
            node.level = 0;
            node.unlocked = false;
        }
        if (this.rootNode) {
            this.rootNode.unlocked = true;
            this.rootNode.level = 1;
        }
    }

    /**
     * Get total skill points spent
     */
    getTotalPoints() {
        return this.getUnlockedNodes()
            .reduce((sum, node) => sum + node.level, 0);
    }
}

class SkillTreeManager {
    constructor() {
        this.trees = SkillTreeDefinitions;
    }

    /**
     * Get all skill trees
     */
    getAllTrees() {
        return Object.keys(this.trees).map(treeId => ({
            id: treeId,
            ...this.trees[treeId]
        }));
    }

    /**
     * Create a skill tree for a character
     */
    createTree(treeId, character) {
        return new SkillTree(treeId, character);
    }

    /**
     * Get tree definition by ID
     */
    getTreeDefinition(treeId) {
        return this.trees[treeId];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkillNode, SkillTree, SkillTreeManager };
}

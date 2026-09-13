// ============================================
// HELPERS.JS - Utility Functions and Helpers
// ============================================

/**
 * Utility functions used throughout the game
 */

// ============================================
// MATH UTILITIES
// ============================================

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Inverse linear interpolation
 */
function inverseLerp(start, end, value) {
    return (value - start) / (end - start);
}

/**
 * Remap a value from one range to another
 */
function remap(value, fromMin, fromMax, toMin, toMax) {
    const t = inverseLerp(fromMin, fromMax, value);
    return lerp(toMin, toMax, t);
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Random choice from array
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Weighted random choice
 */
function weightedRandom(weights) {
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * total;
    
    for (const item of weights) {
        random -= item.weight;
        if (random <= 0) {
            return item.value;
        }
    }
    
    return weights[0].value;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex[0] + hex[1], 16);
        g = parseInt(hex[2] + hex[3], 16);
        b = parseInt(hex[4] + hex[5], 16);
    } else {
        return { r: 0, g: 0, b: 0 };
    }
    return { r, g, b };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Lighten or darken a color
 */
function adjustColor(color, amount) {
    const { r, g, b } = hexToRgb(color);
    const newR = clamp(r + amount, 0, 255);
    const newG = clamp(g + amount, 0, 255);
    const newB = clamp(b + amount, 0, 255);
    return rgbToHex(newR, newG, newB);
}

/**
 * Add alpha to hex color
 */
function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format time in seconds to HH:MM:SS
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Format time in milliseconds to HH:MM:SS
 */
function formatTimeMs(milliseconds) {
    return formatTime(Math.floor(milliseconds / 1000));
}

/**
 * Truncate string to max length
 */
function truncateString(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Check if array contains all elements of another array
 */
function arrayContainsAll(arr, values) {
    return values.every(value => arr.includes(value));
}

/**
 * Get unique elements from array
 */
function uniqueArray(arr) {
    return [...new Set(arr)];
}

/**
 * Get intersection of two arrays
 */
function arrayIntersection(arr1, arr2) {
    return arr1.filter(value => arr2.includes(value));
}

/**
 * Get difference between two arrays
 */
function arrayDifference(arr1, arr2) {
    return arr1.filter(value => !arr2.includes(value));
}

/**
 * Get union of two arrays
 */
function arrayUnion(arr1, arr2) {
    return uniqueArray([...arr1, ...arr2]);
}

// ============================================
// OBJECT UTILITIES
// ============================================

/**
 * Deep clone object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] !== null && typeof source[key] === 'object' && 
                !Array.isArray(source[key])) {
                output[key] = deepMerge(output[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }
    return output;
}

/**
 * Check if object is empty
 */
function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return obj.length === 0;
    return Object.keys(obj).length === 0;
}

/**
 * Get object size (number of properties)
 */
function objectSize(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.keys(obj).length;
}

// ============================================
// GAME-SPECIFIC UTILITIES
// ============================================

/**
 * Calculate damage with armor reduction
 */
function calculateDamage(attack, defense) {
    return Math.max(1, attack - defense);
}

/**
 * Calculate critical hit
 */
function calculateCrit(damage, critMultiplier) {
    return Math.floor(damage * critMultiplier);
}

/**
 * Check if hit is critical
 */
function isCritical(critChance) {
    return Math.random() * 100 < critChance;
}

/**
 * Calculate evasion
 */
function checkEvasion(evasion, accuracy) {
    const hitChance = accuracy - evasion;
    return Math.random() * 100 < hitChance;
}

/**
 * Calculate XP required for next level
 */
function calculateXPForLevel(level, baseXP = 100, scaling = 1.5) {
    return Math.floor(baseXP * Math.pow(scaling, level - 1));
}

/**
 * Calculate total XP for multiple levels
 */
function calculateTotalXP(level, baseXP = 100, scaling = 1.5) {
    let total = 0;
    for (let i = 1; i <= level; i++) {
        total += calculateXPForLevel(i, baseXP, scaling);
    }
    return total;
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clamp,
        lerp,
        inverseLerp,
        remap,
        randomInt,
        randomFloat,
        randomChoice,
        weightedRandom,
        shuffleArray,
        hexToRgb,
        rgbToHex,
        adjustColor,
        hexToRgba,
        capitalizeFirst,
        formatNumber,
        formatTime,
        formatTimeMs,
        truncateString,
        generateId,
        arrayContainsAll,
        uniqueArray,
        arrayIntersection,
        arrayDifference,
        arrayUnion,
        deepClone,
        deepMerge,
        isEmpty,
        objectSize,
        calculateDamage,
        calculateCrit,
        isCritical,
        checkEvasion,
        calculateXPForLevel,
        calculateTotalXP
    };
}
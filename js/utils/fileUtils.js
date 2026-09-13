// ============================================
// FILEUTILS.JS - File Handling Utilities
// ============================================

/**
 * File utilities for export/import functionality
 * Uses JSON format for data persistence as requested
 */

// ============================================
// FILE DOWNLOAD
// ============================================

/**
 * Download data as a file
 */
function downloadFile(data, filename, mimeType = 'application/json') {
    const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
    downloadFile(data, filename, 'application/json');
}

function downloadText(text, filename) {
    downloadFile(text, filename, 'text/plain');
}

// ============================================
// FILE UPLOAD
// ============================================

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

async function readJSONFile(file) {
    const text = await readFileAsText(file);
    return JSON.parse(text);
}

// ============================================
// FILE SELECTION
// ============================================

function selectFile(accept = '*', multiple = false) {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.multiple = multiple;
        input.style.display = 'none';
        input.onchange = (event) => {
            if (input.files.length > 0) {
                resolve(multiple ? Array.from(input.files) : input.files[0]);
            } else {
                reject(new Error('No file selected'));
            }
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
        input.onerror = (error) => {
            document.body.removeChild(input);
            reject(error);
        };
    });
}

function selectJSONFile() {
    return selectFile('.json');
}

// ============================================
// FILE VALIDATION
// ============================================

async function isValidJSON(file) {
    try {
        await readJSONFile(file);
        return true;
    } catch (error) {
        return false;
    }
}

function validateFileSize(file, maxSize = 10 * 1024 * 1024) {
    return file.size <= maxSize;
}

function validateFileType(file, types) {
    if (Array.isArray(types)) {
        return types.some(type => file.type === type);
    }
    return file.type === types;
}

// ============================================
// FILE EXPORT FUNCTIONS
// ============================================

function exportGameState(state, filename = null) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFilename = `autoblattler_save_${timestamp}.json`;
    downloadJSON(state, filename || defaultFilename);
}

function exportConfig(config, filename = null) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFilename = `autoblattler_config_${timestamp}.json`;
    downloadJSON(config, filename || defaultFilename);
}

function exportCharacter(character, filename = null) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFilename = `autoblattler_character_${character.name || 'hero'}_${timestamp}.json`;
    downloadJSON(character.toJSON(), filename || defaultFilename);
}

// ============================================
// FILE IMPORT FUNCTIONS
// ============================================

async function importGameState() {
    try {
        const file = await selectJSONFile();
        return await readJSONFile(file);
    } catch (error) {
        console.error('Error importing game state:', error);
        throw error;
    }
}

async function importConfig() {
    try {
        const file = await selectJSONFile();
        return await readJSONFile(file);
    } catch (error) {
        console.error('Error importing configuration:', error);
        throw error;
    }
}

async function importCharacter() {
    try {
        const file = await selectJSONFile();
        return await readJSONFile(file);
    } catch (error) {
        console.error('Error importing character:', error);
        throw error;
    }
}

// ============================================
// FILE MANAGEMENT
// ============================================

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        downloadFile,
        downloadJSON,
        downloadText,
        readFileAsText,
        readJSONFile,
        selectFile,
        selectJSONFile,
        isValidJSON,
        validateFileSize,
        validateFileType,
        exportGameState,
        exportConfig,
        exportCharacter,
        importGameState,
        importConfig,
        importCharacter,
        saveToLocalStorage,
        loadFromLocalStorage,
        removeFromLocalStorage
    };
}
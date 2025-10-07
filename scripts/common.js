/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

// Common variables and functions used by multiple scripts

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const urqwDir = path.join(rootDir, 'urqw');
const manifestFile = path.join(urqwDir, 'manifest.json');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function readManifest(file) {
    try {
        const data = await fs.promises.readFile(file, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return {};
        }
        throw err;
    }
}

module.exports = {
    rootDir,
    urqwDir,
    manifestFile,
    rl,
    readManifest
};

/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '..');

const urqwDir = path.join(rootDir, 'urqw');
const targetDir = path.join(rootDir, 'node_modules', 'urqw', 'quests');
const targetFile = path.join(targetDir, 'urqw.zip');

const output = fs.createWriteStream(targetFile);
const archive = archiver('zip', {
    zlib: { level: 9 }
});

output.on('close', () => {
    console.log('The build was completed successfully:', targetFile);
});

output.on('error', (err) => {
    console.error('Error while archiving:', err);
    process.exit(1);
});

archive.on('error', (err) => {
    console.error('Archiver error:', err);
    process.exit(1);
});

try {
    fs.mkdirSync(targetDir, { recursive: true });
} catch (err) {
    if (err.code !== 'EEXIST') {
        throw err;
    }
}

archive.directory(urqwDir, false);

archive.pipe(output);
archive.finalize();

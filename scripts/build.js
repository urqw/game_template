/**
 * Written in 2025 by Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const { rootDir, urqwDir } = require('./common');

async function build() {
    try {
        const targetDir = path.join(rootDir, 'node_modules', 'urqw', 'quests');
        const targetFile = path.join(targetDir, 'urqw.zip');

        await fsp.mkdir(targetDir, { recursive: true });

        const output = fs.createWriteStream(targetFile);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log('The build was completed successfully:', targetFile);
            process.exit(0);
        });

        output.on('error', (err) => {
            console.error('Error while archiving:', err);
            process.exit(1);
        });

        archive.on('error', (err) => {
            console.error('Archiver error:', err);
            process.exit(1);
        });

        archive.directory(urqwDir, false);
        archive.pipe(output);
        await new Promise((resolve, reject) => {
            archive.finalize((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    } catch (err) {
        console.error('Build error:', err);
        process.exit(1);
    }
}

build();

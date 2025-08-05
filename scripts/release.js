/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const fsp = require('fs').promises;

async function packRelease() {
    try {
        const rootPath = path.resolve(__dirname, '..');
        const releasePath = path.join(rootPath, 'release');
        const packagePath = path.join(rootPath, 'package.json');

        // Name and version of build
        const packageData = await fsp.readFile(packagePath, 'utf8');
        const { name, version } = JSON.parse(packageData);
        const buildName = `${name}_${version}.zip`;

        // Check the existence and clean the release directory
        try {
            await fsp.access(releasePath);
            await fsp.rm(releasePath, { recursive: true });
        } catch (err) {
            // If the directory does not exist, just continue
        }

        await fsp.mkdir(releasePath);

        // Define  and check the existence the urqw directory
        const urqwPath = path.join(rootPath, 'urqw');
        const stats = await fsp.lstat(urqwPath);
        if (!stats.isDirectory()) {
            throw new Error('Directory urqw not found or is not a directory.');
        }

        // Create an archive
        const output = fs.createWriteStream(path.join(releasePath, buildName));
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive
            .on('error', (err) => {
                throw new Error('Error creating archive: ' + err.message);
            })
            .on('close', () => {
                console.log(`Release build completed successfully. Archive created at path: ${path.join(releasePath, buildName)}`);
            });

        archive.pipe(output);
        archive.directory(urqwPath, false);
        await archive.finalize();
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
        });

        process.exit(0);

    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

packRelease();

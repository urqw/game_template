/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const { rootDir, urqwDir } = require('./common');

async function packRelease() {
    try {
        const releaseDir = path.join(rootDir, 'release');
        const packageFile = path.join(rootDir, 'package.json');

        // Name and version of build
        const packageData = await fsp.readFile(packageFile, 'utf8');
        const { name, version } = JSON.parse(packageData);
        const buildName = `${name}_${version}.zip`;

        // Check the existence and clean the release directory
        try {
            await fsp.access(releaseDir);
            await fsp.rm(releaseDir, { recursive: true });
        } catch (err) {
            // If the directory does not exist, just continue
        }

        await fsp.mkdir(releaseDir);

        // Check the existence the urqw directory
        const stats = await fsp.lstat(urqwDir);
        if (!stats.isDirectory()) {
            throw new Error('Directory urqw not found or is not a directory.');
        }

        // Create an archive
        const output = fs.createWriteStream(path.join(releaseDir, buildName));
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive
            .on('error', (err) => {
                throw new Error('Error creating archive: ' + err.message);
            })
            .on('close', () => {
                console.log(`Release build completed successfully. Archive created at path: ${path.join(releaseDir, buildName)}`);
            });

        archive.pipe(output);
        archive.directory(urqwDir, false);
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

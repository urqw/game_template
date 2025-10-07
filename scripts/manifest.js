/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const uuid = require('uuid');

const { rootDir, manifestFile, rl, readManifest } = require('./common');

async function writeManifest(file, data) {
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function promptUser(currentValue, promptText) {
    return new Promise((resolve) => {
        let question;
        if (currentValue) {
            question = `${promptText}\n(current value: "${currentValue}"),\nor enter an empty string to leave the current value unchanged:\n> `;
        } else {
            question = `${promptText}:\n> `;
        }
        rl.question(question, (answer) => {
            resolve(answer.trim() || currentValue);
        });
    });
}

async function main() {
    try {
        const manifest = await readManifest(manifestFile);
    
        const urqw_title = await promptUser(manifest.urqw_title || '', 'Enter the game page title');
        manifest.urqw_title = urqw_title;
    
        const urqw_game_lang = await promptUser(manifest.urqw_game_lang || '', 'Enter the game text language (an ISO-639 two- or three-letter language code, optionally followed by a hyphen and an ISO-3166 country code)');
        manifest.urqw_game_lang = urqw_game_lang;
    
        let ifidGen = false;
        if (!manifest.urqw_game_ifid) {
            manifest.urqw_game_ifid = uuid.v4().toUpperCase();
            ifidGen = true;
        }

        if (manifest.game_encoding !== 'CP1251') {
            manifest.game_encoding = 'UTF-8';
        }

        if (!['ripurq', 'dosurq', 'akurq'].includes(manifest.urq_mode)) {
            manifest.urq_mode = 'urqw';
        }

        manifest.manifest_version = 1;

        await writeManifest(manifestFile, manifest);
    
        let = message = 'Successfully saved manifest.json';
        if (ifidGen) {
            message += `\nA new IFID has been automatically generated: ${manifest.urqw_game_ifid}`;
        }
        console.log(message);
    
        rl.close();
    } catch (err) {
        console.error('Error:', err.message);
        rl.close();
    }
}

main();

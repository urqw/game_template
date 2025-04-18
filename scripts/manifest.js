/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const uuid = require('uuid');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'urqw', 'manifest.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function readManifest() {
    try {
        const data = await fs.promises.readFile(manifestPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return {};
        }
        throw err;
    }
}

async function writeManifest(data) {
    await fs.promises.writeFile(manifestPath, JSON.stringify(data, null, 2), 'utf-8');
}

async function promptUser(currentValue, promptText) {
    return new Promise((resolve) => {
        let question;
        if (currentValue) {
            question = `${promptText} (current value: "${currentValue}"),\nor enter an empty string to leave the current value unchanged: `;
        } else {
            question = `${promptText}: `;
        }
        rl.question(question, (answer) => {
            resolve(answer.trim() || currentValue);
        });
    });
}

async function main() {
    try {
        const manifest = await readManifest();
    
        const urqw_title = await promptUser(manifest.urqw_title || '', 'Enter the game page title');
        manifest.urqw_title = urqw_title;
    
        const urqw_game_lang = await promptUser(manifest.urqw_game_lang || '', 'Enter the game text language code');
        manifest.urqw_game_lang = urqw_game_lang;
    
        let ifidGen = false;
if (!manifest.urqw_game_ifid) {
            manifest.urqw_game_ifid = uuid.v4().toUpperCase();
            ifidGen = true;
        }

        if (manifest.game_encoding !== 'CP1251') {
            manifest.game_encoding = 'UTF-8';
        }

        if (manifest.urq_mode !== 'dosurq' && manifest.urq_mode !== 'ripurq') {
            manifest.urq_mode = 'urqw';
        }

        manifest.manifest_version = 1;

        await writeManifest(manifest);
    
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

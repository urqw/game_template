/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { DOMParser } = require('xmldom');

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

async function readIFictionFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data;
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        throw err;
    }
}

function validateXML(xml) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'application/xml');
        const errors = xmlDoc.getElementsByTagName('parsererror');
        if (errors.length > 0) {
            throw new Error('Invalid XML format in iFiction record file');
        }
        return xmlDoc;
    } catch (error) {
        console.error('XML validation error:', error);
        return null;
    }
}

function getValue(xmlDoc, path, defaultValue, br = false) {
    try {
        const parts = path.split('/');
        let currentNode = xmlDoc.documentElement;

        for (const part of parts) {
            const nodes = currentNode.getElementsByTagName(part);
            if (nodes.length === 0) return defaultValue;
            currentNode = nodes[0];
        }

        let value;
        if (br) {
            value = extractTextWithBr(currentNode).trim();
        } else {
            value = currentNode.textContent.trim() || '';
        }

        return value === '' ? defaultValue : value;
    } catch (error) {
        console.error('Error getting iFiction record value:', error);
        return defaultValue;
    }
}

// Define constants for node types
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

// Function to extract text while keeping only tags <br/>
function extractTextWithBr(node) {
    let result = '';
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === TEXT_NODE) {
            result += child.textContent.trim();
        } else if (child.nodeType === ELEMENT_NODE) {
            if (child.tagName.toUpperCase() === 'BR') {
                result += `<${child.tagName}/>`;
            }
            result += extractTextWithBr(child);
        }
    }
    return result;
}

async function promptUser(currentValue, promptText) {
    return new Promise((resolve) => {
        let question;
        if (currentValue) {
            question = `${promptText}\n(current value: "${currentValue}"),\nenter an empty string to leave the current value unchanged\nor enter a whitespace-only string to clear the current value:\n> `;
        } else {
            question = `${promptText}\nor enter an empty string to skip:\n> `;
        }
        rl.question(question, (answer) => {
            if (answer === '') {
                resolve(currentValue);
            } else {
                resolve(answer.trim());
            }
        });
    });
}

async function main() {
    try {
        const manifest = await readManifest();
        const ifid = manifest.urqw_game_ifid;

        if (!ifid) {
            console.error('Error: IFID is not defined. Please run manifest script first.');
            process.exit(1);
        }

        const ifictionPath = path.join(rootDir, 'urqw', `${ifid}.iFiction`);
        let xmlDoc = null;
        let xmlContent = await readIFictionFile(ifictionPath);

        if (xmlContent) {
            xmlDoc = validateXML(xmlContent);
        }

        // Get all values from the user

        const titleDefault = 'An Interactive Fiction';
let title = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/title', titleDefault) : titleDefault,
            'Enter the game title'
        );
        if (!title) title = titleDefault;

        const headline = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/headline', '') : '',
            'Enter the game headline (quasi-subtitle)'
        );

        const authorDefault = 'Anonymous';
        let author = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/author', authorDefault) : authorDefault,
            'Enter the author\'s name (for multiple authors, use a comma or "and")'
        );
        if (!author) author = authorDefault;

        const series = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/series', '') : '',
            'Enter the name of the series'
        );

        let seriesnumber;
        if (series) {
            seriesnumber = await promptUser(
                xmlDoc ? getValue(xmlDoc, 'story/bibliographic/seriesnumber', '') : '',
                'Enter Part number of the series (only a non-negative integer)'
            );
        }

        const genre = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/genre', '') : '',
            'Enter the game genre (only one)'
        );

        const language = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/language', '') : '',
            'Enter the primary language (an ISO-639 two- or three-letter language code, optionally followed by a hyphen and an ISO-3166 country code)'
        );

        const firstpublished = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/firstpublished', '') : '',
            'Enter the date of first publication of the game (YYYY or YYYY-MM-DD)'
        );

        const url = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/contacts/url', '') : '',
            'Enter a valid, absolute URL of the home page ()only "http://" or "https://" protocol)'
        );

        const authoremail = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/contacts/authoremail', '') : '',
            'Enter the contact email (for multiple email addresses, use a comma)'
        );

        const description = await promptUser(
            xmlDoc ? getValue(xmlDoc, 'story/bibliographic/description', '', true) : '',
            'Enter the game description (for paragraph breaks, use the <br/> tag)'
        );

        const originated = new Date().toISOString().split('T')[0];

        // generate XML content

        xmlContent =
`<?xml version="1.0" encoding="UTF-8"?>
<ifindex version="1.0" xmlns="http://babel.ifarchive.org/protocol/iFiction/">
\t<story>
\t\t<identification>
\t\t\t<ifid>${ifid}</ifid>
\t\t\t<format>urqw</format>
\t\t</identification>
\t\t<bibliographic>
\t\t\t<title>${title}</title>
\t\t\t<author>${author}</author>`;

        if (language) xmlContent += `\n\t\t\t<language>${language}</language>`;
        if (headline) xmlContent += `\n\t\t\t<headline>${headline}</headline>`;
        if (firstpublished) xmlContent += `\n\t\t\t<firstpublished>${firstpublished}</firstpublished>`;
        if (genre) xmlContent += `\n\t\t\t<genre>${genre}</genre>`;
        xmlContent += `\n\t\t\t<group>URQ</group>`;
        if (description) xmlContent += `\n\t\t\t<description>${description}</description>`;
        if (series) xmlContent += `\n\t\t\t<series>${series}</series>`;
        if (seriesnumber) xmlContent += `\n\t\t\t<seriesnumber>${seriesnumber}</seriesnumber>`;
        xmlContent += `\n\t\t</bibliographic>`;
        if (url || authoremail) {
            xmlContent += `\n\t\t<contacts>`;
            if (url) xmlContent += `\n\t\t\t<url>${url}</url>`;
            if (authoremail) xmlContent += `\n\t\t\t<authoremail>${authoremail}</authoremail>`;
            xmlContent += `\n\t\t</contacts>`;
        }

        xmlContent +=
`\n\t\t<colophon>
\t\t\t<generator>UrqW Game Template</generator>
\t\t\t<originated>${originated}</originated>
\t\t</colophon>
\t</story>
</ifindex>`;

        // Write a file
        try {
            await fs.promises.writeFile(
                ifictionPath,
                xmlContent,
                {
                    encoding: 'utf8',
                    flag: 'w'
                }
            );
            console.log(`Successfully saved iFiction record as ${ifid}.iFiction file.`);
        } catch (writeError) {
            console.error('Error writing iFiction record file:', writeError.message);
            console.error('File path:', ifictionPath);
            process.exit(1);
        }

        rl.close();

    } catch (mainError) {
        console.error('Main function error:', mainError.message);
        process.exit(1);
    }
}

main();

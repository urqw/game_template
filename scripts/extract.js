/**
 * Written in 2025 by Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs').promises;
const path = require('path');
const iconv = require('iconv-lite');
const { DOMParser } = require('xmldom');

const { rootDir, urqwDir, manifestFile, readManifest } = require('./common');

let htmlSupport;
const parser = new DOMParser();
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const tempDir = path.join(rootDir, 'temp');

// Function for finding .qst files
async function findQstFiles(dir) {
    try {
        const files = await fs.readdir(dir);
        const qstFiles = []; // regular files
        const priorityQstFiles = []; // Files starting with an underscore

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                // Recursive processing of nested directories
                const nestedFiles = await findQstFiles(fullPath);
                nestedFiles.forEach(f => {
                    if (path.basename(f).startsWith('_')) {
                        priorityQstFiles.push(f);
                    } else {
                        qstFiles.push(f);
                    }
                });
            } else if (file.toLowerCase().endsWith('.qst')) {
                // Add .qst files to the corresponding array
                if (file.startsWith('_')) {
                    priorityQstFiles.push(fullPath);
                } else {
                    qstFiles.push(fullPath);
                }
            }
        }

        // Merge arrays: priority files first, then regular files
        return [...priorityQstFiles, ...qstFiles];
    } catch (err) {
        console.error('Error finding files:', err);
        return [];
    }
}

// Function for reading a file in different encodings
async function readFileWithEncoding(file, encoding) {
    try {
        switch (encoding) {
            case 'UTF-8':
                return await fs.readFile(file, 'utf-8');
            case 'CP1251':
                const buffer = await fs.readFile(file);
                return iconv.decode(buffer, 'windows-1251');
            default:
                throw new Error('Unsupported encoding');
        }
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

// Function to delete HTML tags from a string
function stripHtmlTags(html) {
    if (!htmlSupport) {
        return html;
    }
    if (typeof html !== 'string' || html.trim() === '') {
        return html;
    }
    html = `<div>${html}</div>`;

    try {
        const doc = parser.parseFromString(html, 'text/html');
        if (!doc || !doc.documentElement) {
            throw new Error('Invalid HTML document');
            return html;
        }

        // Recursive function for traversing the DOM tree
        function recursiveExtract(node) {
            let result = '';
            // Get all text nodes, including spaces between elements
            const textNodes = [];
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                // If it is a text node, keep its text as is
                if (child.nodeType === TEXT_NODE) {
                    textNodes.push(child.textContent);
                }
                // If it is an element, recursively process its contents
                else if (child.nodeType === ELEMENT_NODE) {
                    textNodes.push(recursiveExtract(child));
                }
            }
            // Combine all text nodes, preserving original whitespace
            result = textNodes.join('');
            // Trim only leading and trailing spaces
            return result.trim();
        }

        return recursiveExtract(doc.documentElement);
    } catch (error) {
        console.error('Error parsing HTML:', error);
        return html;
    }
}

// Function for opening special URQL constructs
function openConstructs(text) {
    // Replace constructions #$ with spaces
    text = text.replace(/#\$/g, ' ');
    // Replace constructions #/$ with line breaks
    text = text.replace(/#\/\$/g, '\n');
    // Replace constructions ##code$ with characters with the corresponding code
    text = text.replace(/##(\d+)\$/g, (match, digits) => {
        const code = parseInt(digits, 10);
        return String.fromCharCode(code);
    });
    return text;
}

// Function for processing .qst files
async function processFiles(manifestFile, urqwDir, rootDir) {
    try {
        // Determine parameters for reading .qst files
        const manifest = await readManifest(manifestFile);
        let encoding = manifest.game_encoding;
        if (!encoding) encoding = 'CP1251';
        let mode = manifest.urq_mode;
        if (!mode) mode = 'urqw';
        htmlSupport = !['ripurq', 'dosurq'].includes(mode);
        if (
            manifest.hasOwnProperty('html_support')
            && typeof manifest.html_support === 'boolean'
        ) htmlSupport = manifest.html_support;

        // Collect a list of .qst files
        const qstFiles = await findQstFiles(urqwDir);

        // Collect the contents of all .qst files
        let allContent = '';
        for (const file of qstFiles) {
            const content = await readFileWithEncoding(file, encoding);
            allContent += content + '\n';
        }

        // Delete line breaks at the beginning and end of the text
        let text = allContent.replace(/^[\n\r]+|[\n\r]+$/g, '');
        // Delete comments
        text = text.replace(/\/\*[\s\S.]+?\*\//g, '');
        // Replace ampersands with line breaks
        text = text.replace(/&/g, '\n');
        // Replace the else operators with line breaks
        text = text.replace(/\s+else\s+/gi, '\n');
        // Trim leading whitespaces from each line
        text = text.replace(/^\s+/gm, '');
        // Concatenate line with underscores
        text = text.replace(/[\r\n]+_/g, '');
        // Delete UrqW-specific links
        text = text.replace(/\[\[(?:\s*([^|\]]+?)\s*(?:\|.*?)?)\]\]/g, '$1');
        // Split the text into an array of lines
        const lines = text.split(/[\n\r]+/);

        // Extract text
        let extractedText = '';
        for (const line of lines) {
            // Find text in print and button operators
            const pMatch = line.match(/\bp\s(.*)/i);
            const printMatch = line.match(/\bprint\s(.*)/i);
            const printlnMatch = line.match(/\bprintln\s(.*)/i);
            const plnMatch = line.match(/\bpln\s(.*)/i);
            const btnMatch = line.match(/\bbtn\s+.+?,\s*(.+)$/i);

            // Add the result of a successful finding as a separate line
            if (pMatch) extractedText += stripHtmlTags(pMatch[1]) + '\n';
            if (printMatch) extractedText += stripHtmlTags(printMatch[1]) + '\n';
            if (printlnMatch) extractedText += stripHtmlTags(printlnMatch[1]) + '\n';
            if (plnMatch) extractedText += stripHtmlTags(plnMatch[1]) + '\n';
            if (btnMatch) extractedText += stripHtmlTags(btnMatch[1]) + '\n';

            /*
            // Extract quoted strings
            const quotes = line.match(/"([^"]*)"/g);
            if (quotes) {
                for (const quote of quotes) {
                    extractedText += quote.slice(1, -1) + '\n';
                }
            }
            */
        }

        extractedText = openConstructs(extractedText);

        // Extract comments
        const commentRegex = /\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g;
        let matches = [];
        let match;
        while (match = commentRegex.exec(allContent)) {
            let commentText = match[0].replace(/^\/\*|\*\/$/g, '').trim();
            matches.push(commentText);
        }
        let extractedComments = matches.join('\n\n');

        // Write results to files
        await fs.mkdir(tempDir, { recursive: true });
        const extractedTextFile = path.join(tempDir, 'extracted_text.txt');
        await fs.writeFile(extractedTextFile, extractedText, 'utf-8');
        const extractedCommentsFile = path.join(tempDir, 'extracted_comments.txt');
        await fs.writeFile(extractedCommentsFile, extractedComments, 'utf-8');

        console.log(`Extracted text and comments from ${qstFiles.length} .qst file(s) to extracted_text.txt and extracted_comments.txt files at path:\n${tempDir}`);
        process.exit(0);
    } catch (error) {
         console.error('An error occurred:', error.message);
         process.exit(1);
     }
 }

async function main() {
    try {
        await processFiles(manifestFile, urqwDir, rootDir);
    } catch (error) {
        console.error('Script execution error:', error.message);
        process.exit(1);
    }
}

main();

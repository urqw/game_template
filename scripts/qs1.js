/**
 * Written in 2026 by Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

// This is a scratch-written implementation of the encoding and decoding
// algorithm for the unpatented game encryption format from RipURQ 1.22.

const fs = require('fs').promises;
const path = require('path');

// Define the project root directory
const rootDir = path.resolve(__dirname, '..');

/**
 * Applies QS1 encoding transformation
 * @param {Buffer} data - input data
 * @returns {Buffer} - encoded data
 */
function qs1Encode(data) {
    const result = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i++) {
        const byte = data[i];

        if (byte >= 32) {
            result[i] = (31 - byte) & 0xFF;
        } else {
            result[i] = byte;
        }
    }

    return result;
}

/**
 * Applies QS1 decoding transformation
 * @param {Buffer} data - encoded data
 * @returns {Buffer} - decoded data
 */
function qs1Decode(data) {
    // Decoding uses the same algorithm as encoding - it's symmetric
    return qs1Encode(data);
}

/**
 * Determines operation mode by file extension
 * @param {string} filePath - file path
 * @returns {{mode: 'encode' | 'decode', extension: string}}
 */
function determineModeByExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.qs1') {
        return { mode: 'decode', extension: ext };
    } else if (ext === '.qst') {
        return { mode: 'encode', extension: ext };
    } else {
        throw new Error(`Unsupported file extension: ${ext}. Expected .qs1 or .qst`);
    }
}

/**
 * Main script execution
 * @param {string[]} args - command line arguments
 * @returns {Promise<void>}
 */
async function main(args) {
    try {
        // Check for required argument
        if (!args[0]) {
            throw new Error('Input file path is required');
        }

        const inputPath = path.resolve(rootDir, args[0]);
        const outputPathArg = args[1];

        // Determine mode
        const { mode, extension } = determineModeByExtension(inputPath);

        // Read input file
        let inputData;
        try {
            inputData = await fs.readFile(inputPath);
        } catch (error) {
            throw new Error(`Cannot read input file: ${inputPath}. Error: ${error.message}`);
        }

        // Apply transformation
        const processedData = mode === 'decode' ? qs1Decode(inputData) : qs1Encode(inputData);

        // Determine output path
        let outputPath;
        if (outputPathArg) {
            outputPath = path.resolve(rootDir, outputPathArg);
        } else {
            const baseName = path.basename(inputPath, extension);
            const dirName = path.dirname(inputPath);

            if (mode === 'decode') {
                outputPath = path.join(dirName, `${baseName}.qst`);
            } else { // encode
                outputPath = path.join(dirName, `${baseName}.qs1`);
            }
        }

        // Write result
        try {
            await fs.writeFile(outputPath, processedData);
            console.log(`Successfully processed: file\n${inputPath}\n${mode}d and the result is saved to file\n${outputPath}`);
        } catch (error) {
            throw new Error(`Cannot write output file: ${outputPath}. Error: ${error.message}`);
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main(process.argv.slice(2));

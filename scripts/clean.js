/**
 * Written in 2026 by Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetPath = path.join(rootDir, 'engine');

function fail(message) {
    console.error(`Engine cleanup error: ${message}`);
    process.exitCode = 1;
}

async function ensureWritable(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    await Promise.all(
        entries.map((entry) => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory()
                ? fs.promises.chmod(fullPath, 0o755)
                    .then(() => ensureWritable(fullPath))
                    .catch(() => {})
                : fs.promises.chmod(fullPath, 0o644).catch(() => {});
        })
    );
    await fs.promises.chmod(dir, 0o755).catch(() => {});
}

async function main() {
    const rel = path.relative(rootDir, targetPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        return fail('Target is outside the project root. Aborting.');
    }

    // Delete only if the directory exists
    if (fs.existsSync(targetPath)) {
        try {
            await fs.promises.rm(targetPath, { recursive: true, maxRetries: 3, retryDelay: 300 });
            console.log(`The engine directory has been deleted: ${targetPath}`);
        } catch (err) {
            if (err.code === 'EPERM' || err.code === 'EACCES') {
                try {
                    await ensureWritable(targetPath);
                    await fs.promises.rm(targetPath, { recursive: true, force: true });
                    return console.log(`The engine directory has been deleted (after permission fix): ${targetPath}`);
                } catch (retryErr) {
                    return fail(`${retryErr.message}`);
                }
            }
            if (err.code === 'EBUSY') {
                return fail('Directory is in use by another process (EBUSY).');
            }
            return fail(`${err.code || 'UNKNOWN'}: ${err.message}`);
        }
    }
}

main().catch((err) => fail(err ? err.stack : 'Unknown critical error'));

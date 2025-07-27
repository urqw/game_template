/**
 * This file is part of UrqW Game Template.
 * SPDX-License-Identifier: CC0-1.0
 */

const opn = require('opn');
const path = require('path');

const docsPath = path.resolve(__dirname, '../node_modules/urqw/docs/index.html');

opn(docsPath);

import assert from 'node:assert/strict';
import { generateDefaultExportFilename, normalizeRotationDegrees } from '../src/utils.js';

assert.equal(
  generateDefaultExportFilename('2026-06-16', 'IMG_1234.png'),
  '2026-06-16_IMG_1234.jpg'
);

assert.equal(
  generateDefaultExportFilename('2026-06-16', 'my photo.final.jpeg'),
  '2026-06-16_my photo.final.jpg'
);

assert.equal(normalizeRotationDegrees(90), 90);
assert.equal(normalizeRotationDegrees(-90), 270);
assert.equal(normalizeRotationDegrees(450), 90);
assert.equal(normalizeRotationDegrees('180'), 180);

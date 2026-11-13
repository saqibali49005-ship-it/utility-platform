import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('../aspect-ratio-engine.js');

assert.equal(engine.gcd(1920, 1080), 120);
assert.equal(engine.simplifyRatio(1920, 1080), '16:9');
assert.equal(engine.simplifyRatio(1080, 1920), '9:16');

assert.deepEqual(engine.calculateRatio(1920, 1080), {
  width: 1920,
  height: 1080,
  ratio: '16:9',
  decimal: '1.7778'
});

assert.deepEqual(engine.solveMissingDimension(16, 9, 'width', 1280), {
  width: 1280,
  height: 720,
  ratio: '16:9',
  knownDimension: 'width',
  knownValue: 1280,
  missingDimension: 'height',
  missingValue: 720
});

assert.deepEqual(engine.solveMissingDimension(16, 9, 'height', 720), {
  width: 1280,
  height: 720,
  ratio: '16:9',
  knownDimension: 'height',
  knownValue: 720,
  missingDimension: 'width',
  missingValue: 1280
});

assert.deepEqual(engine.resizeDimensions(1920, 1080, 'width', 1280), {
  width: 1280,
  height: 720,
  ratio: '16:9',
  scale: 2 / 3
});

assert.deepEqual(engine.resizeDimensions(1920, 1080, 'height', 720), {
  width: 1280,
  height: 720,
  ratio: '16:9',
  scale: 2 / 3
});

assert.throws(() => engine.calculateRatio(0, 1080), /positive finite number/i);
assert.throws(() => engine.solveMissingDimension(16, 9, 'diagonal', 720), /width.*height/i);
assert.throws(() => engine.resizeDimensions(1920, 1080, 'depth', 720), /width.*height/i);

assert.deepEqual(engine.execute({ operation: 'ratio', width: 1920, height: 1080 }), {
  ok: true, data: { width: 1920, height: 1080, ratio: '16:9', decimal: '1.7778' }
});
assert.equal(engine.execute({ operation: 'solve', ratioWidth: 16, ratioHeight: 9, knownDimension: 'width', knownValue: 1280 }).data.height, 720);
assert.equal(engine.execute({ operation: 'unsupported' }).error.code, 'INVALID_INPUT');
assert.equal(engine.contractVersion, 1);

console.log('Aspect ratio engine unit checks: passed.');

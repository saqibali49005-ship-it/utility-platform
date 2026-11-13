import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('../significant-figures-engine.js');

assert.equal(engine.normalizeNumeric(' 1,234.50 '), '1234.50');
assert.equal(engine.significantCount('0.004560'), 4);
assert.equal(engine.significantCount('1.20e3'), 3);
assert.equal(engine.significantCount('0'), 1);
assert.equal(engine.roundToSig('9.996', 3), '1.00e+1');
assert.equal(engine.roundToSig('1e-200', 2), '1.0e-200');

assert.deepEqual(engine.calculate('count', { number: '0.004560' }), {
  ok: true, value: '4', subtitle: 'significant figures', fullPrecision: '0.004560', count: '4'
});
assert.deepEqual(engine.calculate('round', { number: '9.996', target: '3' }), {
  ok: true, value: '1.00e+1', subtitle: '3 significant figures', fullPrecision: '9.996', count: '3'
});
assert.equal(engine.calculate('add', { expression: '12.11 + 18.0' }).value, '30.1');
assert.equal(engine.calculate('add', { expression: '1.2e3 + 1.2e3' }).value, '2.4e+3');
assert.equal(engine.calculate('add', { expression: '1.2e3 + 12' }).value, '1.2e+3');
assert.equal(engine.calculate('add', { expression: '1.2e3 - 1.3e3' }).value, '-1e+2');
assert.equal(engine.calculate('multiply', { expression: '2.50 × 4.0' }).value, '1.0e+1');
assert.equal(engine.calculate('multiply', { expression: '6.0 ÷ 2.0' }).value, '3.0');
assert.equal(engine.calculate('add', { expression: '1 + 2 × 3' }).ok, false);
assert.equal(engine.calculate('multiply', { expression: '1 ÷ 0' }).error, 'Division by zero is not allowed.');
assert.equal(engine.calculate('round', { number: '5', target: '101' }).ok, false);
assert.equal(engine.calculate('count', { number: '' }).error, 'Enter a number.');


assert.equal(engine.execute({ operation: 'count', params: { number: '0.004560' } }).data.value, '4');
assert.equal(engine.execute({ operation: 'add', params: { expression: '12.11 + 18.0' } }).data.value, '30.1');
assert.equal(engine.execute({ operation: 'multiply', params: { expression: '2.50 × 4.0' } }).data.value, '1.0e+1');
assert.equal(engine.execute({ operation: 'round', params: { number: '9.996', target: '3' } }).data.value, '1.00e+1');
assert.equal(engine.execute({ operation: 'divide' }).error.code, 'INVALID_INPUT');
assert.equal(engine.contractVersion, 1);

console.log('Significant-figures engine unit checks: passed.');

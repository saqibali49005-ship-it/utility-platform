import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('../time-calculator-engine.js');

assert.equal(engine.parseClockTime('09:30:00'), 34200);
assert.equal(engine.parseClockTime('17:15'), 62100);
assert.equal(engine.parseClockTime('24:00:00'), null);
assert.equal(engine.parseClockTime('12:60:00'), null);

assert.deepEqual(engine.decomposeDuration(27900), {
  sign: '', days: 0, hours: 7, mins: 45, secs: 0
});
assert.equal(engine.describeDuration(27900), '7 hours 45 minutes');
assert.equal(engine.describeDuration(0), '0 seconds');

assert.deepEqual(engine.calculateDuration('09:30:00', '17:15:00', false), {
  ok: true,
  seconds: 27900,
  parts: { sign: '', days: 0, hours: 7, mins: 45, secs: 0 },
  pretty: '7 hours 45 minutes',
  totalMinutes: 465,
  decimalHours: '7.75'
});
assert.equal(engine.calculateDuration('23:30:00', '01:15:00', false).error, 'end-before-start');
assert.equal(engine.calculateDuration('23:30:00', '01:15:00', true).seconds, 6300);
assert.equal(engine.calculateDuration('invalid', '01:00:00', true).error, 'invalid-times');

assert.equal(engine.formatClockTime(13 * 3600), '13:00:00');
assert.equal(engine.formatClockTime(25 * 3600), '01:00:00 (next day)');
assert.equal(engine.formatClockTime(-1800), '23:30:00 (previous day)');

assert.deepEqual(engine.calculateClockOperation('10:30:00', 2, 30, 0, 'add'), {
  ok: true,
  amount: 9000,
  action: 'add',
  resultSeconds: 46800,
  clockTime: '13:00:00',
  prettyAmount: '2 hours 30 minutes'
});
assert.equal(engine.calculateClockOperation('00:30:00', 1, 15, 0, 'subtract').clockTime, '23:15:00 (previous day)');
assert.equal(engine.calculateClockOperation('10:30:00', 1.5, 0, 0, 'add').error, 'invalid-inputs');
assert.equal(engine.calculateClockOperation('10:30:00', -1, 0, 0, 'add').error, 'invalid-inputs');
assert.equal(engine.calculateClockOperation('bad', 1, 0, 0, 'add').error, 'invalid-inputs');


assert.equal(engine.execute({ operation: 'duration', start: '09:30:00', end: '17:15:00' }).data.decimalHours, '7.75');
assert.equal(engine.execute({ operation: 'duration', start: '23:30:00', end: '01:15:00', nextDay: true }).data.seconds, 6300);
assert.equal(engine.execute({ operation: 'duration', start: '23:30:00', end: '01:15:00' }).error.code, 'INVALID_RANGE');
assert.equal(engine.execute({ operation: 'clock-operation', baseTime: '23:30:00', hours: 2, minutes: 30, seconds: 0, action: 'add' }).data.clockTime, '02:00:00 (next day)');
assert.equal(engine.contractVersion, 1);

console.log('Time calculator engine unit checks: passed.');

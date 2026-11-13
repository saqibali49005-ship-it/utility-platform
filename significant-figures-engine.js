(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ZemToolsSignificantFiguresEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizeNumeric(value) {
    return String(value).trim().replace(/,/g, '');
  }

  function significantCount(raw) {
    const value = normalizeNumeric(raw).toLowerCase();
    if (!value || value === '0' || value === '-0' || value === '+0') return 1;
    const mantissa = value.split('e')[0];
    const digits = mantissa.replace(/^[+-]/, '').replace(/\./g, '');
    if (!digits) return 1;
    let first = 0;
    while (first < digits.length && digits[first] === '0') first++;
    if (first === digits.length) return 1;
    return digits.length - first;
  }

  function formatForSig(value, count) {
    if (value === 0) return '0';
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const ambiguousTrailingZeros = Number.isInteger(value) &&
      Math.abs(value) >= 10 && String(Math.abs(value)).endsWith('0');
    if (exponent >= count || exponent <= -4 || ambiguousTrailingZeros) {
      return value.toExponential(Math.max(0, count - 1));
    }
    const decimals = Math.max(0, count - 1 - exponent);
    return value.toFixed(decimals);
  }

  function roundToSig(raw, count) {
    const value = Number(normalizeNumeric(raw));
    if (!Number.isFinite(value) || !Number.isInteger(count) || count < 1 || count > 100) {
      throw new Error('Enter a valid number and significant-figure count.');
    }
    if (value === 0) return '0';
    const rounded = Number(value.toExponential(count - 1));
    return formatForSig(rounded, count);
  }

  function parseExpression(expression, allowedOperators) {
    const cleaned = String(expression).trim()
      .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    const match = cleaned.match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([+\-*/])\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*$/i);
    if (!match || !allowedOperators.includes(match[2])) {
      throw new Error('Enter a valid expression with two numbers and a supported operator.');
    }
    return { a: match[1], op: match[2], b: match[3] };
  }

  function decimalPlacePosition(raw) {
    const value = normalizeNumeric(raw).toLowerCase();
    const parts = value.split('e');
    const mantissa = parts[0];
    const exponent = parts.length > 1 ? Number(parts[1]) : 0;
    return (mantissa.split('.')[1] || '').length - exponent;
  }

  function roundAtDecimalPosition(value, position) {
    if (value === 0) return { text: '0', significant: 1 };
    let rounded;
    if (position < 0) {
      const factor = 10 ** (-position);
      rounded = Math.sign(value) * Math.round(Math.abs(value) / factor) * factor;
    } else if (position <= 100) {
      rounded = Number(value.toFixed(position));
    } else {
      rounded = value;
    }
    if (rounded === 0) return { text: '0', significant: 1 };
    const exponent = Math.floor(Math.log10(Math.abs(rounded)));
    const count = Math.max(1, exponent + position + 1);
    const text = position < 0
      ? formatForSig(rounded, count)
      : position <= 100
        ? rounded.toFixed(position)
        : rounded.toExponential(Math.max(0, count - 1));
    return { text, significant: count };
  }

  function calculate(mode, inputs) {
    const values = inputs || {};
    try {
      if (mode === 'count') {
        const raw = normalizeNumeric(values.number || '');
        if (!raw) throw new Error('Enter a number.');
        const count = significantCount(raw);
        return { ok: true, value: String(count), subtitle: 'significant figures', fullPrecision: raw, count: String(count) };
      }

      if (mode === 'round') {
        const raw = normalizeNumeric(values.number || '');
        const count = Number(values.target);
        if (!raw) throw new Error('Enter a number.');
        const output = roundToSig(raw, count);
        return {
          ok: true,
          value: output,
          subtitle: count + ' significant figures',
          fullPrecision: String(Number(raw)),
          count: String(count)
        };
      }

      const allowed = mode === 'add' ? ['+', '-'] : mode === 'multiply' ? ['*', '/'] : [];
      if (!allowed.length) throw new Error('Choose a supported calculation mode.');
      const expression = parseExpression(values.expression || '', allowed);
      const a = Number(expression.a);
      const b = Number(expression.b);
      if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Enter valid numbers.');

      let result;
      if (expression.op === '+') result = a + b;
      else if (expression.op === '-') result = a - b;
      else if (expression.op === '*') result = a * b;
      else {
        if (b === 0) throw new Error('Division by zero is not allowed.');
        result = a / b;
      }

      if (!Number.isFinite(result)) throw new Error('The result is outside the supported numeric range.');
      if (mode === 'add') {
        const position = Math.min(decimalPlacePosition(expression.a), decimalPlacePosition(expression.b));
        const rounded = roundAtDecimalPosition(result, position);
        const subtitle = position < 0
          ? 'rounded to nearest ' + (10 ** (-position)).toLocaleString('en-US')
          : position === 0
            ? 'rounded to the nearest whole number'
            : 'rounded to ' + position + ' decimal place' + (position === 1 ? '' : 's');
        return { ok: true, value: rounded.text, subtitle, fullPrecision: String(result), count: String(rounded.significant) };
      }

      const count = Math.min(significantCount(expression.a), significantCount(expression.b));
      return {
        ok: true,
        value: formatForSig(result, count),
        subtitle: count + ' significant figures',
        fullPrecision: String(result),
        count: String(count)
      };
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : 'Unable to calculate this value.' };
    }
  }


  function execute(request) {
    const input = request || {};
    const mode = input.operation;
    const result = calculate(mode, input.params || {});
    if (!result.ok) {
      return { ok: false, error: { code: 'INVALID_INPUT', message: result.error } };
    }
    const { ok, ...data } = result;
    return { ok: true, data };
  }

  return Object.freeze({
    contractVersion: 1,
    execute,
    normalizeNumeric,
    significantCount,
    formatForSig,
    roundToSig,
    parseExpression,
    decimalPlacePosition,
    roundAtDecimalPosition,
    calculate
  });
});

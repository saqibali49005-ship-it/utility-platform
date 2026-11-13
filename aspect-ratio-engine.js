(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ZemToolsAspectRatioEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function assertPositiveFinite(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
      throw new TypeError(label + ' must be a positive finite number.');
    }
    return number;
  }

  // Keep the established page behaviour: dimensions are reduced using
  // rounded whole-number dimensions, matching the original calculator.
  function gcd(a, b) {
    a = Math.round(Math.abs(a));
    b = Math.round(Math.abs(b));
    while (b) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a || 1;
  }

  function simplifyRatio(width, height) {
    const w = assertPositiveFinite(width, 'Width');
    const h = assertPositiveFinite(height, 'Height');
    const divisor = gcd(w, h);
    return (w / divisor) + ':' + (h / divisor);
  }

  function calculateRatio(width, height) {
    const w = assertPositiveFinite(width, 'Width');
    const h = assertPositiveFinite(height, 'Height');
    return {
      width: w,
      height: h,
      ratio: simplifyRatio(w, h),
      decimal: (w / h).toFixed(4)
    };
  }

  function solveMissingDimension(ratioWidth, ratioHeight, knownDimension, knownValue) {
    const rw = assertPositiveFinite(ratioWidth, 'Ratio width');
    const rh = assertPositiveFinite(ratioHeight, 'Ratio height');
    const known = assertPositiveFinite(knownValue, 'Known dimension');
    if (knownDimension !== 'width' && knownDimension !== 'height') {
      throw new TypeError('Known dimension must be "width" or "height".');
    }

    let width;
    let height;
    if (knownDimension === 'width') {
      width = known;
      height = known * rh / rw;
    } else {
      height = known;
      width = known * rw / rh;
    }

    width = Math.round(width);
    height = Math.round(height);
    const missingDimension = knownDimension === 'width' ? 'height' : 'width';
    return {
      width,
      height,
      ratio: simplifyRatio(rw, rh),
      knownDimension,
      knownValue: known,
      missingDimension,
      missingValue: missingDimension === 'width' ? width : height
    };
  }

  function resizeDimensions(originalWidth, originalHeight, targetDimension, targetValue) {
    const ow = assertPositiveFinite(originalWidth, 'Original width');
    const oh = assertPositiveFinite(originalHeight, 'Original height');
    const target = assertPositiveFinite(targetValue, 'Target dimension');
    if (targetDimension !== 'width' && targetDimension !== 'height') {
      throw new TypeError('Target dimension must be "width" or "height".');
    }

    let width;
    let height;
    if (targetDimension === 'width') {
      width = Math.round(target);
      height = Math.round(target * oh / ow);
    } else {
      height = Math.round(target);
      width = Math.round(target * ow / oh);
    }

    const scale = targetDimension === 'width' ? width / ow : height / oh;
    return {
      width,
      height,
      ratio: simplifyRatio(ow, oh),
      scale
    };
  }


  function execute(request) {
    const input = request || {};
    try {
      let data;
      if (input.operation === 'ratio') data = calculateRatio(input.width, input.height);
      else if (input.operation === 'solve') data = solveMissingDimension(input.ratioWidth, input.ratioHeight, input.knownDimension, input.knownValue);
      else if (input.operation === 'resize') data = resizeDimensions(input.originalWidth, input.originalHeight, input.targetDimension, input.targetValue);
      else throw new TypeError('Choose a supported aspect-ratio operation.');
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: { code: 'INVALID_INPUT', message: error && error.message ? error.message : 'Unable to calculate this ratio.' } };
    }
  }

  return Object.freeze({
    contractVersion: 1,
    execute,
    gcd,
    simplifyRatio,
    calculateRatio,
    solveMissingDimension,
    resizeDimensions
  });
});

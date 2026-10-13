import type { DistributionConfiguration } from '../types/distribution';

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);
const SQRT_TWO = Math.sqrt(2);
const LOG_SQRT_TWO_PI = 0.9189385332046727;
const EPSILON = 1e-14;

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function assertSigma(standardDeviation: number): void {
  assertFinite(standardDeviation, 'standard deviation');
  if (standardDeviation <= 0) throw new RangeError('standard deviation must be greater than zero');
}

function assertDf(degreesOfFreedom: number): void {
  assertFinite(degreesOfFreedom, 'degrees of freedom');
  if (degreesOfFreedom <= 0) throw new RangeError('degrees of freedom must be greater than zero');
}

function assertProbability(p: number): void {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError('probability must be between 0 and 1');
}

function clampProbability(p: number): number {
  if (p < 0 && p > -EPSILON) return 0;
  if (p > 1 && p < 1 + EPSILON) return 1;
  return p;
}

// Abramowitz & Stegun 7.1.26; max error is about 1.5e-7.
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - polynomial * Math.exp(-z * z));
}

// Complementary error function form preserves accuracy in the tails.
function erfc(x: number): number {
  if (x < 0) return 2 - erfc(-x);
  const t = 1 / (1 + 0.5 * x);
  return t * Math.exp(
    -x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
      t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
        t * (-0.82215223 + t * 0.17087277)))))))),
  );
}

export function normalPDF(x: number, mean = 0, standardDeviation = 1): number {
  assertFinite(x, 'x');
  assertFinite(mean, 'mean');
  assertSigma(standardDeviation);
  const z = (x - mean) / standardDeviation;
  return Math.exp(-0.5 * z * z) / (standardDeviation * SQRT_TWO_PI);
}

export function normalCDF(x: number, mean = 0, standardDeviation = 1): number {
  assertFinite(x, 'x');
  assertFinite(mean, 'mean');
  assertSigma(standardDeviation);
  const z = (x - mean) / (standardDeviation * SQRT_TWO);
  if (z === 0) return 0.5;
  const upperGamma = regularizedGammaQ(0.5, z * z);
  return clampProbability(z < 0 ? 0.5 * upperGamma : 1 - 0.5 * upperGamma);
}

// Peter J. Acklam's inverse-normal rational approximation, refined by Newton's method.
export function normalInverseCDF(p: number, mean = 0, standardDeviation = 1): number {
  assertProbability(p);
  assertFinite(mean, 'mean');
  assertSigma(standardDeviation);
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  if (p === 0.5) return mean;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  let x: number;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p > 1 - plow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  x -= (normalCDF(x) - p) / normalPDF(x);
  return mean + standardDeviation * x;
}

function logGamma(z: number): number {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.50734327868691, -0.1385710952657201,
    9.984369578019572e-6, 1.505632735149312e-7];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  let x = 0.9999999999998099;
  const shifted = z - 1;
  for (let i = 0; i < coefficients.length; i += 1) x += coefficients[i] / (shifted + i + 1);
  const t = shifted + coefficients.length - 0.5;
  return LOG_SQRT_TWO_PI + (shifted + 0.5) * Math.log(t) - t + Math.log(x);
}

function regularizedGammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) return Number.NaN;
  if (x === 0) return 1;
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    let ap = a;
    for (let n = 1; n <= 300; n += 1) {
      ap += 1;
      term *= x / ap;
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    const p = sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
    return 1 - p;
  }
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 300; i += 1) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIterations = 300;
  const tiny = 1e-300;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 3e-14) break;
  }
  return h;
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  return x < (a + 1) / (a + b + 2)
    ? front * betaContinuedFraction(a, b, x) / a
    : 1 - front * betaContinuedFraction(b, a, 1 - x) / b;
}

export function studentTPDF(x: number, degreesOfFreedom: number): number {
  assertFinite(x, 'x');
  assertDf(degreesOfFreedom);
  const v = degreesOfFreedom;
  const logCoefficient = logGamma((v + 1) / 2) - logGamma(v / 2) - 0.5 * Math.log(v * Math.PI);
  return Math.exp(logCoefficient - ((v + 1) / 2) * Math.log1p((x * x) / v));
}

export function studentTCDF(x: number, degreesOfFreedom: number): number {
  assertFinite(x, 'x');
  assertDf(degreesOfFreedom);
  if (x === 0) return 0.5;
  const beta = regularizedIncompleteBeta(degreesOfFreedom / (degreesOfFreedom + x * x), degreesOfFreedom / 2, 0.5);
  return clampProbability(x > 0 ? 1 - beta / 2 : beta / 2);
}

export function studentTInverseCDF(p: number, degreesOfFreedom: number): number {
  assertProbability(p);
  assertDf(degreesOfFreedom);
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  if (p === 0.5) return 0;
  if (p < 0.5) return -studentTInverseCDF(1 - p, degreesOfFreedom);
  let low = 0;
  let high = 1;
  while (studentTCDF(high, degreesOfFreedom) < p && high < Number.MAX_VALUE / 4) high *= 2;
  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    if (studentTCDF(mid, degreesOfFreedom) < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function distributionPDF(x: number, configuration: DistributionConfiguration): number {
  if (configuration.type === 'studentT') return studentTPDF(x, configuration.degreesOfFreedom);
  if (configuration.type === 'normal') return normalPDF(x, configuration.mean, configuration.standardDeviation);
  return normalPDF(x);
}

export function distributionCDF(x: number, configuration: DistributionConfiguration): number {
  if (configuration.type === 'studentT') return studentTCDF(x, configuration.degreesOfFreedom);
  if (configuration.type === 'normal') return normalCDF(x, configuration.mean, configuration.standardDeviation);
  return normalCDF(x);
}

export function distributionInverseCDF(p: number, configuration: DistributionConfiguration): number {
  if (configuration.type === 'studentT') return studentTInverseCDF(p, configuration.degreesOfFreedom);
  if (configuration.type === 'normal') return normalInverseCDF(p, configuration.mean, configuration.standardDeviation);
  return normalInverseCDF(p);
}

function assertBounds(a: number, b: number): void {
  assertFinite(a, 'lower bound');
  assertFinite(b, 'upper bound');
  if (a > b) throw new RangeError('lower bound must not exceed upper bound');
}

export function intervalProbability(a: number, b: number, configuration: DistributionConfiguration): number {
  assertBounds(a, b);
  return clampProbability(distributionCDF(b, configuration) - distributionCDF(a, configuration));
}

export function leftTailProbability(b: number, configuration: DistributionConfiguration): number {
  assertFinite(b, 'upper bound');
  return distributionCDF(b, configuration);
}

export function rightTailProbability(a: number, configuration: DistributionConfiguration): number {
  assertFinite(a, 'lower bound');
  return clampProbability(1 - distributionCDF(a, configuration));
}

export function outsideIntervalProbability(a: number, b: number, configuration: DistributionConfiguration): number {
  assertBounds(a, b);
  return clampProbability(distributionCDF(a, configuration) + 1 - distributionCDF(b, configuration));
}

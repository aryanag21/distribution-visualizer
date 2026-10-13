import { describe, expect, it } from 'vitest';
import {
  distributionCDF,
  intervalProbability,
  leftTailProbability,
  normalCDF,
  normalInverseCDF,
  normalPDF,
  outsideIntervalProbability,
  rightTailProbability,
  studentTCDF,
  studentTInverseCDF,
  studentTPDF,
} from '../statistics/statisticsEngine';

const z = { type: 'standardNormal' } as const;

describe('normal distribution', () => {
  it('calculates PDF and CDF reference values', () => {
    expect(normalPDF(0)).toBeCloseTo(0.3989422804014327, 12);
    expect(normalCDF(0)).toBeCloseTo(0.5, 12);
    expect(normalCDF(1)).toBeCloseTo(0.8413447460685429, 7);
    expect(normalPDF(2, 1, 2)).toBeCloseTo(0.17603266338214976, 12);
  });

  it('inverts the CDF including tails', () => {
    expect(normalInverseCDF(0.975)).toBeCloseTo(1.959963984540054, 6);
    expect(normalInverseCDF(0.001)).toBeCloseTo(-3.090232306167813, 6);
    expect(normalInverseCDF(0.5, 7, 2)).toBeCloseTo(7, 12);
  });
});

describe("Student's t distribution", () => {
  it('calculates PDF and CDF reference values', () => {
    expect(studentTPDF(0, 1)).toBeCloseTo(1 / Math.PI, 12);
    expect(studentTCDF(0, 1)).toBe(0.5);
    expect(studentTCDF(1, 1)).toBeCloseTo(0.75, 12);
    expect(studentTCDF(2.015048, 5)).toBeCloseTo(0.95, 6);
  });

  it('inverts the CDF', () => {
    expect(studentTInverseCDF(0.975, 5)).toBeCloseTo(2.570581835636305, 8);
    expect(studentTInverseCDF(0.95, 1)).toBeCloseTo(6.313751514675041, 8);
  });

  it('approaches the standard normal at high degrees of freedom', () => {
    expect(studentTCDF(1.5, 1_000_000)).toBeCloseTo(normalCDF(1.5), 5);
  });
});

describe('probability helpers', () => {
  it('calculates interval probabilities', () => {
    expect(intervalProbability(-1, 1, z)).toBeCloseTo(0.6826894921, 7);
    expect(intervalProbability(-1.96, 1.96, z)).toBeCloseTo(0.9500042097, 7);
  });

  it('calculates tails and outside intervals', () => {
    expect(leftTailProbability(0, z)).toBeCloseTo(0.5, 12);
    expect(rightTailProbability(0, z)).toBeCloseTo(0.5, 12);
    expect(outsideIntervalProbability(-1, 1, z)).toBeCloseTo(1 - 0.6826894921, 7);
  });

  it('supports extreme valid inputs', () => {
    expect(normalCDF(-12)).toBeGreaterThanOrEqual(0);
    expect(studentTCDF(100, 0.5)).toBeLessThanOrEqual(1);
    expect(distributionCDF(0, { type: 'studentT', degreesOfFreedom: 0.5 })).toBe(0.5);
  });

  it('rejects invalid inputs and reversed bounds', () => {
    expect(() => normalPDF(0, 0, 0)).toThrow(/greater than zero/);
    expect(() => studentTCDF(0, -1)).toThrow(/greater than zero/);
    expect(() => normalInverseCDF(1.1)).toThrow(/probability/);
    expect(() => intervalProbability(2, 1, z)).toThrow(/lower bound/);
  });
});

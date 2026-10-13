import { distributionPDF } from '../statistics/statisticsEngine';
import type { Bounds, DistributionConfiguration, ProbabilityMode } from '../types/distribution';

export type GraphPoint = { x: number; y: number };
export type Domain = { min: number; max: number };

export function automaticDomain(
  configuration: DistributionConfiguration,
  bounds: Bounds,
  zoom = 1,
): Domain {
  let centre = 0;
  let radius = 4;
  if (configuration.type === 'normal') {
    centre = configuration.mean;
    radius = 4 * configuration.standardDeviation;
  } else if (configuration.type === 'studentT') {
    radius = configuration.degreesOfFreedom <= 2 ? 8 : configuration.degreesOfFreedom < 10 ? 6 : 5;
  }
  radius *= zoom;
  const padding = Math.max(radius * 0.08, 0.25);
  return {
    min: Math.min(centre - radius, bounds.lower - padding),
    max: Math.max(centre + radius, bounds.upper + padding),
  };
}

export function sampleDensity(configuration: DistributionConfiguration, domain: Domain, samples = 360): GraphPoint[] {
  return Array.from({ length: samples + 1 }, (_, index) => {
    const x = domain.min + (index / samples) * (domain.max - domain.min);
    return { x, y: distributionPDF(x, configuration) };
  });
}

export function niceTicks(domain: Domain, target = 8): number[] {
  const span = domain.max - domain.min;
  const rough = span / target;
  const exponent = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = nice * exponent;
  const first = Math.ceil(domain.min / step) * step;
  const result: number[] = [];
  for (let value = first; value <= domain.max + step * 1e-6; value += step) result.push(value);
  return result;
}

export function isXShaded(x: number, mode: ProbabilityMode, bounds: Bounds): boolean {
  if (mode === 'left') return x <= bounds.upper;
  if (mode === 'right') return x >= bounds.lower;
  if (mode === 'outside') return x <= bounds.lower || x >= bounds.upper;
  return x >= bounds.lower && x <= bounds.upper;
}

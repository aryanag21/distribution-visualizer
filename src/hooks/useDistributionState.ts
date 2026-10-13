import { useMemo, useState } from 'react';
import {
  distributionCDF,
  distributionInverseCDF,
  intervalProbability,
  leftTailProbability,
  outsideIntervalProbability,
  rightTailProbability,
} from '../statistics/statisticsEngine';
import type {
  Bounds,
  DistributionConfiguration,
  DistributionType,
  ProbabilityMode,
  ScaleMode,
} from '../types/distribution';

type SavedConfiguration = {
  configuration: DistributionConfiguration;
  bounds: Bounds;
  mode: ProbabilityMode;
};

const defaults: Record<DistributionType, SavedConfiguration> = {
  normal: { configuration: { type: 'normal', mean: 0, standardDeviation: 1 }, bounds: { lower: -1, upper: 1 }, mode: 'between' },
  studentT: { configuration: { type: 'studentT', degreesOfFreedom: 5 }, bounds: { lower: -1, upper: 1 }, mode: 'between' },
  standardNormal: { configuration: { type: 'standardNormal' }, bounds: { lower: -1, upper: 1 }, mode: 'between' },
};

export type DistributionState = ReturnType<typeof useDistributionState>;

export function useDistributionState() {
  const [saved, setSaved] = useState(defaults);
  const [activeType, setActiveType] = useState<DistributionType>('normal');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('standardDeviation');
  const [precision, setPrecision] = useState(6);
  const active = saved[activeType];

  const updateActive = (updater: (current: SavedConfiguration) => SavedConfiguration) => {
    setSaved((current) => ({ ...current, [activeType]: updater(current[activeType]) }));
  };

  const setDistribution = (type: DistributionType) => setActiveType(type);
  const setMode = (mode: ProbabilityMode) => updateActive((current) => ({ ...current, mode }));
  const setBounds = (bounds: Bounds) => updateActive((current) => ({ ...current, bounds }));
  const setLower = (lower: number) => updateActive((current) => ({
    ...current,
    bounds: { lower, upper: Math.max(lower, current.bounds.upper) },
  }));
  const setUpper = (upper: number) => updateActive((current) => ({
    ...current,
    bounds: { lower: Math.min(upper, current.bounds.lower), upper },
  }));

  const setMean = (mean: number) => updateActive((current) => current.configuration.type === 'normal'
    ? { ...current, configuration: { ...current.configuration, mean } }
    : current);
  const setStandardDeviation = (standardDeviation: number) => {
    if (standardDeviation <= 0 || !Number.isFinite(standardDeviation)) return;
    updateActive((current) => current.configuration.type === 'normal'
      ? { ...current, configuration: { ...current.configuration, standardDeviation } }
      : current);
  };
  const setVariance = (variance: number) => {
    if (variance <= 0 || !Number.isFinite(variance)) return;
    setStandardDeviation(Math.sqrt(variance));
  };
  const setDegreesOfFreedom = (degreesOfFreedom: number) => {
    if (degreesOfFreedom <= 0 || !Number.isFinite(degreesOfFreedom)) return;
    updateActive((current) => current.configuration.type === 'studentT'
      ? { ...current, configuration: { ...current.configuration, degreesOfFreedom } }
      : current);
  };

  const probability = useMemo(() => {
    const { lower, upper } = active.bounds;
    switch (active.mode) {
      case 'left': return leftTailProbability(upper, active.configuration);
      case 'right': return rightTailProbability(lower, active.configuration);
      case 'outside': return outsideIntervalProbability(lower, upper, active.configuration);
      default: return intervalProbability(lower, upper, active.configuration);
    }
  }, [active]);

  const cumulative = useMemo(() => ({
    lower: distributionCDF(active.bounds.lower, active.configuration),
    upper: distributionCDF(active.bounds.upper, active.configuration),
  }), [active]);

  const setInverseProbability = (p: number, target: 'lower' | 'upper') => {
    if (!(p > 0 && p < 1)) return;
    const value = distributionInverseCDF(p, active.configuration);
    if (target === 'lower') setLower(value);
    else setUpper(value);
  };

  const applyPreset = (preset: string) => {
    const update = (type: DistributionType, configuration: DistributionConfiguration, bounds: Bounds, mode: ProbabilityMode = 'between') => {
      setSaved((current) => ({ ...current, [type]: { configuration, bounds, mode } }));
      setActiveType(type);
    };
    switch (preset) {
      case 'normal-5-2': update('normal', { type: 'normal', mean: 5, standardDeviation: 2 }, { lower: 3, upper: 7 }); break;
      case 'narrow': update('normal', { type: 'normal', mean: 0, standardDeviation: 0.5 }, { lower: -0.5, upper: 0.5 }); break;
      case 'wide': update('normal', { type: 'normal', mean: 0, standardDeviation: 3 }, { lower: -3, upper: 3 }); break;
      case 't1': update('studentT', { type: 'studentT', degreesOfFreedom: 1 }, { lower: -1, upper: 1 }); break;
      case 't5': update('studentT', { type: 'studentT', degreesOfFreedom: 5 }, { lower: -1, upper: 1 }); break;
      case 't30': update('studentT', { type: 'studentT', degreesOfFreedom: 30 }, { lower: -1, upper: 1 }); break;
      case 'central68': update('standardNormal', { type: 'standardNormal' }, { lower: -1, upper: 1 }); break;
      case 'central95': update('standardNormal', { type: 'standardNormal' }, { lower: -1.96, upper: 1.96 }); break;
      case 'left': update('standardNormal', { type: 'standardNormal' }, { lower: -1, upper: 1.645 }, 'left'); break;
      case 'right': update('standardNormal', { type: 'standardNormal' }, { lower: 1.645, upper: 2 }, 'right'); break;
      default: update('standardNormal', { type: 'standardNormal' }, { lower: -1, upper: 1 });
    }
  };

  return {
    activeType, configuration: active.configuration, bounds: active.bounds, mode: active.mode,
    probability, cumulative, scaleMode, precision,
    setDistribution, setMode, setBounds, setLower, setUpper, setMean,
    setStandardDeviation, setVariance, setDegreesOfFreedom, setScaleMode,
    setPrecision, setInverseProbability, applyPreset,
  };
}

export type DistributionType = 'normal' | 'studentT' | 'standardNormal';
export type ProbabilityMode = 'between' | 'left' | 'right' | 'outside';
export type ScaleMode = 'standardDeviation' | 'variance';

export type NormalConfiguration = {
  type: 'normal';
  mean: number;
  standardDeviation: number;
};

export type StudentTConfiguration = {
  type: 'studentT';
  degreesOfFreedom: number;
};

export type StandardNormalConfiguration = { type: 'standardNormal' };

export type DistributionConfiguration =
  | NormalConfiguration
  | StudentTConfiguration
  | StandardNormalConfiguration;

export type Bounds = { lower: number; upper: number };

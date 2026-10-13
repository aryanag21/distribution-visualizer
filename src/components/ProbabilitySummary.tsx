import type { Bounds, DistributionConfiguration, ProbabilityMode } from '../types/distribution';
import { FormulaDisplay } from './FormulaDisplay';

type Props = {
  probability: number;
  bounds: Bounds;
  configuration: DistributionConfiguration;
  mode: ProbabilityMode;
  cumulative: { lower: number; upper: number };
  precision: number;
  onPrecisionChange: (value: number) => void;
};

function nameFor(configuration: DistributionConfiguration): string {
  if (configuration.type === 'studentT') return "Student's t";
  if (configuration.type === 'standardNormal') return 'Standard normal (Z)';
  return 'Normal';
}

function parameterText(configuration: DistributionConfiguration): string {
  if (configuration.type === 'studentT') {
    const v = configuration.degreesOfFreedom;
    const variance = v > 2 ? (v / (v - 2)).toPrecision(5) : v > 1 ? '∞' : 'undefined';
    return `ν = ${v}; variance = ${variance}`;
  }
  if (configuration.type === 'standardNormal') return 'μ = 0; σ = 1; σ² = 1';
  return `μ = ${configuration.mean}; σ = ${configuration.standardDeviation}; σ² = ${(configuration.standardDeviation ** 2).toPrecision(6)}`;
}

export function ProbabilitySummary({ probability, bounds, configuration, mode, cumulative, precision, onPrecisionChange }: Props) {
  return (
    <section className="results" aria-labelledby="result-heading" aria-live="polite">
      <div className="result-heading-row">
        <div>
          <span className="eyebrow" id="result-heading">Probability</span>
          <strong className="probability-value">{probability.toFixed(precision)}</strong>
        </div>
        <strong className="percentage">{(probability * 100).toFixed(Math.min(precision, 4))}%</strong>
      </div>
      <FormulaDisplay mode={mode} />
      <dl className="result-detail">
        <div><dt>Distribution</dt><dd>{nameFor(configuration)}</dd></div>
        <div><dt>Bounds</dt><dd>{bounds.lower.toPrecision(5)} → {bounds.upper.toPrecision(5)}</dd></div>
        <div><dt>Parameters</dt><dd>{parameterText(configuration)}</dd></div>
        <div><dt>F(a), F(b)</dt><dd>{cumulative.lower.toFixed(5)}, {cumulative.upper.toFixed(5)}</dd></div>
      </dl>
      <label className="precision-control">Decimal precision
        <select value={precision} onChange={(event) => onPrecisionChange(Number(event.target.value))}>
          {[3, 4, 5, 6, 8, 10].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      {configuration.type === 'studentT' && (
        <p className="microcopy">Variance is finite for ν &gt; 2, infinite for 1 &lt; ν ≤ 2, and undefined for ν ≤ 1.</p>
      )}
    </section>
  );
}

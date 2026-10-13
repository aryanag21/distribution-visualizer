import { useState } from 'react';
import type { DistributionState } from '../hooks/useDistributionState';
import { AnimationPanel } from './AnimationPanel';
import { DistributionSelector } from './DistributionSelector';
import { ParameterControl } from './ParameterControl';
import { PresetSelector } from './PresetSelector';
import { ProbabilityBounds } from './ProbabilityBounds';
import { ProbabilityModeSelector } from './ProbabilityModeSelector';
import { ProbabilitySummary } from './ProbabilitySummary';

export function DistributionSidebar({ state }: { state: DistributionState }) {
  const [inverseInput, setInverseInput] = useState(0.95);
  const config = state.configuration;
  return (
    <aside className="sidebar" id="control-panel">
      <header className="brand-row">
        <a className="brand" href="#" aria-label="DIST LAB home"><span>DIST</span><i>/</i><span>LAB</span></a>
        <span className="edition">PROBABILITY</span>
      </header>
      <div className="sidebar-content">
        <section className="control-section">
          <span className="section-index">01</span><h2>Distribution</h2>
          <DistributionSelector value={state.activeType} onChange={state.setDistribution} />
          <PresetSelector onSelect={state.applyPreset} />
        </section>

        <section className="control-section">
          <span className="section-index">02</span><h2>Parameters</h2>
          {config.type === 'normal' && (
            <>
              <ParameterControl id="mean" label="Mean" symbol="μ" value={config.mean} min={-10} max={10} step={0.1} onChange={state.setMean} />
              <div className="scale-switch" role="group" aria-label="Normal scale parameter">
                <button className={state.scaleMode === 'standardDeviation' ? 'active' : ''} onClick={() => state.setScaleMode('standardDeviation')} type="button">Standard deviation</button>
                <button className={state.scaleMode === 'variance' ? 'active' : ''} onClick={() => state.setScaleMode('variance')} type="button">Variance</button>
              </div>
              {state.scaleMode === 'standardDeviation'
                ? <ParameterControl id="standard-deviation" label="Standard deviation" symbol="σ" value={config.standardDeviation} min={0.1} max={6} step={0.05} onChange={state.setStandardDeviation} error={config.standardDeviation <= 0 ? 'Must be greater than zero.' : undefined} />
                : <ParameterControl id="variance" label="Variance" symbol="σ²" value={config.standardDeviation ** 2} min={0.01} max={36} step={0.01} onChange={state.setVariance} />}
            </>
          )}
          {config.type === 'studentT' && (
            <>
              <ParameterControl id="degrees-freedom" label="Degrees of freedom" symbol="ν" value={config.degreesOfFreedom} min={0.5} max={100} step={0.5} onChange={state.setDegreesOfFreedom} />
              <p className="microcopy">Positive real values are supported; integer degrees of freedom are most common in introductory statistics.</p>
            </>
          )}
          {config.type === 'standardNormal' && <p className="fixed-parameters">Fixed parameters <span>μ = 0</span><span>σ = 1</span></p>}
        </section>

        <section className="control-section">
          <span className="section-index">03</span><h2>Probability</h2>
          <ProbabilityModeSelector value={state.mode} onChange={state.setMode} />
          <ProbabilityBounds bounds={state.bounds} mode={state.mode} onLowerChange={state.setLower} onUpperChange={state.setUpper} />
          <details className="inverse-control">
            <summary>Find a critical value</summary>
            <div>
              <label htmlFor="inverse-probability">Cumulative probability p</label>
              <input id="inverse-probability" type="number" min="0.000001" max="0.999999" step="0.001" value={inverseInput} onChange={(event) => setInverseInput(event.target.valueAsNumber)} />
              <div className="inverse-actions">
                <button type="button" onClick={() => state.setInverseProbability(inverseInput, 'lower')}>Set a = F⁻¹(p)</button>
                <button type="button" onClick={() => state.setInverseProbability(inverseInput, 'upper')}>Set b = F⁻¹(p)</button>
              </div>
            </div>
          </details>
        </section>

        <ProbabilitySummary probability={state.probability} bounds={state.bounds} configuration={state.configuration} mode={state.mode} cumulative={state.cumulative} precision={state.precision} onPrecisionChange={state.setPrecision} />
        <AnimationPanel />
      </div>
    </aside>
  );
}

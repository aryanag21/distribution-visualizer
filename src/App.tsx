import { useState } from 'react';
import { DistributionGraph } from './components/DistributionGraph';
import { DistributionSidebar } from './components/DistributionSidebar';
import { useDistributionState } from './hooks/useDistributionState';

export default function App() {
  const state = useDistributionState();
  const [controlsOpen, setControlsOpen] = useState(false);
  return (
    <main className={`app-shell ${controlsOpen ? 'controls-open' : ''}`}>
      <button className="mobile-controls" type="button" onClick={() => setControlsOpen((value) => !value)} aria-expanded={controlsOpen} aria-controls="control-panel">
        {controlsOpen ? 'Close controls' : 'Open controls'}
      </button>
      <DistributionSidebar state={state} />
      <section className="visualisation" aria-label="Distribution visualisation">
        <header className="canvas-header">
          <div><span>LIVE DISTRIBUTION</span><strong>{state.configuration.type === 'studentT' ? "Student's t" : state.configuration.type === 'standardNormal' ? 'Standard normal' : 'Normal'}</strong></div>
          <p>Drag <b>a</b> and <b>b</b> on the curve</p>
        </header>
        <DistributionGraph configuration={state.configuration} bounds={state.bounds} mode={state.mode} probability={state.probability} precision={state.precision} onLowerChange={state.setLower} onUpperChange={state.setUpper} />
      </section>
      {controlsOpen && <button className="drawer-scrim" type="button" aria-label="Close controls" onClick={() => setControlsOpen(false)} />}
    </main>
  );
}

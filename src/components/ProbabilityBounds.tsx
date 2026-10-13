import type { Bounds, ProbabilityMode } from '../types/distribution';
import { ParameterControl } from './ParameterControl';

type Props = {
  bounds: Bounds;
  mode: ProbabilityMode;
  onLowerChange: (value: number) => void;
  onUpperChange: (value: number) => void;
};

export function ProbabilityBounds({ bounds, mode, onLowerChange, onUpperChange }: Props) {
  const showLower = mode !== 'left';
  const showUpper = mode !== 'right';
  return (
    <div className="bounds-controls">
      {showLower && <ParameterControl id="lower-bound" label="Lower bound" symbol="a" value={bounds.lower} min={-8} max={8} step={0.01} onChange={onLowerChange} />}
      {showUpper && <ParameterControl id="upper-bound" label="Upper bound" symbol="b" value={bounds.upper} min={-8} max={8} step={0.01} onChange={onUpperChange} />}
    </div>
  );
}

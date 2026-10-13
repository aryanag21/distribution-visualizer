import type { ProbabilityMode } from '../types/distribution';

type Props = { value: ProbabilityMode; onChange: (value: ProbabilityMode) => void };
const modes: { value: ProbabilityMode; label: string; notation: string }[] = [
  { value: 'between', label: 'Between', notation: 'a ≤ X ≤ b' },
  { value: 'left', label: 'Left tail', notation: 'X ≤ b' },
  { value: 'right', label: 'Right tail', notation: 'X ≥ a' },
  { value: 'outside', label: 'Outside', notation: 'X < a or X > b' },
];

export function ProbabilityModeSelector({ value, onChange }: Props) {
  return (
    <fieldset className="mode-grid">
      <legend className="visually-hidden">Probability mode</legend>
      {modes.map((mode) => (
        <label key={mode.value} className={value === mode.value ? 'selected' : ''}>
          <input type="radio" name="probability-mode" checked={value === mode.value} onChange={() => onChange(mode.value)} />
          <span>{mode.label}</span><small>{mode.notation}</small>
        </label>
      ))}
    </fieldset>
  );
}

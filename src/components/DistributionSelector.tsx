import type { DistributionType } from '../types/distribution';

type Props = { value: DistributionType; onChange: (value: DistributionType) => void };

const options: { value: DistributionType; label: string; short: string }[] = [
  { value: 'normal', label: 'Normal distribution', short: 'Normal' },
  { value: 'studentT', label: "Student's t distribution", short: "Student's t" },
  { value: 'standardNormal', label: 'Standard normal distribution', short: 'Z distribution' },
];

export function DistributionSelector({ value, onChange }: Props) {
  return (
    <fieldset className="segmented distribution-selector">
      <legend className="visually-hidden">Distribution</legend>
      {options.map((option) => (
        <label key={option.value} className={value === option.value ? 'selected' : ''} title={option.label}>
          <input type="radio" name="distribution" value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          {option.short}
        </label>
      ))}
    </fieldset>
  );
}

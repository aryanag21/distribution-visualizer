type ParameterControlProps = {
  id: string;
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  error?: string;
};

export function ParameterControl({ id, label, symbol, value, min, max, step, onChange, error }: ParameterControlProps) {
  const display = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(8)));
  const [draft, setDraft] = useState(display);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(display);
  }, [display, focused]);
  return (
    <div className="parameter-control">
      <div className="control-heading">
        <label htmlFor={`${id}-number`}>{label}</label>
        {symbol && <span className="symbol" aria-hidden="true">{symbol}</span>}
      </div>
      <div className="linked-inputs">
        <input
          id={`${id}-range`}
          aria-label={`${label} slider`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        />
        <input
          id={`${id}-number`}
          className={error ? 'invalid' : ''}
          type="number"
          step={step}
          value={draft}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
            const next = Number(event.currentTarget.value);
            if (event.currentTarget.value !== '' && Number.isFinite(next)) onChange(next);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setDraft(display); }}
        />
      </div>
      {error && <p className="input-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
import { useEffect, useState } from 'react';

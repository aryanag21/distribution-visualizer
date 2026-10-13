import type { ProbabilityMode } from '../types/distribution';

const formulas: Record<ProbabilityMode, string> = {
  between: 'P(a ≤ X ≤ b) = F(b) − F(a)',
  left: 'P(X ≤ b) = F(b)',
  right: 'P(X ≥ a) = 1 − F(a)',
  outside: 'P(X < a or X > b) = F(a) + 1 − F(b)',
};

export function FormulaDisplay({ mode }: { mode: ProbabilityMode }) {
  return <p className="formula">{formulas[mode]}</p>;
}

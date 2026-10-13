import { niceTicks, type Domain } from '../graph/graphGeometry';

type Props = { domain: Domain; width: number; height: number; padding: number; showGrid: boolean };

export function GraphAxis({ domain, width, height, padding, showGrid }: Props) {
  const graphWidth = width - padding * 2;
  const xFor = (x: number) => padding + ((x - domain.min) / (domain.max - domain.min)) * graphWidth;
  const baseline = height - padding;
  return (
    <g className="graph-axis" aria-hidden="true">
      {showGrid && niceTicks(domain).map((tick) => <line key={`grid-${tick}`} className="grid-line" x1={xFor(tick)} y1={padding} x2={xFor(tick)} y2={baseline} />)}
      <line className="baseline" x1={padding} y1={baseline} x2={width - padding} y2={baseline} />
      {niceTicks(domain).map((tick) => (
        <g key={tick} transform={`translate(${xFor(tick)} ${baseline})`}>
          <line className="tick" y2="7" />
          <text className="tick-label" y="23" textAnchor="middle">{Math.abs(tick) < 1e-10 ? '0' : Number(tick.toPrecision(4))}</text>
        </g>
      ))}
    </g>
  );
}

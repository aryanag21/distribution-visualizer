import { useRef } from 'react';

type Props = {
  label: string;
  value: number;
  x: number;
  top: number;
  bottom: number;
  domainMin: number;
  domainMax: number;
  graphLeft: number;
  graphRight: number;
  onChange: (value: number) => void;
};

export function DraggableBoundary({ label, value, x, top, bottom, domainMin, domainMax, graphLeft, graphRight, onChange }: Props) {
  const frame = useRef<number | null>(null);
  const nextValue = useRef(value);
  const update = (clientX: number, element: SVGElement) => {
    const svg = element.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
    const ratio = Math.max(0, Math.min(1, (svgX - graphLeft) / (graphRight - graphLeft)));
    nextValue.current = domainMin + ratio * (domainMax - domainMin);
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        onChange(Number(nextValue.current.toPrecision(8)));
        frame.current = null;
      });
    }
  };
  return (
    <g
      className="boundary"
      role="slider"
      aria-label={`${label} boundary`}
      aria-valuemin={domainMin}
      aria-valuemax={domainMax}
      aria-valuenow={value}
      tabIndex={0}
      transform={`translate(${x} 0)`}
      onKeyDown={(event) => {
        const step = (domainMax - domainMin) / 100;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); onChange(value - step); }
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); onChange(value + step); }
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event.clientX, event.currentTarget);
      }}
    >
      <line className="boundary-line" y1={top} y2={bottom} />
      <circle className="boundary-handle" cy={bottom} r="7" />
      <g className="boundary-label" transform={`translate(0 ${top + 14})`}>
        <rect x="-24" y="-13" width="48" height="22" rx="2" />
        <text textAnchor="middle" y="3">{label} {Number(value.toPrecision(4))}</text>
      </g>
    </g>
  );
}

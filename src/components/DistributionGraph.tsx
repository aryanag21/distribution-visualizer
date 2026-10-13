import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { automaticDomain, sampleDensity } from '../graph/graphGeometry';
import { normalPDF } from '../statistics/statisticsEngine';
import type { Bounds, DistributionConfiguration, ProbabilityMode } from '../types/distribution';
import { DraggableBoundary } from './DraggableBoundary';
import { GraphAxis } from './GraphAxis';

type Props = {
  configuration: DistributionConfiguration;
  bounds: Bounds;
  mode: ProbabilityMode;
  probability: number;
  precision: number;
  onLowerChange: (value: number) => void;
  onUpperChange: (value: number) => void;
};

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 900, height: 620 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.max(320, entry.contentRect.width), height: Math.max(360, entry.contentRect.height) });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export function DistributionGraph({ configuration, bounds, mode, probability, precision, onLowerChange, onUpperChange }: Props) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const clipId = useId().replace(/:/g, '');
  const domain = useMemo(() => automaticDomain(configuration, bounds, zoom), [configuration, bounds, zoom]);
  const points = useMemo(() => sampleDensity(configuration, domain), [configuration, domain]);
  const padding = size.width < 600 ? 38 : 64;
  const plotTop = 64;
  const baseline = size.height - padding;
  const graphWidth = size.width - padding * 2;
  const graphHeight = baseline - plotTop;
  const yMax = Math.max(...points.map((point) => point.y)) * 1.15;
  const xFor = (x: number) => padding + ((x - domain.min) / (domain.max - domain.min)) * graphWidth;
  const yFor = (y: number) => baseline - (y / yMax) * graphHeight;
  const curvePath = points.map((point, index) => `${index ? 'L' : 'M'} ${xFor(point.x).toFixed(2)} ${yFor(point.y).toFixed(2)}`).join(' ');
  const areaPath = `${curvePath} L ${xFor(domain.max)} ${baseline} L ${xFor(domain.min)} ${baseline} Z`;
  const centre = configuration.type === 'normal' ? configuration.mean : 0;
  const comparePath = configuration.type === 'studentT'
    ? points.map((point, index) => `${index ? 'L' : 'M'} ${xFor(point.x).toFixed(2)} ${yFor(normalPDF(point.x)).toFixed(2)}`).join(' ')
    : null;

  const lowerX = xFor(bounds.lower);
  const upperX = xFor(bounds.upper);
  const clipRects = mode === 'left'
    ? [{ x: padding, width: upperX - padding }]
    : mode === 'right'
      ? [{ x: lowerX, width: size.width - padding - lowerX }]
      : mode === 'outside'
        ? [{ x: padding, width: lowerX - padding }, { x: upperX, width: size.width - padding - upperX }]
        : [{ x: lowerX, width: upperX - lowerX }];

  return (
    <div className="graph-container" ref={containerRef}>
      <div className="graph-toolbar">
        <button type="button" onClick={() => setShowGrid((value) => !value)} aria-pressed={showGrid}>Grid</button>
        <button type="button" onClick={() => setZoom((value) => Math.min(2.5, value * 1.25))} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.55, value / 1.25))} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => setZoom(1)}>Reset view</button>
      </div>
      <svg className="distribution-graph" viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-labelledby={`${clipId}-title ${clipId}-description`}>
        <title id={`${clipId}-title`}>Interactive probability density graph</title>
        <desc id={`${clipId}-description`}>Density curve with draggable probability boundaries. Current probability is {probability.toFixed(precision)}.</desc>
        <defs>
          <clipPath id={`${clipId}-shade`}>
            {clipRects.map((rect, index) => <rect key={index} x={Math.max(padding, rect.x)} y={plotTop} width={Math.max(0, rect.width)} height={graphHeight} />)}
          </clipPath>
        </defs>
        <GraphAxis domain={domain} width={size.width} height={size.height} padding={padding} showGrid={showGrid} />
        <line className="centre-line" x1={xFor(centre)} y1={plotTop + 20} x2={xFor(centre)} y2={baseline} />
        <text className="centre-label" x={xFor(centre)} y={plotTop + 10} textAnchor="middle">{configuration.type === 'normal' ? `μ = ${centre}` : 'centre = 0'}</text>
        {comparePath && <path className="comparison-curve" d={comparePath} />}
        <path className="probability-area" d={areaPath} clipPath={`url(#${clipId}-shade)`} />
        <path className="density-curve" d={curvePath} />
        {mode !== 'left' && (
          <DraggableBoundary label="a" value={bounds.lower} x={lowerX} top={plotTop} bottom={baseline} domainMin={domain.min} domainMax={domain.max} graphLeft={padding} graphRight={size.width - padding} onChange={onLowerChange} />
        )}
        {mode !== 'right' && (
          <DraggableBoundary label="b" value={bounds.upper} x={upperX} top={plotTop} bottom={baseline} domainMin={domain.min} domainMax={domain.max} graphLeft={padding} graphRight={size.width - padding} onChange={onUpperChange} />
        )}
      </svg>
      <div className="graph-probability" aria-hidden="true">
        <span>AREA</span>
        <strong>{probability.toFixed(precision)}</strong>
      </div>
      {configuration.type === 'studentT' && <div className="curve-legend"><span className="legend-t" /> t <span className="legend-normal" /> standard normal</div>}
    </div>
  );
}

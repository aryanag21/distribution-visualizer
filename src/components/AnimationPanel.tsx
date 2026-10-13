import { useState } from 'react';
import { animationManifest } from '../animations/animationManifest';

export function AnimationPanel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(animationManifest[0]);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  return (
    <section className="learn-panel">
      <button className="text-button panel-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>Learn visually</span><span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="animation-content">
          <select aria-label="Educational animation" value={selected.id} onChange={(event) => {
            setSelected(animationManifest.find((entry) => entry.id === event.target.value) ?? animationManifest[0]);
            setVideoUnavailable(false);
          }}>
            {animationManifest.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}
          </select>
          <p>{selected.description}</p>
          {!videoUnavailable ? (
            <video key={selected.video} controls preload="metadata" onError={() => setVideoUnavailable(true)}>
              <source src={selected.video} type="video/mp4" />
            </video>
          ) : (
            <div className="video-placeholder">Animation source included. Render with Manim to view this lesson.</div>
          )}
        </div>
      )}
    </section>
  );
}

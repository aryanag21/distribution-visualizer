export function PresetSelector({ onSelect }: { onSelect: (preset: string) => void }) {
  return (
    <label className="select-label" htmlFor="preset-select">Preset
      <select id="preset-select" defaultValue="" onChange={(event) => {
        if (event.target.value) onSelect(event.target.value);
        event.target.value = '';
      }}>
        <option value="" disabled>Choose a preset…</option>
        <option value="standard">Standard normal</option>
        <option value="normal-5-2">Normal · μ 5, σ 2</option>
        <option value="narrow">Narrow normal</option>
        <option value="wide">Wide normal</option>
        <option value="t1">Student's t · ν 1</option>
        <option value="t5">Student's t · ν 5</option>
        <option value="t30">Student's t · ν 30</option>
        <option value="central68">Central 68%</option>
        <option value="central95">Central 95%</option>
        <option value="left">Left tail · 95%</option>
        <option value="right">Right tail · 5%</option>
      </select>
    </label>
  );
}

# DIST / LAB

A responsive, browser-local probability distribution visualiser for normal, standard-normal, and Student's t distributions. The graph is custom SVG; numerical calculations are independent from the visible viewport.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Verify

```bash
npm test
npm run build
```

The Vitest suite covers reference PDF/CDF/inverse-CDF values, probability modes, invalid inputs, extreme values, linked variance controls, distribution state preservation, and graph keyboard interaction.

## Educational animations

The frontend's lesson panel remains functional when videos have not been rendered. Install [Manim Community Edition](https://docs.manim.community/) separately, then render a scene from the project root:

```bash
manim -qm --format=mp4 --media_dir public/animations \
  manim/scenes/distribution_scenes.py NormalDistributionBasics
```

Render the ten scene names listed in `manim/render_config.py`, then copy or rename the resulting MP4 files to the paths declared in `public/animations/animation-manifest.json`. Manim is intentionally not part of the frontend dependency tree and is never invoked during live calculator interaction.

## Mathematical implementation

- Normal density and CDF use direct density evaluation and a stable complementary-error-function form.
- Normal quantiles use Acklam's rational approximation with Newton refinement.
- Student's t density uses a Lanczos log-gamma implementation.
- Student's t CDF uses the regularized incomplete beta function with a continued fraction; quantiles use symmetric bracketing and bisection.
- Invalid parameters and reversed bounds throw explicit `RangeError`s.

All probability helpers compute from the mathematical distribution, not from sampled SVG geometry.

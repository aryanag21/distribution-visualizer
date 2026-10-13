export type AnimationEntry = { id: string; title: string; description: string; video: string };

export const animationManifest: AnimationEntry[] = [
  { id: 'normal-basics', title: 'Normal distribution basics', description: 'Read the bell curve as a probability density.', video: '/animations/normal-distribution-basics.mp4' },
  { id: 'mean-shift', title: 'Moving the mean', description: 'See how μ translates the entire distribution.', video: '/animations/mean-shift.mp4' },
  { id: 'spread', title: 'Standard deviation & spread', description: 'Connect σ to width and peak height.', video: '/animations/standard-deviation-and-spread.mp4' },
  { id: 'area', title: 'Area under the curve', description: 'Probability is area, and total area is one.', video: '/animations/area-under-curve.mp4' },
  { id: 'heavy-tails', title: "Student's t heavy tails", description: 'Compare tail mass with the normal curve.', video: '/animations/student-t-heavy-tails.mp4' },
  { id: 'convergence', title: 't converges to normal', description: 'Increase ν and watch the t curve converge.', video: '/animations/student-t-converges-to-normal.mp4' },
  { id: 'z-score', title: 'Z-score standardisation', description: 'Transform X into standard-normal units.', video: '/animations/z-score-standardisation.mp4' },
  { id: 'bounds', title: 'Probability bounds', description: 'Translate inequalities into shaded areas.', video: '/animations/probability-bounds.mp4' },
  { id: 'rule-68', title: 'The central 68% rule', description: 'One standard deviation around the mean.', video: '/animations/central-68-rule.mp4' },
  { id: 'rule-95', title: 'The central 95% rule', description: 'About two standard deviations around the mean.', video: '/animations/central-95-rule.mp4' },
];

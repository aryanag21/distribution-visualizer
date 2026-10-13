"""Render all DIST / LAB educational scenes at a web-friendly resolution.

Run from the project root:
    manim -qm --format=mp4 --media_dir public/animations manim/scenes/distribution_scenes.py SceneName

The frontend is deliberately resilient to missing videos.
"""

SCENES = [
    "NormalDistributionBasics", "MeanShift", "StandardDeviationAndSpread",
    "AreaUnderCurve", "StudentTHeavyTails", "StudentTConvergesToNormal",
    "ZScoreStandardisation", "ProbabilityBounds", "Central68Rule", "Central95Rule",
]

OUTPUT_NAMES = [
    "normal-distribution-basics", "mean-shift", "standard-deviation-and-spread",
    "area-under-curve", "student-t-heavy-tails", "student-t-converges-to-normal",
    "z-score-standardisation", "probability-bounds", "central-68-rule", "central-95-rule",
]

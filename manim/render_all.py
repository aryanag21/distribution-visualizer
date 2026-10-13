"""
Render all 10 DIST/LAB educational Manim scenes and place them directly in public/animations/
matching animation-manifest.json.
"""

import sys
import shutil
import subprocess
from pathlib import Path

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCENES_FILE = PROJECT_ROOT / "manim" / "scenes" / "distribution_scenes.py"
ANIMATIONS_DIR = PROJECT_ROOT / "public" / "animations"
TEMP_MEDIA_DIR = ANIMATIONS_DIR / "temp_render"

from render_config import SCENES, OUTPUT_NAMES

def main():
    ANIMATIONS_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Rendering {len(SCENES)} Manim educational scenes...")

    for scene_cls, out_name in zip(SCENES, OUTPUT_NAMES):
        dest_file = ANIMATIONS_DIR / f"{out_name}.mp4"
        if dest_file.exists() and dest_file.stat().st_size > 1000:
            print(f"✓ Already rendered: {dest_file.name}")
            continue

        print(f"🎬 Rendering {scene_cls} -> {out_name}.mp4 ...")
        cmd = [
            sys.executable,
            "-m", "manim",
            "-qm",
            "--format=mp4",
            "--media_dir", str(TEMP_MEDIA_DIR),
            str(SCENES_FILE),
            scene_cls
        ]

        result = subprocess.run(
            cmd,
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )

        if result.returncode != 0:
            print(f"❌ Failed rendering {scene_cls}:\n{result.stderr}\n{result.stdout}")
            continue

        # Locate rendered file in temp_media
        candidates = list(TEMP_MEDIA_DIR.glob(f"**/{scene_cls}.mp4"))
        if not candidates:
            print(f"❌ Could not find output mp4 for {scene_cls}")
            continue

        latest_vid = max(candidates, key=lambda p: p.stat().st_mtime)
        shutil.copyfile(latest_vid, dest_file)
        print(f"✓ Saved to {dest_file.name} ({dest_file.stat().st_size / 1024:.1f} KB)")

    # Cleanup temp media
    shutil.rmtree(TEMP_MEDIA_DIR, ignore_errors=True)
    tex_dir = ANIMATIONS_DIR / "Tex"
    if tex_dir.exists():
        shutil.rmtree(tex_dir, ignore_errors=True)
    videos_dir = ANIMATIONS_DIR / "videos"
    if videos_dir.exists():
        shutil.rmtree(videos_dir, ignore_errors=True)

    print("\nAll animations processed successfully!")

if __name__ == "__main__":
    main()

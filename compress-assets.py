#!/usr/bin/env python3
"""
Emily's Portfolio - Asset Compression Script
Run this from inside your repo folder: python3 compress-assets.py
"""

import os, sys, subprocess, shutil

# Check we're in the right folder
if not os.path.exists("playground") or not os.path.exists("assets"):
    print("ERROR: Run this from inside your repo folder.")
    print("  cd emilylange-dk && python3 compress-assets.py")
    sys.exit(1)

# Install Pillow if needed
try:
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
except ImportError:
    print("Installing Pillow...")
    subprocess.run([sys.executable, "-m", "pip", "install", "Pillow", "--break-system-packages", "-q"])
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None

# Check ffmpeg
ffmpeg_ok = shutil.which("ffmpeg") is not None
if not ffmpeg_ok:
    print("NOTE: ffmpeg not found - videos will be skipped.")
    print("To install: brew install ffmpeg (requires Homebrew)")
    print("Then re-run this script to compress videos too.\n")

# ── COMPRESS IMAGES ──
print("Compressing images...")
total_b, total_a, count = 0, 0, 0

for root_dir in ["assets", "playground/images"]:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            filepath = os.path.join(dirpath, filename)
            before = os.path.getsize(filepath)
            if before < 150 * 1024:
                continue
            try:
                img = Image.open(filepath)
                if img.width > 2000:
                    ratio = 2000 / img.width
                    img = img.resize((2000, int(img.height * ratio)), Image.LANCZOS)
                if img.mode not in ('RGB', 'L', 'RGBA'):
                    img = img.convert('RGB')
                if filename.lower().endswith('.png') and img.mode == 'RGBA':
                    img.save(filepath, 'PNG', optimize=True)
                else:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(filepath, 'JPEG', quality=82, optimize=True)
                after = os.path.getsize(filepath)
                if after < before:
                    total_b += before
                    total_a += after
                    count += 1
                    print(f"  {filepath}: {before//1024}KB -> {after//1024}KB ({round((1-after/before)*100)}% smaller)")
            except Exception as e:
                print(f"  Skipped {filepath}: {e}")

print(f"\n  {count} images: {total_b//1024//1024}MB -> {total_a//1024//1024}MB\n")

# ── COMPRESS VIDEOS ──
if ffmpeg_ok:
    print("Compressing videos...")
    vb, va, vc = 0, 0, 0
    for root_dir in ["assets/mp4", "playground/images", "playground/video"]:
        if not os.path.exists(root_dir):
            continue
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                if not filename.lower().endswith('.mp4'):
                    continue
                filepath = os.path.join(dirpath, filename)
                before = os.path.getsize(filepath)
                if before < 1024 * 1024:
                    continue
                tmp = filepath + ".tmp.mp4"
                try:
                    subprocess.run([
                        "ffmpeg", "-i", filepath,
                        "-vcodec", "libx264", "-crf", "28", "-preset", "fast",
                        "-vf", "scale=min(1280\\,iw):-2",
                        "-acodec", "aac", "-b:a", "96k",
                        "-y", tmp
                    ], capture_output=True)
                    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
                        after = os.path.getsize(tmp)
                        if after < before:
                            os.replace(tmp, filepath)
                            vb += before; va += after; vc += 1
                            print(f"  {filepath}: {before//1024}KB -> {after//1024}KB ({round((1-after/before)*100)}% smaller)")
                        else:
                            os.remove(tmp)
                    else:
                        if os.path.exists(tmp): os.remove(tmp)
                except Exception as e:
                    print(f"  Skipped {filepath}: {e}")
                    if os.path.exists(tmp): os.remove(tmp)
    print(f"\n  {vc} videos: {vb//1024//1024}MB -> {va//1024//1024}MB\n")

print("Done! Now run:")
print("  git add .")
print("  git commit -m 'chore: compress images and videos'")
print("  git push origin quick-fixes")

from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / "public" / "assets"


def white_bg_cutout(src, crop=None, threshold=238):
    im = Image.open(src).convert("RGBA")
    if crop:
        im = im.crop(crop)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a = px[x,y]
            # deliberately crude white-background selection; leaves some fringe
            if r > threshold and g > threshold and b > threshold:
                px[x,y] = (r,g,b,0)
    return im


def add_outline(cutout, color=(235,221,184,255), width=7):
    alpha = cutout.getchannel("A")
    dilated = alpha.filter(ImageFilter.MaxFilter(width*2+1))
    outline = Image.new("RGBA", cutout.size, color)
    outline.putalpha(dilated)
    outline.alpha_composite(cutout)
    return outline

rat = white_bg_cutout(A / "sharon-waldron-9tGjOzH9PZw-unsplash.jpg")
rat.save(A / "rat_full_cutout.png")

head = white_bg_cutout(A / "sharon-waldron-9tGjOzH9PZw-unsplash.jpg", (0, 220, 1020, 1160))
head = add_outline(head, width=5)
head.save(A / "rat_head_cutout.png")


def resize_cover(im, size):
    return ImageOps.fit(im, size, method=Image.Resampling.LANCZOS)


def paste_rat(base_path, out_path, size, head_size, pos, angle=0, eye=None, mono=False):
    base = Image.open(base_path).convert("RGB")
    base = resize_cover(base, size)
    if mono:
        base = ImageOps.grayscale(base).convert("RGB")
        base = ImageEnhance.Contrast(base).enhance(1.25)
    h = head.copy()
    h.thumbnail(head_size, Image.Resampling.LANCZOS)
    if angle:
        h = h.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    base_rgba = base.convert("RGBA")
    base_rgba.alpha_composite(h, pos)
    if eye:
        d = ImageDraw.Draw(base_rgba)
        ex,ey,rad = eye
        d.ellipse((ex-rad,ey-rad,ex+rad,ey+rad), fill=(255,225,0,255))
        d.ellipse((ex-rad//3,ey-rad//3,ex+rad//3,ey+rad//3), fill=(10,10,10,255))
    base_rgba.convert("RGB").save(out_path, quality=92)

paste_rat(
    A / "patrick-f-fUC1WN3u5yk-unsplash.jpg",
    A / "blair_atm.jpg",
    (1600, 1000),
    (330, 330),
    (735, 265),
    angle=-7,
    eye=(885, 405, 15),
)

paste_rat(
    A / "harry-shelton-ui-fbBKGW1I-unsplash.jpg",
    A / "blair_jail.jpg",
    (900, 1180),
    (310, 310),
    (305, 145),
    angle=2,
    eye=(455, 298, 13),
    mono=True,
)

paste_rat(
    A / "ratontrainstation.png",
    A / "blair_train.jpg",
    (1200, 760),
    (125, 125),
    (565, 300),
    angle=-4,
    eye=(622, 353, 7),
)

paste_rat(
    A / "images (2).jpg",
    A / "blair_goldenrule.jpg",
    (1200, 800),
    (135, 135),
    (845, 242),
    angle=3,
    eye=(905, 304, 7),
)

# Xerox-style variants of two authentic Raton photos for paper fragments
for src_name, out_name in [
    ("Screenshot-2025-04-06-095224.png", "raton_building_xerox.png"),
    ("images.jpg", "solano_xerox.png"),
]:
    im = Image.open(A / src_name).convert("L")
    im = ImageEnhance.Contrast(im).enhance(1.8)
    im = im.point(lambda p: 255 if p > 145 else 20)
    im = ImageOps.colorize(im, black="#16140f", white="#d8cfad")
    im.save(A / out_name)

print("collage assets built")


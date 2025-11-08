# Images Directory for Kabash Website

Use this folder to store all images used by the site.

Recommended subfolders:
- hero/ — large banner images for the homepage hero
- projects/
  - residential/
  - commercial/
  - design/
- about/ — team or building images for the About section
- services/ — service-related illustrations or icons (PNG/SVG)
- logos/ — company logo variants and social icons

File naming guidelines:
- Use descriptive, lowercase, hyphen-separated names.
  - Example: hero/kabash-hero-1.jpg
  - Example: projects/residential/lakeside-villa-1.jpg
  - Example: projects/commercial/skyline-offices-1.jpg

Format and size recommendations:
- Prefer modern formats (WebP or optimized JPG).
- Hero: 1600–1920px wide, target < 400 KB.
- Swiper slides: 1200x360 (crop/letterbox to fit), target < 250 KB.
- Project grid: ~1200x800, target < 300 KB.
- Icons/Logos: SVG when possible for crisp scaling.

Quick workflow to replace remote images with local ones:
1) Copy your images into the folders above.
2) Update `src` attributes in [index.html](index.html) to point to your local files under `assets/img/...`.
3) For the hero background in CSS, change the `background-image` URL in [assets/css/style.css](assets/css/style.css) to a local hero image (e.g., `assets/img/hero/kabash-hero-1.jpg`).

Accessibility:
- Always write meaningful alt text describing each image’s content (e.g., “Modern white residential house” rather than just “house”).

Performance tips:
- Compress images before adding (use Squoosh, TinyPNG, or similar).
- Keep dimensions close to display size to avoid oversized payloads.
- Use consistent aspect ratios within each section to keep the layout clean.

Notes:
- Inline SVG icons used for WhatsApp/Call can stay inline for best rendering.
- If you later host on a CDN, keep file paths identical or provide redirects.

This README exists so the folder is tracked by version control if empty. You can delete this file once images are added, if desired.
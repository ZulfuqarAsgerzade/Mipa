# MIPA — mold plant website

Next.js 16 · GSAP ScrollTrigger · Lenis · three.js (offline render) · MagicUI · AZ / EN / RU

```bash
npm run dev            # http://localhost:3000 → redirects to /az, /en or /ru
npm run build && npm start
```

## Scroll-scrubbed frame scenes

The two cinematic sections (`Hero`, `Anatomy`) are WebP image sequences drawn to a pinned
canvas by `src/components/motion/FrameScroller.tsx`. Frames live in
`public/frames/<scene>/<desktop|mobile>/NNNN.webp`, next to a `labels.json` holding the screen
position of every 3D label anchor per frame, so the HTML callouts track the render exactly.

Re-render after changing the scene (`render/scene.js`):

```bash
node render/render.mjs all          # open + anatomy, desktop 1920×1080 and mobile 900×1400
node render/render.mjs open --preview   # 6 frames into render/preview for a quick look
```

### Swapping in real factory footage

Any video can replace a sequence — keep the folder layout and frame count in `labels.json`:

```bash
ffmpeg -i plant.mp4 -vf "fps=30,scale=1920:-2" -c:v libwebp -quality 80 public/frames/open/desktop/%04d.webp
```

Then set `count`, `w`, `h` in `labels.json` and give each frame an empty `{}` label object
(or remove the `<Callout>`s) — callouts only make sense for the 3D render.

## Content

- Copy: `src/i18n/az.ts` (source of truth for the shape), `en.ts`, `ru.ts`
- Contact details: `src/config/site.ts` — rows render only when filled in
- Quote form posts to `src/app/api/quote/route.ts`; it validates and logs. Hook up delivery
  (email / Firestore) there.
- Set `NEXT_PUBLIC_SITE_URL` in production for correct Open Graph URLs.

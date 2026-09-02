# Built-N-AI — website

Static site. No build step, no framework, no dependencies. Upload the folder as-is.

## Files

```
index.html                  Home: hero, proof strip, CTA
what-we-solve.html          The friction we look for
how-we-work.html            Find it / Build it / Teach it + capability
ask-your-business.html      Your data, asked in plain English
case-study-ai-intake.html   AI intake case study
about.html                  Casey Jackson / operator background
contact.html                Email, phone, Calendly booking
checkup.html                The 10-question efficiency checkup
404.html                    Not-found page (Cloudflare serves this automatically)
robots.txt  sitemap.xml     8 URLs
_headers  _redirects        Security + cache headers, old-URL 301s
assets/css/main.v3.css      All styles
assets/js/main.v3.js        Mobile nav, scroll reveal, checkup quiz
assets/fonts/               Self-hosted Inter (variable) + Barlow Condensed 600/700
assets/img/                 Hero artwork, logo, favicon, portrait
```

Every nav item is a real page with its own content and its own URL. The header
and footer are identical across all of them; `aria-current="page"` marks the
active nav item. To change the nav, edit it in each HTML file (there is no build
step or template engine -- that is the trade-off for a zero-dependency site).

**Versioned filenames.** `main.v3.css` / `main.v3.js` carry their version in the
filename. Bump the suffix (and the references in every HTML file) whenever you
need to guarantee browsers pick up a change immediately -- a new URL can never be
served from a stale cache entry.

## Deploy to Cloudflare Pages

**Direct upload (fastest)**

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets.
2. Drag the whole folder in (or the zip). Deploy.
3. Custom domains → add `builtnai.com` and `www.builtnai.com`.

**Git (recommended once it settles)**

1. Push this folder to a repo.
2. Pages → Connect to Git → pick the repo.
3. Framework preset: **None**. Build command: leave empty. Output directory: `/`.

Cloudflare picks up `_headers` and `_redirects` on both paths. `404.html` is used
for unmatched routes automatically.

## Before going live

- Replace `https://builtnai.com/` in the `<link rel="canonical">` tags, `robots.txt`
  and `sitemap.xml` if the production domain differs.
- The Calendly link appears 10 times: once in the closing CTA of every page except
  `404.html`, a second time in `contact.html` (the booking card), and once in
  `assets/js/main.v3.js` (the `CAL` constant in the checkup result).

## Editing notes

Design tokens (colors, radii, spacing, container width) are CSS custom properties at
the top of `main.css` under `:root`. Change them there rather than in individual rules.

Card grids use `repeat(auto-fit, minmax(min(100%, X), 1fr))` and are tuned per section
with an inline `--col` value, e.g. `style="--col:250px"`. Lower the number for more
columns, raise it for fewer. No media queries needed.

Responsiveness rests on four rules, noted in the comment block at the top of
`main.css`: `min-width: 0` on grid and flex children, `clamp()` type with `em`
letter-spacing, self-reflowing grids, and artwork sized by aspect ratio rather than
fixed pixels. Keeping to those is what prevents the cut-off and overlap problems.

Verified with no horizontal overflow and no element escaping the viewport at 320,
360, 390, 480, 600, 768, 900, 1024, 1080, 1180, 1280, 1440, 1920 and 2560px on both
pages.

## Local preview

All asset and page links are **relative**, so double-clicking `index.html` works —
no server needed. This also means the site renders correctly on Cloudflare whether it
lands at the domain root or inside a subfolder. Don't change these to root-relative
(`/assets/...`) paths: that is what breaks a file:// preview and a nested deploy.

To serve it locally anyway: `python3 -m http.server 8000`, then http://localhost:8000.

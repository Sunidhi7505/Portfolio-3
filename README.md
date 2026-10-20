# Sunidhi Goyal — Portfolio

A clean, light, single-page portfolio (React 19 + Vite). Plain 2D DOM and CSS: no 3D, no heavy animation.
Sections: Hero · About · Technical Skills (category filters) · Experience · Projects (carousel) · Education · Certifications · Achievements & Highlights · Let's Connect.

## Run

Requires Node 20.19+ (or 22.12+).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview
```

There is no lint or type-check configuration in this repo; `npm run build` is the only automated check.

## Where to edit content

Everything lives in `src/data/portfolioData.js` — profile, links, skills, projects, experience, education, certifications, achievements. Components contain no personal content.

- **Profile photo:** the hero uses `public/profile-hero.webp`, a background-removed crop of `public/profile.png`. To change it, add a new (ideally transparent) image to `public/` and set `profile.photo`; set it to `null` to show a neutral illustrated placeholder.
- **Project screenshots:** add images to `public/projects/` and set `image: '/projects/foody.png'` on the project. Until then each card shows an illustrative placeholder thumbnail.
- **LeetCode card:** `achievements.leetcode.cardUrl` embeds a public LeetCode stats card (heatmap + easy/medium/hard), the same kind GitHub READMEs use. It is loaded from a third-party service; delete the line to disable it. If it cannot load, the card hides itself and the verified numbers remain.
- **Résumé:** `links.resumeDownload` / `links.resumeView` (Google Drive file).

## Structure

```
src/
  App.jsx                  page composition
  components/              Navbar, Hero, About, Skills, Experience, Projects, Education,
                           Certifications, Achievements, Contact, Footer (+ Icon, SectionHeading,
                           HeroArt, ProjectThumb)
  hooks/useActiveSection.js  highlights the current section in the nav
  styles/                  base.css (tokens, shell) · sections.css · responsive.css
  data/portfolioData.js    all content
  utils/icons.js           brand icons (simple-icons) + neutral glyph fallbacks
```

Design system: Inter, warm-white/pale blue-gray surfaces, deep-navy text, one medium-blue accent, light borders, soft shadows.
Motion is limited to smooth anchor scrolling, hover lift and focus states; `prefers-reduced-motion` is respected.

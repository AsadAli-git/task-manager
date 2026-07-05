# Design Fixes — Pending

Add any UI/design bugs you spot here. Trigger the fix routine when ready.

## Global

- [ ] Change entire website background color to white — update `--bg` to `#ffffff`, `--surface` to `#f5f5f5`, `--surface2` to `#ebebeb`, and `--border` to `#d0d0d0` in the `:root` variables in home.css

## home.html / home.css

- [ ] Testimonial text is invisible — color is #232736 same as card background, change to var(--text)
- [ ] Footer links have no color — they are invisible against dark background, set color to var(--muted)
- [ ] Feature cards grid has no gap — cards are touching each other, add gap: 24px
- [ ] Hero title font size is 72px on mobile — overflows the screen, clamp it for small screens
- [ ] Step numbers overlap step titles — top offset is wrong, remove the negative top value
- [ ] Pricing cards are not equal height — add align-items: stretch to pricing-grid
- [ ] Mobile menu has no background — links are invisible when hamburger is clicked, add background color
- [ ] Smooth scroll does not account for fixed navbar — sections scroll behind the navbar by 64px

## home.js

- [ ] Counter animation target for rating stat (4.9★) is not animated — only first two stats animate
- [ ] Smooth scroll offset missing — need to subtract navbar height from scroll position
- [ ] Scroll-reveal JS sets all section cards to opacity:0 on page load — entire Features, Pricing, Testimonials, and Steps sections appear completely blank until IntersectionObserver fires; content should be visible by default and only enhanced with animation

## home.css (additional)

- [ ] `.hero-stats` flex container has no `gap` — spacing between stat items relies on per-item `margin-right: 32px` which is inconsistent with other layouts; add `gap: 32px` to `.hero-stats` and remove `margin-right`/`padding-right` from `.stat`
- [ ] Pricing card unavailable features (✗ items) use the same `var(--muted)` color as available features (✓ items) — no visual distinction; ✗ items should use `var(--danger)` so users can tell what's excluded at a glance
- [ ] `.footer-col a` has `transition: color .2s` on hover but no base color set — links render as browser default (likely blue or white depending on browser), fix is the same as the footer links bug above (set `color: var(--muted)`)

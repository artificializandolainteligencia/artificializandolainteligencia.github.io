# Repository Guidelines

## Project Structure & Module Organization

This repository contains a dependency-free static website. All deployable files live at the repository root:

- `index.html` is the home page; section pages use folders such as `news/index.html`, `people/index.html`, and `teaching/index.html`.
- `404.html` provides the not-found page.
- `assets/css/main.css` contains the shared visual system and responsive styles.
- `assets/js/site.js` contains navigation, reveal, parallax, and canvas behavior.
- `assets/img/` stores optimized site images and social-preview assets.

Keep shared behavior and styling in the existing asset files. Add a directory with an `index.html` for each new top-level route.

## Build, Test, and Development Commands

No package manager or build step is required. From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Serving over HTTP is preferred to opening files directly because it matches normal browser path resolution.

Useful pre-commit checks include:

```bash
git diff --check
git status --short
```

The first detects whitespace errors; the second confirms the intended change set.

## Coding Style & Naming Conventions

Follow the existing two-space indentation in HTML, CSS, and JavaScript. Use semantic HTML, kebab-case CSS classes (`.site-header`), and kebab-case `data-*` hooks (`data-nav-toggle`). JavaScript uses `const`/`let`, arrow functions, semicolons, double-quoted strings, and trailing commas in multiline literals. Prefer CSS custom properties from `:root` over repeated colors or dimensions.

Preserve accessibility features: meaningful landmarks, keyboard interaction, visible focus states, ARIA state updates, alternative text, and reduced-motion behavior.

## Testing Guidelines

There is currently no automated test framework or coverage requirement. Manually verify every affected route at desktop and mobile widths. Check navigation, internal links, the 404 page, keyboard focus, Escape-to-close behavior, and the browser console. For animation changes, test both normal and `prefers-reduced-motion` modes.

## Commit & Pull Request Guidelines

Recent history uses short, imperative subjects such as `Add first website`. Follow that style—for example, `Improve mobile navigation`—and keep each commit focused.

Pull requests should summarize the change, list manual verification performed, and identify affected routes. Link relevant issues and include before/after screenshots for visual changes. Avoid committing generated files, local server output, or unrelated formatting changes.

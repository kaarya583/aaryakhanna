# Personal portfolio

Static portfolio site for [GitHub Pages](https://pages.github.com/). **All text, links, experience, programming stack, and projects are edited in `content.json` only** — no HTML or CSS required for day-to-day updates.

`content.json` includes: `tagline`, `heroSubtitle`, `heroLocation`, `about`, `experience` (role, organization, highlights, software, methods), `programming` (languages, libraries), `projects`, and `contact`.

## Live site

After you enable Pages (below), the site will be at:

**https://kaarya583.github.io/aaryakhanna/**

## Update your content (no coding)

1. Open **`content.json`** in any text editor.
2. Change **`name`**, **`tagline`**, and the **`about`** paragraphs.
3. Set **`contact`**: `email`, `github`, and optionally `linkedin` (use full `https://` URLs for links).
4. Edit **`projects`**: for each project, set `title`, `description`, `tech` (a list of labels), and `links.repo` / `links.demo` (leave `demo` as `""` if there is no live site).
5. Commit and push to the `main` branch on GitHub. The site updates in about a minute.

## First-time setup on GitHub

1. Push this repository to `https://github.com/kaarya583/aaryakhanna` (if it is not already there).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **`main`** and folder **`/ (root)`**, then **Save**.
5. Wait for the green success message, then open **https://kaarya583.github.io/aaryakhanna/**

## Preview on your computer (optional)

Opening `index.html` directly in a browser may not load `content.json`. To preview locally:

```bash
cd /path/to/aaryakhanna
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Files (for reference)

| File | Purpose |
|------|---------|
| `content.json` | **Edit this** for all copy and projects |
| `index.html` | Page structure |
| `styles.css` | Visual design |
| `app.js` | Loads `content.json` into the page |

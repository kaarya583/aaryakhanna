/**
 * Project deep-dive page — loads content.json and renders extended project content.
 */

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderVisuals(visuals) {
  if (!Array.isArray(visuals) || !visuals.length) return "";
  const cards = visuals
    .map((v) => {
      const src = v.src && String(v.src).trim();
      const cap = v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : "";
      if (src) {
        const alt = v.alt || v.caption || "";
        return `<figure class="project-figure"><img class="project-figure-img" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />${cap}</figure>`;
      }
      return `<figure class="project-figure project-figure-placeholder"><div class="project-figure-inner" role="img" aria-label="Placeholder for visualization"></div>${cap}</figure>`;
    })
    .join("");
  return `<div class="project-visuals">${cards}</div>`;
}

function renderProjectDeep(p, i) {
  const slug = p.slug || slugify(p.title);
  const d = p.detail || {};
  const intro = Array.isArray(d.intro) ? d.intro : d.paragraphs || [];
  const introHtml = intro.length
    ? `<div class="project-deep-prose">${intro.map((x) => `<p>${esc(x)}</p>`).join("")}</div>`
    : "";

  const frameworks = Array.isArray(d.frameworks) && d.frameworks.length
    ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Frameworks &amp; tools</h3>
        <ul class="project-framework-list">${d.frameworks.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>`
    : "";

  const stackNote = d.stack && String(d.stack).trim()
    ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Stack &amp; architecture</h3>
        <p class="project-deep-text">${esc(d.stack)}</p>
      </div>`
    : "";

  const methods = d.methods && String(d.methods).trim()
    ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Methods</h3>
        <p class="project-deep-text">${esc(d.methods)}</p>
      </div>`
    : "";

  const visuals = renderVisuals(d.visuals);

  const fallback =
    !introHtml && !frameworks && !stackNote && !methods && !visuals
      ? `<p class="project-deep-fallback muted">Add an <code>intro</code>, <code>frameworks</code>, <code>stack</code>, <code>methods</code>, or <code>visuals</code> under <code>detail</code> for this project in <code>content.json</code>.</p>`
      : "";

  const links = [];
  if (p.links?.repo && String(p.links.repo).trim()) {
    links.push(
      `<a class="btn btn-ghost btn-sm" href="${esc(p.links.repo)}" target="_blank" rel="noopener noreferrer">Repository</a>`
    );
  }
  if (p.links?.demo && String(p.links.demo).trim()) {
    links.push(
      `<a class="btn btn-primary btn-sm" href="${esc(p.links.demo)}" target="_blank" rel="noopener noreferrer">Live demo</a>`
    );
  }
  const linkRow = links.length
    ? `<div class="project-deep-links">${links.join("")}</div>`
    : "";

  return `
    <article class="project-deep" id="${esc(slug)}">
      <header class="project-deep-head">
        <span class="project-deep-num">${String(i + 1).padStart(2, "0")}</span>
        <h2 class="project-deep-title">${esc(p.title || "Untitled")}</h2>
      </header>
      ${introHtml || fallback}
      ${stackNote}
      ${methods}
      ${frameworks}
      ${visuals}
      ${linkRow}
    </article>
  `;
}

function renderTOC(projects) {
  if (!projects || !projects.length) return "";
  const items = projects
    .map((p) => {
      const slug = p.slug || slugify(p.title);
      return `<li><a href="#${esc(slug)}">${esc(p.title || "Untitled")}</a></li>`;
    })
    .join("");
  return `
    <nav class="project-toc" aria-label="On this page">
      <p class="project-toc-label">Jump to</p>
      <ul class="project-toc-list">${items}</ul>
    </nav>
  `;
}

function apply(data) {
  const name = data.name || "Portfolio";
  const el = document.getElementById("projects-detail-root");
  const tocEl = document.getElementById("projects-toc");
  const siteName = document.getElementById("site-name");
  if (siteName) siteName.textContent = name;

  const projects = data.projects || [];
  if (tocEl) tocEl.innerHTML = renderTOC(projects);
  if (el) {
    el.innerHTML = projects
      .map((p, i) => renderProjectDeep(p, i))
      .join("");
  }

  document.title = `${name} — Projects`;

  const footerName = document.getElementById("footer-name");
  if (footerName) footerName.textContent = name;

  if (window.location.hash) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

async function init() {
  try {
    const res = await fetch("./content.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Not found");
    apply(await res.json());
  } catch (e) {
    const err = document.getElementById("load-error");
    if (err) err.hidden = false;
    console.error(e);
  }
}

init();

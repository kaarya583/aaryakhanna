/**
 * Project deep-dive page — loads content.json and renders extended project content.
 * Supports detail.sections with plain strings or { "segments": [{ "text" }, { "latex" }] } for inline KaTeX.
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

/** Inline or display KaTeX span (filled by renderKatexInjections) */
function katexSpan(tex, display) {
  if (!tex) return "";
  const t = encodeURIComponent(tex);
  const disp = display ? "true" : "false";
  const cls = display ? "katex-inject katex-block" : "katex-inject katex-inline-span";
  return `<span class="${cls}" data-katex-tex="${t}" data-katex-display="${disp}"></span>`;
}

function renderSegmentedBody(segments) {
  if (!Array.isArray(segments)) return "";
  return segments
    .map((seg) => {
      if (seg == null) return "";
      if (typeof seg === "string") return esc(seg);
      if (seg.text != null) return esc(seg.text);
      if (seg.latex != null) return katexSpan(seg.latex, !!seg.display);
      return "";
    })
    .join("");
}

function renderParagraphItem(p) {
  if (typeof p === "string") {
    return `<p class="project-deep-text">${esc(p)}</p>`;
  }
  if (p && Array.isArray(p.segments)) {
    return `<p class="project-deep-text project-deep-text-rich">${renderSegmentedBody(p.segments)}</p>`;
  }
  return "";
}

function renderBulletItem(b) {
  if (typeof b === "string") {
    return `<li>${esc(b)}</li>`;
  }
  if (b && Array.isArray(b.segments)) {
    return `<li class="project-rich-li">${renderSegmentedBody(b.segments)}</li>`;
  }
  return "";
}

function renderEquation(eq) {
  if (!eq || !eq.tex) return "";
  const tex = encodeURIComponent(eq.tex);
  const disp = eq.display ? "true" : "false";
  const span = `<span class="katex-inject" data-katex-tex="${tex}" data-katex-display="${disp}"></span>`;
  return eq.display
    ? `<div class="katex-display-wrap">${span}</div>`
    : `<p class="katex-inline-line"><span class="katex-inline-wrap">${span}</span></p>`;
}

function renderFigureCard(v) {
  if (!v) return "";
  const src = v.src && String(v.src).trim();
  const cap = v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : "";
  if (src) {
    const alt = v.alt || v.caption || "";
    return `<figure class="project-figure project-figure-intext"><img class="project-figure-img" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />${cap}</figure>`;
  }
  return `<figure class="project-figure project-figure-placeholder project-figure-intext"><div class="project-figure-inner" role="img" aria-label="Placeholder"></div>${cap}</figure>`;
}

function renderSectionFigures(s) {
  const list = [];
  if (s.figure) list.push(s.figure);
  if (Array.isArray(s.figures)) list.push(...s.figures);
  if (!list.length) return "";
  return `<div class="project-section-figures">${list.map(renderFigureCard).join("")}</div>`;
}

function renderSections(sections) {
  if (!Array.isArray(sections) || !sections.length) return "";
  return sections
    .map((s) => {
      const head = s.title
        ? `<h3 class="project-deep-h project-deep-section-h">${esc(s.title)}</h3>`
        : "";
      const bulletsHtml = (s.bullets || []).length
        ? `<ul class="project-framework-list">${s.bullets.map(renderBulletItem).join("")}</ul>`
        : "";
      const paras = (s.paragraphs || [])
        .map((p) => renderParagraphItem(p))
        .join("");
      const eqs = (s.equations || []).map(renderEquation).join("");
      const figs = renderSectionFigures(s);
      const hasFigs = Boolean(figs);
      const leadBullets = s.bulletsFirst !== false;
      const body = leadBullets
        ? `${bulletsHtml}${paras}${eqs}`
        : `${paras}${eqs}${bulletsHtml}`;
      const sectionKind =
        (s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const sizeCls = s.figureSize === "large" ? " figure-large" : "";
      const cls = hasFigs
        ? `project-deep-block project-deep-section has-figures section-${sectionKind}${sizeCls}`
        : `project-deep-block project-deep-section section-${sectionKind}${sizeCls}`;
      const main = `<div class="project-section-main">${head}${body}</div>`;
      return `<div class="${cls}">${main}${figs}</div>`;
    })
    .join("");
}

function renderIntro(intro) {
  if (!Array.isArray(intro) || !intro.length) return "";
  const html = intro.map((item) => {
    if (typeof item === "string") {
      return `<p class="project-deep-lead">${esc(item)}</p>`;
    }
    if (item && Array.isArray(item.segments)) {
      return `<p class="project-deep-lead project-deep-text-rich">${renderSegmentedBody(item.segments)}</p>`;
    }
    return "";
  }).join("");
  return `<div class="project-deep-intro">${html}</div>`;
}

function renderVisuals(visuals, title) {
  if (!Array.isArray(visuals) || !visuals.length) return "";
  const heading = title
    ? `<h3 class="project-deep-h">${esc(title)}</h3>`
    : "";
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
  return `<div class="project-deep-block project-deep-visuals-block">${heading}<div class="project-visuals">${cards}</div></div>`;
}

function renderKatexInjections() {
  if (typeof katex === "undefined") return;
  document.querySelectorAll(".katex-inject").forEach((el) => {
    const raw = el.getAttribute("data-katex-tex");
    if (!raw) return;
    let tex;
    try {
      tex = decodeURIComponent(raw);
    } catch (e) {
      return;
    }
    const display = el.getAttribute("data-katex-display") === "true";
    try {
      katex.render(tex, el, {
        displayMode: display,
        throwOnError: false,
      });
    } catch (err) {
      console.warn("KaTeX:", err);
    }
  });
}

function renderRepoCallout(repoUrl) {
  if (!repoUrl || !String(repoUrl).trim()) return "";
  const u = String(repoUrl).trim();
  const short = u.replace(/^https?:\/\/(www\.)?github\.com\//, "");
  return `<p class="project-repo-callout"><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Source code — ${esc(short)}</a></p>`;
}

function renderProjectDeep(p, i) {
  const slug = p.slug || slugify(p.title);
  const d = p.detail || {};
  const intro = Array.isArray(d.intro) ? d.intro : d.paragraphs || [];
  const introHtml = intro.length ? renderIntro(intro) : "";

  const sectionsHtml = renderSections(d.sections);

  const frameworksHtml = Array.isArray(d.frameworks) && d.frameworks.length
    ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Frameworks &amp; tools</h3>
        <ul class="project-framework-list">${d.frameworks.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>`
    : "";

  const stackNote =
    d.stack && String(d.stack).trim() && !sectionsHtml
      ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Stack &amp; architecture</h3>
        <p class="project-deep-text">${esc(d.stack)}</p>
      </div>`
      : "";

  const methods =
    d.methods && String(d.methods).trim() && !sectionsHtml
      ? `<div class="project-deep-block">
        <h3 class="project-deep-h">Methods</h3>
        <p class="project-deep-text">${esc(d.methods)}</p>
      </div>`
      : "";

  const visualsTitle = d.visualsTitle || "Results & figures";
  const hasVisuals = Array.isArray(d.visuals) && d.visuals.length;
  const visuals = renderVisuals(d.visuals, hasVisuals ? visualsTitle : "");

  const fallback =
    !introHtml &&
    !sectionsHtml &&
    !frameworksHtml &&
    !stackNote &&
    !methods &&
    !visuals
      ? `<p class="project-deep-fallback muted">Add an <code>intro</code>, <code>sections</code>, <code>frameworks</code>, <code>stack</code>, <code>methods</code>, or <code>visuals</code> under <code>detail</code> for this project in <code>content.json</code>.</p>`
      : "";

  const repoUrl = p.links?.repo && String(p.links.repo).trim();
  const repoCallout = renderRepoCallout(repoUrl);

  const links = [];
  if (repoUrl) {
    links.push(
      `<a class="btn btn-ghost btn-sm" href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer">Repository</a>`
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
      ${repoCallout}
      ${introHtml || fallback}
      ${sectionsHtml}
      ${stackNote}
      ${methods}
      ${visuals}
      ${frameworksHtml}
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
    el.innerHTML = projects.map((p, i) => renderProjectDeep(p, i)).join("");
  }

  renderKatexInjections();

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

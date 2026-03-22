/**
 * Loads copy from content.json. Edit content.json for all text and links.
 */

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function renderTagline(tagline) {
  if (!tagline) return "";
  const parts = tagline.split("|").map((s) => s.trim()).filter(Boolean);
  return parts
    .map(
      (p, i) =>
        `<span class="pipe-seg">${esc(p)}</span>${
          i < parts.length - 1
            ? '<span class="pipe-sep" aria-hidden="true">|</span>'
            : ""
        }`
    )
    .join("");
}

function renderContact(contact) {
  const items = [];
  if (contact.email && String(contact.email).trim()) {
    items.push(
      `<li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>`
    );
  }
  if (contact.github) {
    items.push(
      `<li><a href="${esc(contact.github)}" target="_blank" rel="noopener noreferrer">GitHub</a></li>`
    );
  }
  if (contact.linkedin && contact.linkedin.trim()) {
    items.push(
      `<li><a href="${esc(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>`
    );
  }
  return items.length
    ? `<ul class="contact-list">${items.join("")}</ul>`
    : "<p>Add contact details in <code>content.json</code>.</p>";
}

function renderExperience(items) {
  if (!items || !items.length) {
    return "<p class=\"muted\">Add <code>experience</code> in <code>content.json</code>.</p>";
  }
  return items
    .map((job) => {
      const highs = (job.highlights || [])
        .map((h) => `<li>${esc(h)}</li>`)
        .join("");
      const soft =
        job.software && String(job.software).trim()
          ? `<p class="exp-meta"><span class="exp-meta-label">Software</span> ${esc(job.software)}</p>`
          : "";
      const meth =
        job.methods && String(job.methods).trim()
          ? `<p class="exp-meta"><span class="exp-meta-label">Statistics &amp; ML</span> ${esc(job.methods)}</p>`
          : "";
      return `
        <article class="timeline-card">
          <div class="timeline-dot" aria-hidden="true"></div>
          <div class="timeline-body">
            <header class="timeline-head">
              <h3>${esc(job.role || "")}</h3>
              <p class="org">${esc(job.organization || "")}</p>
            </header>
            <ul class="exp-highlights">${highs}</ul>
            ${soft}
            ${meth}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProgramming(prog) {
  if (!prog) return "";
  return `
    <div class="skill-panel">
      <h3 class="skill-panel-title">Languages &amp; platforms</h3>
      <p class="skill-panel-text">${esc(prog.languages || "")}</p>
    </div>
    <div class="skill-panel">
      <h3 class="skill-panel-title">Libraries &amp; frameworks</h3>
      <p class="skill-panel-text">${esc(prog.libraries || "")}</p>
    </div>
  `;
}

function renderProjectDetails(p) {
  // Support bullets, highlights (same shape as experience), or a single string.
  // Prefer non-empty array if both keys exist.
  let raw = null;
  if (Array.isArray(p.bullets) && p.bullets.length) raw = p.bullets;
  else if (Array.isArray(p.highlights) && p.highlights.length) raw = p.highlights;

  let lines = [];
  if (Array.isArray(raw) && raw.length) {
    lines = raw;
  } else if (typeof raw === "string" && raw.trim()) {
    lines = [raw];
  }
  if (lines.length) {
    const items = lines.map((b) => `<li>${esc(b)}</li>`).join("");
    return `<ul class="project-bullets">${items}</ul>`;
  }
  if (p.description && String(p.description).trim()) {
    return `<p class="desc">${esc(p.description)}</p>`;
  }
  return "";
}

function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderProjects(projects) {
  if (!projects || !projects.length) {
    return "<p class=\"muted\">Add projects in <code>content.json</code>.</p>";
  }
  const items = projects
    .map((p, i) => {
      const tech = (p.tech || [])
        .map((t) => `<span>${esc(t)}</span>`)
        .join("");
      const repo = p.links?.repo && String(p.links.repo).trim()
        ? `<a href="${esc(p.links.repo)}" target="_blank" rel="noopener noreferrer">Code</a>`
        : "";
      const demo =
        p.links?.demo && String(p.links.demo).trim()
          ? `<a href="${esc(p.links.demo)}" target="_blank" rel="noopener noreferrer">Live demo</a>`
          : "";
      const links = [demo, repo].filter(Boolean).join("");
      const body = renderProjectDetails(p);
      const num = String(i + 1).padStart(2, "0");
      const slug = p.slug || slugify(p.title);
      const deepHref = `./projects.html#${encodeURIComponent(slug)}`;
      return `
        <li class="project-list-item">
          <span class="project-list-num" aria-hidden="true">${num}</span>
          <div class="project-list-body">
            <h3 class="project-list-title">
              <a class="project-list-title-link" href="${esc(deepHref)}">${esc(p.title || "Untitled")}</a>
            </h3>
            ${body}
            ${tech ? `<div class="tech project-list-tech">${tech}</div>` : ""}
            <div class="project-list-actions">
              ${links ? `<div class="project-links">${links}</div>` : ""}
              <a class="project-read-more" href="${esc(deepHref)}">Deep dive <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
  return `<ol class="projects-list">${items}</ol>`;
}

function setVisible(el, show) {
  if (!el) return;
  el.hidden = !show;
  el.style.display = show ? "" : "none";
}

function applyContent(data) {
  const name = data.name || "Portfolio";
  document.getElementById("site-name").textContent = name;
  document.getElementById("hero-name").textContent = name;

  const tagEl = document.getElementById("tagline");
  tagEl.innerHTML = renderTagline(data.tagline) || esc(data.tagline || "");

  const sub = document.getElementById("hero-subtitle");
  if (data.heroSubtitle) {
    sub.textContent = data.heroSubtitle;
    setVisible(sub, true);
  } else {
    setVisible(sub, false);
  }

  const loc = document.getElementById("hero-location");
  if (data.heroLocation) {
    loc.textContent = data.heroLocation;
    setVisible(loc, true);
  } else {
    setVisible(loc, false);
  }

  const gh = document.getElementById("hero-github");
  if (gh && data.contact?.github) {
    gh.href = data.contact.github;
  }

  const aboutEl = document.getElementById("about-body");
  const paras = data.about || [];
  aboutEl.innerHTML =
    paras.map((p) => `<p>${esc(p)}</p>`).join("") ||
    "<p>Edit <code>about</code> in <code>content.json</code>.</p>";

  document.getElementById("experience-body").innerHTML = renderExperience(
    data.experience
  );
  document.getElementById("programming-body").innerHTML = renderProgramming(
    data.programming
  );
  document.getElementById("projects-grid").innerHTML = renderProjects(
    data.projects
  );
  document.getElementById("contact-body").innerHTML = renderContact(
    data.contact || {}
  );

  const footerName = document.getElementById("footer-name");
  if (footerName) footerName.textContent = name;

  document.title = `${name} — Statistics & ML`;

  const meta = document.querySelector('meta[name="description"]');
  if (meta && data.tagline) {
    meta.setAttribute(
      "content",
      `${name} — ${data.tagline}. ${data.heroSubtitle || ""}`.trim()
    );
  }
}

async function init() {
  try {
    const res = await fetch("./content.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    applyContent(data);
  } catch (e) {
    const err = document.getElementById("load-error");
    if (err) err.hidden = false;
    console.error(e);
  }
}

init();

(function () {
  const page = location.pathname.split("/").pop().replace(".html", "") || "index";
  const pageKey = page === "index" ? "home" : page;

  function text(value) {
    return String(value || "");
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(selector, value, root = document) {
    const el = root.querySelector(selector);
    if (el && value) el.textContent = value;
  }

  function renderNav(globals) {
    const nav = Array.isArray(globals.nav) ? globals.nav : [];
    const desktop = document.querySelector(".desktop-nav");
    if (desktop && nav.length) {
      desktop.innerHTML = nav.map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join("");
    }
    const panel = document.querySelector(".menu-panel");
    if (panel && nav.length) {
      panel.innerHTML = `
        <div class="panel-top">
          <span>Navigation</span>
          <button class="menu-close" type="button" aria-label="Menüyü kapat">Kapat</button>
        </div>
        ${nav.map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join("")}
        <a href="${escapeHtml(globals.whatsappHref || "#")}">Teklif Al</a>
        <div class="panel-contact">
          <span>${escapeHtml(globals.location || "")}</span>
          <span>${escapeHtml(globals.phone || "")}</span>
        </div>`;
      panel.querySelector(".menu-close")?.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
      });
    }
    document.querySelectorAll(".brand span:last-child").forEach((el) => {
      el.textContent = globals.brand || "MRC Dijital";
    });
    document.querySelectorAll(".header-cta").forEach((el) => {
      el.href = globals.whatsappHref || el.href;
    });
    const footer = document.querySelector(".footer");
    if (footer) {
      footer.innerHTML = `<div>${escapeHtml(globals.brand || "MRC Dijital Pazarlama")}</div><div>${escapeHtml(globals.location || "")} - ${escapeHtml(globals.phone || "")}</div><div>${escapeHtml(globals.footer || "")}</div>`;
    }
  }

  function renderHero(content) {
    const data = content.pages && content.pages[pageKey];
    if (!data) return;
    setText(".sub-copy .section-label", data.label);
    setText(".sub-copy h1", data.title);
    setText(".sub-copy p", data.description);
    const meta = document.querySelector(".sub-meta");
    if (meta && Array.isArray(data.meta)) meta.innerHTML = data.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    if (pageKey === "home") {
      setText(".eyebrow", "MRC Dijital Pazarlama");
      setText(".huge-word", data.title || "MRC");
      setText(".script-line", data.script);
      setText(".hero-bottom p", data.description);
      const heroMeta = document.querySelector(".hero-meta");
      if (heroMeta && Array.isArray(data.meta)) heroMeta.innerHTML = data.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    }
  }

  function serviceCard(service, index) {
    const tag = service.href ? "a" : "article";
    const href = service.href ? ` href="${escapeHtml(service.href)}"` : "";
    return `<${tag} class="feature-row reveal motion-card" data-depth="${index % 2 ? "-0.2" : "0.22"}"${href}><span>${escapeHtml(service.index || String(index + 1).padStart(3, "0"))}</span><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p></${tag}>`;
  }

  function renderServices(content) {
    if (pageKey !== "hizmetler") return;
    const stack = document.querySelector(".feature-stack");
    if (stack && Array.isArray(content.services)) stack.innerHTML = content.services.map(serviceCard).join("");
  }

  function renderHomeServices(content) {
    if (pageKey !== "home") return;
    const stack = document.querySelector(".service-stack");
    if (!stack || !Array.isArray(content.services)) return;
    stack.innerHTML = content.services.slice(0, 4).map((service, index) => `
      <article class="service-card reveal motion-card" data-depth="${index % 2 ? "-0.22" : "0.28"}">
        <div class="service-index">${escapeHtml(service.index || String(index + 1).padStart(3, "0"))}</div>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <ul>${(service.bullets || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>`).join("");
  }

  function packageCard(pack, detail = false, index = 0) {
    const cls = `${detail ? "price-card price-detail" : "price-card"}${pack.featured ? " featured" : ""} reveal motion-card`;
    const items = detail ? `<ul>${(pack.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    return `<article class="${cls}" data-depth="${index % 2 ? "-0.18" : "0.2"}"><span>${escapeHtml(pack.name)}</span><h3>${escapeHtml(pack.price)}</h3><p>${escapeHtml(detail ? pack.note : pack.description)}</p>${items}</article>`;
  }

  function renderPackages(content) {
    const packs = Array.isArray(content.packages) ? content.packages : [];
    if (!packs.length) return;
    const detailGrid = document.querySelector(".price-detail-grid");
    if (detailGrid) detailGrid.innerHTML = packs.map((pack, index) => packageCard(pack, true, index)).join("");
    const smallGrid = document.querySelector(".pricing-grid");
    if (smallGrid) smallGrid.innerHTML = packs.map((pack, index) => packageCard(pack, false, index)).join("");
  }

  function renderBlog(content) {
    const posts = (content.blogPosts || []).filter((post) => post.status !== "draft");
    const blogGrid = document.querySelector("main.sub-main .panel-grid.two");
    if (pageKey === "blog" && blogGrid) {
      blogGrid.innerHTML = posts.map((post, index) => `<article class="article-card reveal motion-card" data-depth="${index % 2 ? "-0.14" : "0.14"}"><span>${escapeHtml(post.date)} / ${escapeHtml(post.category)}</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p></article>`).join("");
    }
    const homeList = document.querySelector(".blog-list");
    if (homeList) {
      homeList.innerHTML = posts.slice(0, 4).map((post, index) => `<a class="motion-card" data-depth="${index % 2 ? "-0.12" : "0.12"}" href="blog.html"><span>${escapeHtml(post.date)}</span>${escapeHtml(post.title)}</a>`).join("");
    }
  }

  function renderReferences(content) {
    if (content.references && Array.isArray(content.references.brandCells)) {
      const cloud = document.querySelector(".brand-cloud");
      if (cloud) cloud.innerHTML = content.references.brandCells.map((item, index) => `<div class="brand-cell motion-card" data-depth="${index % 2 ? "-0.12" : "0.12"}">${escapeHtml(item)}</div>`).join("");
    }
    if (content.references && Array.isArray(content.references.metrics)) {
      const metrics = document.querySelector(".reference-metrics");
      if (metrics) metrics.innerHTML = content.references.metrics.map((item, index) => `<div class="motion-card" data-depth="${index % 2 ? "-0.16" : "0.2"}"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join("");
    }
  }

  function bindForms() {
    document.querySelectorAll(".contact-form").forEach((form) => {
      if (form.dataset.cmsBound) return;
      form.dataset.cmsBound = "true";
      const button = form.querySelector("button");
      button?.setAttribute("type", "submit");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());
        if (!payload.name || !payload.phone || !payload.message) {
          button.textContent = "Ad, telefon ve mesaj zorunlu";
          return;
        }
        button.disabled = true;
        button.textContent = "Gönderiliyor";
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error("Form gönderilemedi.");
          form.reset();
          button.textContent = "Gönderildi";
        } catch {
          button.textContent = "Tekrar deneyin";
        } finally {
          setTimeout(() => {
            button.disabled = false;
            button.textContent = "Gönder";
          }, 2200);
        }
      });
    });
  }

  fetch("/api/content", { headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : null)
    .then((content) => {
      if (!content) return;
      renderNav(content.globals || {});
      renderHero(content);
      renderServices(content);
      renderHomeServices(content);
      renderPackages(content);
      renderBlog(content);
      renderReferences(content);
      bindForms();
      window.MRCRefreshMotion?.();
    })
    .catch(() => bindForms());
})();

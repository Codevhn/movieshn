const SHARE_MAX_CAST = 12;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("movie-details");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    container.innerHTML = "<div class=\"movie-empty\"><p>Película no especificada.</p></div>";
    return;
  }

  const escapeAttr = (value = "") => String(value).replace(/"/g, "&quot;");

  fetch("data/movies.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const movie = data.find((m) => String(m.id) === movieId);

      if (!movie) {
        container.innerHTML = `
          <div class="movie-empty">
            <i class="fas fa-film-slash"></i>
            <h2>No encontramos esta película</h2>
            <p>Es posible que haya sido movida o todavía no esté disponible.</p>
            <a class="btn btn-secondary" href="index.html">Volver al catálogo</a>
          </div>
        `;
        return;
      }

      const genres = Array.isArray(movie.genre) ? movie.genre.filter(Boolean) : [];
      const normalizedCast = [];
      const castWatchLinks = [];

      if (Array.isArray(movie.cast)) {
        movie.cast.forEach((item) => {
          if (typeof item === "string") {
            normalizedCast.push(item);
          } else if (item && typeof item === "object") {
            if (item.url && item.url.trim()) {
              castWatchLinks.push({
                name: item.name || "Servidor",
                url: item.url,
              });
            } else if (item.name) {
              normalizedCast.push(item.name);
            }
          }
        });
      }

      let watchLinks = Array.isArray(movie.watchLinks)
        ? movie.watchLinks.filter((link) => link && link.url && link.url.trim())
        : [];

      if (!watchLinks.length && castWatchLinks.length) {
        watchLinks = [...castWatchLinks];
      }

      if (!watchLinks.length && movie.embed && movie.embed.trim()) {
        watchLinks = [{ name: "Reproductor principal", url: movie.embed }];
      }

      const infoPill = (icon, text) => (text ? `<span class="info-pill"><i class="${icon}"></i>${text}</span>` : "");

      const infoPills = [
        infoPill("fas fa-calendar-alt", movie.year),
        infoPill("fas fa-clock", movie.duration),
        infoPill("fas fa-language", movie.language),
        infoPill("fas fa-user-shield", movie.ageRating),
        infoPill("fas fa-hd", movie.quality),
      ]
        .filter(Boolean)
        .join("");

      const synopsis = movie.description || "Sin descripción disponible.";
      const shortSynopsis = synopsis.length > 240 ? `${synopsis.slice(0, 237)}…` : synopsis;
      const heroBackdrop = (movie.backdrop || movie.cover || "").trim();
      const heroBackdropStyle = heroBackdrop
        ? `style="--hero-bg: url('${heroBackdrop.replace(/'/g, "\\'")}')"`
        : "";

      const heroTags = genres.length
        ? genres.map((tag) => `<span class="hero-tag">${tag}</span>`).join("")
        : "<span class=\"hero-tag hero-tag--muted\">Sin categoría</span>";

      const tagCloudMarkup = genres.length ? `<div class="tag-cloud">${heroTags}</div>` : "";

      const castMarkup = normalizedCast.length
        ? normalizedCast
            .slice(0, SHARE_MAX_CAST)
            .map((actor) => {
              const name = actor || "Reparto";
              const initial = name.trim().charAt(0).toUpperCase() || '#';
              return `
                <li class="cast-card">
                  <span class="cast-avatar" aria-hidden="true">${initial}</span>
                  <span class="cast-name">${name}</span>
                </li>
              `;
            })
            .join("")
        : `<li class="cast-card cast-card--empty"><span class="cast-name">No hay reparto registrado.</span></li>`;

      const downloadLinks = Array.isArray(movie.downloadLinks)
        ? movie.downloadLinks.filter((link) => link && link.url && link.url.trim())
        : [];

      const publicDownloadLinks = Array.isArray(movie.publicDownloadLinks)
        ? movie.publicDownloadLinks.filter((link) => link && link.url && link.url.trim())
        : downloadLinks;

      const premiumDownloadLinks = Array.isArray(movie.premiumDownloadLinks)
        ? movie.premiumDownloadLinks.filter((link) => link && link.url && link.url.trim())
        : [];

      const recommendations = genres.length
        ? data
            .filter(
              (item) =>
                item.id !== movie.id &&
                Array.isArray(item.genre) &&
                item.genre.some((g) => genres.includes(g))
            )
            .slice(0, 6)
        : [];

      const recommendationsMarkup = recommendations.length
        ? recommendations
            .map(
              (item, index) => `
                <a href="movie.html?id=${encodeURIComponent(item.id)}" class="recommend-card animate-on-load" data-animation="fade-in-up" style="transition-delay: ${0.08 * index}s;">
                  <div class="recommend-card__image">
                    <img src="${item.cover || "assets/covers/placeholder.jpg"}" alt="${item.title || "Película"}" loading="lazy">
                  </div>
                  <div class="recommend-card__info">
                    <h4>${item.title || "Sin título"}</h4>
                    <span>${item.year || ""}</span>
                  </div>
                </a>
              `
            )
            .join("")
        : "<p class=\"empty-note\">Estamos preparando recomendaciones para ti.</p>";

      const hasPremiumLinks = premiumDownloadLinks.length > 0;
      const vipTierClass = hasPremiumLinks
        ? "download-tier download-tier--vip download-tier--locked"
        : "download-tier download-tier--vip download-tier--disabled";

      const detailRows = [];
      if (movie.director) {
        detailRows.push(
          `<div class=\"meta-row\"><span class=\"meta-label\"><i class=\"fas fa-user-tie\"></i> Director</span><span>${movie.director}</span></div>`
        );
      }
      if (movie.language) {
        detailRows.push(
          `<div class=\"meta-row\"><span class=\"meta-label\"><i class=\"fas fa-language\"></i> Idiomas</span><span>${movie.language}</span></div>`
        );
      }
      if (movie.duration) {
        detailRows.push(
          `<div class=\"meta-row\"><span class=\"meta-label\"><i class=\"fas fa-clock\"></i> Duración</span><span>${movie.duration}</span></div>`
        );
      }
      if (movie.ageRating) {
        detailRows.push(
          `<div class=\"meta-row\"><span class=\"meta-label\"><i class=\"fas fa-user-shield\"></i> Clasificación</span><span>${movie.ageRating}</span></div>`
        );
      }
      const detailRowsMarkup = detailRows.length ? `<div class=\"movie-meta\">${detailRows.join("")}</div>` : "";

      const factEntries = [];
      if (movie.year) factEntries.push({ label: 'Año', value: movie.year });
      if (movie.country) factEntries.push({ label: 'País', value: movie.country });
      if (movie.studio) factEntries.push({ label: 'Estudio', value: movie.studio });
      if (movie.rating) factEntries.push({ label: 'Puntuación', value: movie.rating });
      if (movie.budget) factEntries.push({ label: 'Presupuesto', value: movie.budget });

      const factListMarkup = factEntries.length
        ? factEntries
            .map((entry) => `
              <li>
                <span class="fact-label">${entry.label}</span>
                <span class="fact-value">${entry.value}</span>
              </li>
            `)
            .join("")
        : "<li class=\"fact-card--empty\"><span class=\"fact-label\">Información</span><span class=\"fact-value\">N/D</span></li>";

      container.innerHTML = `
        <div class="movie-page">
          <section class="immersive-hero" ${heroBackdropStyle}>
            <div class="immersive-hero__veil"></div>
            <div class="immersive-hero__noise"></div>
            <div class="immersive-hero__content animate-on-load" data-animation="fade-in-up">
              <div class="hero-card">
                <div class="hero-card__poster">
                  <img src="${movie.cover || "assets/covers/placeholder.jpg"}" alt="${movie.title || "Película"}" loading="lazy">
                  ${movie.quality ? `<span class="quality-chip">${movie.quality}</span>` : ""}
                </div>
                <div class="hero-card__info">
                  ${movie.originalTitle ? `<span class="hero-subtitle"><i class="fas fa-film"></i> ${movie.originalTitle}</span>` : ""}
                  <h1 class="hero-title">${movie.title || "Título no disponible"}</h1>
                  <div class="hero-pills">${infoPills}</div>
                  <p class="hero-summary">${shortSynopsis}</p>
                  <div class="hero-tags">${heroTags}</div>
                  <div class="hero-actions">
                    <a href="#player-zone" class="btn btn-primary" data-scroll-to-player><i class="fas fa-play"></i> Reproducir</a>
                    ${
                      movie.trailer
                        ? `<button class="btn btn-secondary trailer-btn" data-url="${escapeAttr(movie.trailer)}"><i class="fas fa-video"></i> Ver trailer</button>`
                        : ""
                    }
                    <button id="movie-mylist-btn" class="btn btn-secondary btn-mylist" data-movie-id="${movie.id}"><i class="fas fa-bookmark"></i> Mi lista</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="player-zone" class="movie-player-zone section-shell">
            <div class="player-zone animate-on-load" data-animation="fade-in-up">
              <div class="player-zone__header">
                <h2><i class="fas fa-play-circle"></i> Sala de proyección</h2>
                <span class="panel-subtitle">Elige el servidor que prefieras</span>
              </div>
              <div class="player-zone__servers">
                <div class="server-tabs">
                  ${watchLinks.length
                    ? watchLinks
                        .map(
                          (link, index) => `
                            <button class="server-tab ${index === 0 ? "active" : ""}" data-url="${escapeAttr(link.url)}">
                              <i class="fas fa-server"></i><span>${link.name || `Servidor ${index + 1}`}</span>
                            </button>
                          `
                        )
                        .join("")
                    : '<p class="empty-note">No hay servidores disponibles por el momento.</p>'}
                </div>
                <div id="dynamic-player" class="movie-player">
                  <div class="player-placeholder">
                    <i class="fas fa-film"></i>
                    <p>${watchLinks.length ? "Selecciona un servidor para comenzar" : "Añadiremos la reproducción pronto."}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="movie-experience section-shell">
            <div class="experience-grid">
              <div class="experience-main">
                <article class="experience-card experience-card--downloads animate-on-load" data-animation="fade-in-up" style="transition-delay: 0.12s;">
                  <header>
                    <h2><i class="fas fa-download"></i> Centro de descargas</h2>
                    <span class="panel-subtitle">A tu ritmo o sin publicidad</span>
                  </header>
                  <div class="download-tier-grid">
                    <div class="download-tier download-tier--free">
                      <div class="download-tier__badge">
                        <span>Gratis</span>
                        <i class="fas fa-link"></i>
                      </div>
                      <p class="download-tier__note">Enlaces con acortadores o publicidad ligera. Perfecto si no te importa esperar unos segundos.</p>
                      <div id="download-free-links" class="download-tier__links download-links-grid"></div>
                    </div>

                    <div class="${vipTierClass}" id="vip-download-tier">
                      <div class="download-tier__badge">
                        <span>VIP</span>
                        <i class="fas fa-crown"></i>
                      </div>
                      <p class="download-tier__note">Descargas directas sin anuncios para quienes prefieren pagar por velocidad y comodidad.</p>
                      <div class="download-tier__action">
                        <button id="get-vip-access-btn" class="btn btn-primary btn-vip"><i class="fas fa-unlock"></i> Obtener acceso VIP</button>
                        <span class="vip-info-text">Acceso ilimitado para miembros.</span>
                      </div>
                      <div id="download-vip-links" class="download-tier__links download-links-grid"></div>
                    </div>
                  </div>
                </article>
              </div>

              <aside class="experience-aside">
                <article class="experience-card experience-card--synopsis animate-on-load" data-animation="fade-in-up" style="transition-delay: 0.16s;">
                  <header>
                    <h2><i class="fas fa-align-left"></i> Sinopsis</h2>
                  </header>
                  <p class="movie-storyline">${synopsis}</p>
                </article>

                <article class="experience-card experience-card--cast animate-on-load" data-animation="fade-in-up" style="transition-delay: 0.2s;">
                  <header>
                    <h2><i class="fas fa-users"></i> Reparto</h2>
                  </header>
                  <ul class="cast-list">${castMarkup}</ul>
                </article>

                <article class="experience-card experience-card--facts animate-on-load" data-animation="fade-in-up" style="transition-delay: 0.24s;">
                  <header>
                    <h2><i class="fas fa-info-circle"></i> Ficha técnica</h2>
                  </header>
                  ${detailRowsMarkup}
                  <ul class="fact-list">
                    ${factListMarkup}
                  </ul>
                  ${tagCloudMarkup}
                  <p class="aside-note">Tu progreso se guarda automáticamente al reproducir. Encuéntralo luego en <strong>Continuar viendo</strong>.</p>
                </article>
              </aside>
            </div>
          </section>

          <section class="movie-recommendations section-shell animate-on-load" data-animation="fade-in-up" style="transition-delay: 0.28s;">
            <div class="experience-card">
              <div class="card-header">
                <h2><i class="fas fa-th-large"></i> Más como esta</h2>
                <span class="panel-subtitle">Selección basada en esta cinta</span>
              </div>
              <div class="recommend-grid">
                ${recommendationsMarkup}
              </div>
            </div>
          </section>
        </div>

        <div id="trailer-modal" class="modal" style="display:none;">
          <div class="modal-content">
            <span class="modal-close">×</span>
            <iframe id="trailer-frame" src="" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      `;

      const altTrailerBtns = document.querySelectorAll(".trailer-btn");
      altTrailerBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const modal = document.getElementById("trailer-modal");
          const frame = document.getElementById("trailer-frame");
          if (frame && modal) {
            frame.src = btn.dataset.url;
            modal.classList.add("active");
          }
        });
      });

      const serverTabs = document.querySelectorAll(".server-tab");
      const playerContainer = document.getElementById("dynamic-player");

      serverTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          serverTabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          const url = tab.dataset.url;
          if (playerContainer && url) {
            playerContainer.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen loading="lazy" scrolling="no" allow="encrypted-media; fullscreen; autoplay"></iframe>`;
          }
        });
      });

      if (serverTabs.length > 0) {
        serverTabs[0].click();
      }

      const playerZone = document.getElementById("player-zone");
      const playerScrollTriggers = document.querySelectorAll('[data-scroll-to-player]');
      const siteHeader = document.querySelector('.site-header');

      const smoothScrollToPlayer = () => {
        if (!playerZone) return;
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 16 : 0;
        const targetTop = playerZone.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      };

      playerScrollTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          smoothScrollToPlayer();
        });
      });

      const modal = document.getElementById("trailer-modal");
      const modalClose = document.querySelector(".modal-close");

      const closeModal = () => {
        const frame = document.getElementById("trailer-frame");
        if (modal) modal.classList.remove("active");
        if (frame) frame.src = "";
      };

      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) closeModal();
        });
      }
      if (modalClose) {
        modalClose.addEventListener("click", closeModal);
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("active")) {
          closeModal();
        }
      });

      setTimeout(() => {
        document.body.classList.add("loaded");
      }, 120);

      const recentlyWatched = JSON.parse(localStorage.getItem("recentlyWatched")) || [];
      const existingIndex = recentlyWatched.findIndex((item) => item.id === movie.id);

      if (existingIndex > -1) {
        recentlyWatched.splice(existingIndex, 1);
      }
      recentlyWatched.unshift({
        id: movie.id,
        title: movie.title,
        cover: movie.cover,
        lastWatched: new Date().toISOString(),
      });

      localStorage.setItem("recentlyWatched", JSON.stringify(recentlyWatched.slice(0, 5)));

      const freeLinksContainer = document.getElementById("download-free-links");
      const vipLinksContainer = document.getElementById("download-vip-links");
      const getVipAccessBtn = document.getElementById("get-vip-access-btn");
      const vipInfoText = document.querySelector(".vip-info-text");
      const vipTier = document.getElementById("vip-download-tier");

      const renderDownloadLinks = (isVip) => {
        if (freeLinksContainer) {
          if (publicDownloadLinks.length > 0) {
            freeLinksContainer.innerHTML = publicDownloadLinks
              .map(
                (link) => `
                  <a href="${escapeAttr(link.url)}" target="_blank" class="download-btn">
                    <i class="fas fa-link"></i><span>${link.name || "Descargar"}</span>
                  </a>
                `
              )
              .join("");
          } else {
            freeLinksContainer.innerHTML = '<p class="empty-note">No hay descargas gratuitas disponibles por ahora.</p>';
          }
        }

        if (!vipLinksContainer || !vipTier) return;

        if (!hasPremiumLinks) {
          vipTier.classList.add("download-tier--disabled");
          vipLinksContainer.innerHTML = '<p class="empty-note">No hay enlaces VIP disponibles para esta película.</p>';
          if (getVipAccessBtn) getVipAccessBtn.style.display = "none";
          if (vipInfoText) vipInfoText.style.display = "none";
          return;
        }

        vipTier.classList.remove("download-tier--disabled");

        if (isVip) {
          vipTier.classList.remove("download-tier--locked");
          vipLinksContainer.innerHTML = premiumDownloadLinks
            .map(
              (link) => `
                <a href="${escapeAttr(link.url)}" target="_blank" class="download-btn premium-link unlocked">
                  <i class="fas fa-bolt"></i><span>${link.name || "Descargar VIP"}</span>
                </a>
              `
            )
            .join("");
          if (getVipAccessBtn) getVipAccessBtn.style.display = "none";
          if (vipInfoText) {
            vipInfoText.style.display = "block";
            vipInfoText.textContent = "¡Disfruta de enlaces directos sin publicidad!";
          }
        } else {
          vipTier.classList.add("download-tier--locked");
          vipLinksContainer.innerHTML = `
            <div class="locked-premium-links">
              <p><i class="fas fa-lock"></i> Desbloquea estos enlaces con Acceso VIP</p>
            </div>
          `;
          if (getVipAccessBtn) getVipAccessBtn.style.display = "inline-flex";
          if (vipInfoText) {
            vipInfoText.style.display = "block";
            vipInfoText.textContent = "Evita acortadores y descarga al instante.";
          }
        }
      };

      const isVipUser = localStorage.getItem("isVipUser") === "true";
      renderDownloadLinks(isVipUser);

      if (getVipAccessBtn) {
        getVipAccessBtn.addEventListener("click", () => {
          alert("¡Felicidades! Has obtenido Acceso VIP (simulado). Ahora verás los enlaces directos.");
          localStorage.setItem("isVipUser", "true");
          renderDownloadLinks(true);
        });
      }

      const myListButton = document.getElementById("movie-mylist-btn");
      if (myListButton) {
        const updateMyListButton = () => {
          const stored = JSON.parse(localStorage.getItem("myList")) || [];
          const inList = stored.includes(movie.id);
          myListButton.classList.toggle("btn-mylist--active", inList);
          myListButton.innerHTML = `<i class=\"fas fa-bookmark\"></i> ${inList ? "En mi lista" : "Agregar a mi lista"}`;
        };

        myListButton.addEventListener("click", () => {
          const stored = JSON.parse(localStorage.getItem("myList")) || [];
          const index = stored.indexOf(movie.id);
          if (index > -1) {
            stored.splice(index, 1);
          } else {
            stored.push(movie.id);
          }
          localStorage.setItem("myList", JSON.stringify(stored));
          updateMyListButton();
        });

        updateMyListButton();
      }
    })
    .catch((err) => {
      console.error("Error cargando datos de la película:", err);
      container.innerHTML = "<p>Error al cargar los datos de la película. Por favor, intenta de nuevo más tarde.</p>";
    });
});

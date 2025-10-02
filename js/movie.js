document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("movie-details");
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    container.innerHTML = "<p>Película no especificada</p>";
    return;
  }

  fetch("./data/movies.json")
    .then((res) => res.json())
    .then((movies) => {
      const movie = movies.find((m) => m.id === movieId);

      if (!movie) {
        container.innerHTML = "<p>Película no encontrada</p>";
        return;
      }

      // Nueva estructura "Immersive Cinema Experience"
      container.innerHTML = `
        <div class="movie-hero-container">
          <div class="movie-hero">
            <div class="poster-container">
              <img src="${movie.cover}" alt="${movie.title}" class="poster-img">
            </div>
            <div class="hero-info">
              <h1 class="hero-title">${movie.title}</h1>
              <div class="hero-meta">
                <span>${movie.year}</span>
                <span>${movie.ageRating}</span>
                <span>${movie.duration}</span>
              </div>
              <p class="hero-description">${movie.description}</p>
              <div class="hero-actions">
                ${movie.trailer ? `<button class="btn-main trailer-btn" data-url="${movie.trailer}">🎬 Ver Trailer</button>` : ''}
              </div>
            </div>
          </div>
        </div>

        <div class="movie-content-container">
          <!-- Playback Zone -->
          <div class="playback-zone">
            <h2><i class="fas fa-play-circle"></i> Ver Película</h2>
            <div class="server-tabs">
              ${movie.watchLinks.map((link, index) => `
                <button class="server-tab ${index === 0 ? 'active' : ''}" data-url="${link.url}">
                  ${link.name}
                </button>
              `).join("")}
            </div>
            <div id="dynamic-player" class="movie-player">
              <!-- El reproductor se inyectará aquí -->
            </div>
          </div>

          <!-- Detailed Info -->
          <div class="details-zone">
            <h2>Detalles Adicionales</h2>
            <ul class="details-list">
              <li><strong>Título Original:</strong> ${movie.originalTitle}</li>
              <li><strong>Director:</strong> ${movie.director}</li>
              <li><strong>Género:</strong> ${movie.genre.join(", ")}</li>
              <li><strong>Idioma:</strong> ${movie.language}</li>
            </ul>
          </div>
        </div>

        <!-- Modal para el Trailer -->
        <div id="trailer-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="modal-close">×</span>
                <iframe id="trailer-frame" src="" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
      `;

      // --- INICIALIZAR EVENTOS PARA LA NUEVA ESTRUCTURA ---

      // Botón del trailer
      const trailerBtn = document.querySelector(".trailer-btn");
      if (trailerBtn) {
        trailerBtn.addEventListener("click", () => {
          const modal = document.getElementById("trailer-modal");
          const frame = document.getElementById("trailer-frame");
          frame.src = trailerBtn.dataset.url;
          modal.style.display = "flex";
        });
      }

      // Pestañas de servidores
      const serverTabs = document.querySelectorAll(".server-tab");
      const playerContainer = document.getElementById("dynamic-player");

      serverTabs.forEach(tab => {
        tab.addEventListener("click", () => {
          serverTabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          const url = tab.dataset.url;
          playerContainer.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
        });
      });

      // Cargar el primer servidor por defecto
      if (serverTabs.length > 0) {
        serverTabs[0].click();
      }

      // Lógica para cerrar el modal
      const modal = document.getElementById("trailer-modal");
      const modalClose = document.querySelector(".modal-close");

      const closeModal = () => {
          modal.style.display = "none";
          document.getElementById("trailer-frame").src = "";
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
          if (e.key === "Escape" && modal.style.display === "flex") {
              closeModal();
          }
      });
    })
    .catch((err) => {
      console.error("Error cargando datos de la película:", err);
      container.innerHTML = "<p>Error al cargar los datos de la película. Por favor, intenta de nuevo más tarde.</p>";
    });
});


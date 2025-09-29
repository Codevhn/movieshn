document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("movie-details");

  // Leer parámetro id de la URL
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

      // Renderizar detalle + contenedor de reproducción
      container.innerHTML = `
        <div class="movie-detail">
          <div class="poster">
            <img src="${movie.cover}" alt="${movie.title}">
          </div>
          <div class="info">
            <h1>${movie.title} (${movie.year})</h1>
            <p><strong>Título original:</strong> ${movie.originalTitle}</p>
            <p><strong>Director:</strong> ${movie.director}</p>
            <p><strong>Duración:</strong> ${movie.duration}</p>
            <p><strong>Idioma:</strong> ${movie.language}</p>
            <p><strong>Clasificación:</strong> ${movie.ageRating}</p>
            <p><strong>Género:</strong> ${movie.genre.join(", ")}</p>
            <p class="description">${movie.description}</p>
          </div>
        </div>

        <!-- Zona de reproducción independiente -->
        <div class="player-container">
          <h2>Opciones de reproducción</h2>
          <div class="button-group">
            ${movie.watchLinks
              .map(
                (link) => `
                  <button class="btn watch-btn" data-url="${link.url}">
                    ${link.name}
                  </button>
                  `
              )
              .join("")}
            ${
              movie.trailer
                ? `<button class="btn trailer-btn" data-url="${movie.trailer}">
                     🎬 Ver Trailer
                   </button>`
                : ""
            }
          </div>
          <div id="dynamic-player" class="movie-player" style="display:none;"></div>
        </div>

        <!-- Modal Trailer -->
        <div id="trailer-modal" class="modal" style="display:none;"></div>
      `;

      // Eventos para abrir player dinámico
      document.querySelectorAll(".watch-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.dataset.url;
          const player = document.getElementById("dynamic-player");

          player.innerHTML = `
            <iframe src="${url}" frameborder="0" allowfullscreen></iframe>
          `;
          player.style.display = "block";
          player.scrollIntoView({ behavior: "smooth" });
        });
      });

      // Evento para abrir trailer en modal
      const trailerBtn = document.querySelector(".trailer-btn");
      if (trailerBtn) {
        trailerBtn.addEventListener("click", () => {
          const modal = document.getElementById("trailer-modal");
          const frame = document.getElementById("trailer-frame");
          frame.src = trailerBtn.dataset.url;
          modal.style.display = "flex";
        });
      }

      // Cerrar modal (con click en ✕ o fondo)
      document.addEventListener("click", (e) => {
        const modal = document.getElementById("trailer-modal");
        if (
          e.target.classList.contains("modal-close") ||
          e.target.id === "trailer-modal"
        ) {
          modal.style.display = "none";
          document.getElementById("trailer-frame").src = "";
        }
      });

      // Cerrar modal con tecla ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const modal = document.getElementById("trailer-modal");
          modal.style.display = "none";
          document.getElementById("trailer-frame").src = "";
        }
      });
    })
    .catch((err) => {
      console.error("Error cargando datos", err);
      container.innerHTML = "<p>Error al cargar los datos de la película</p>";
    });
});

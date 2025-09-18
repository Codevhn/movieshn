document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("movie-details");

  // Lee el parametro ID de la URL
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    container.innerHTML = " <p>Pelicula no especificada</p>";
    return;
  }

  fetch("data/movies.json")
    .then((res) => res.json())
    .then((movies) => {
      const movie = movies.find((m) => m.id === movieId);

      if (!movie) {
        container.innerHTML = " <p>Pelicula no encontrada</p>";
        return;
      }

      container.innerHTML = `
      <article class="movie-card">
        <div class="movie-header">
          <img src="${movie.cover}" alt="${movie.title}" class="movie-cover" />
          <div class="movie-meta">
            <h2>${movie.title}</h2>
            <p><strong>Titulo original:</strong> ${movie.originalTitle}</p>
            <p><strong>Año:</strong> ${movie.year}</p>
            <p><strong>Idioma:</strong> ${movie.language}</p>
            <p><strong>Calidad:</strong> ${movie.quality}</p>
            <p><strong>Genero</strong>: ${movie.genre.join(", ")}</p>
            <p><strong>Duracion:</strong> ${movie.duration} min</p>
            <p><strong>Evaluacion:</strong> ${movie.ageRating}</p>
            <p><strong>Director:</strong> ${movie.director}</p>
            <p><strong>Reparto:</strong> ${movie.cast.join(", ")}</p>

            <p><strong>Trailer:</strong> <a href="${
              movie.trailer
            }" target="_blank">Ver Trailer</a></p>             

          </div>
        </div>

        <div class="movie-description">
          <h3>Sinopsis</h3>
          <p>${movie.description}</p>
       </div>

        <div class="movie-links">
       
        <h3>Ver online</h3>
       
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
          </div>
          </div>
          <div id="dynamic-player" class="movie-player" style="display:none;"></div>
          </article>
        `;

      // Delegación de evento para mostrar reproductor dinámico
      document.querySelectorAll(".watch-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.dataset.url;
          const dynamicPlayer = document.getElementById("dynamic-player");

          dynamicPlayer.innerHTML = `
              <iframe src="${url}" frameborder="0" allowfullscreen></iframe>
              `;

          dynamicPlayer.style.display = "block";
          dynamicPlayer.scrollIntoView({ behavior: "smooth" });
        });
      });
    })

    .catch((err) => {
      console.log("Error cargando datos", err);
      container.innerHTML = "<p>Error al cargar los datos de la pelicula</p>";
    });
});

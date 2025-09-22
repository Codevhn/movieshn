// Cargar películas desde el JSON
fetch("data/movies.json")
  .then((response) => response.json())
  .then((movies) => {
    movies.forEach((movie) => {
      // Crear la tarjeta
      const card = document.createElement("a");
      card.classList.add("movie");

      // Si la película tiene embed, será clickeable
      if (movie.embed && movie.embed.trim() !== "") {
        card.href = `movie.html?id=${movie.id}`;
      } else {
        card.classList.add("unavailable");
      }

      card.innerHTML = `
        <img src="${movie.cover}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.year}</p>
      `;

      // === Clasificación por categorías ===
      if (movie.genre.includes("Terror")) {
        document
          .querySelector("#terror .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Suspenso")) {
        document
          .querySelector("#suspenso .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Accion")) {
        document
          .querySelector("#accion .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Comedia")) {
        document
          .querySelector("#comedia .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Fantasia")) {
        document
          .querySelector("#fantasia .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Ciencia Ficcion")) {
        document
          .querySelector("#ciencia-ficcion .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("Animacion")) {
        document
          .querySelector("#animacion .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      if (movie.genre.includes("TV")) {
        document
          .querySelector("#series .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      // === Lógica de "Recientes" ===
      if (movie.year >= 2023) {
        document
          .querySelector("#recientes .movie-grid")
          .appendChild(card.cloneNode(true));
      }

      // === Lógica de "Más vistas" (placeholder, depende del JSON) ===
      if (movie.popularity && movie.popularity >= 80) {
        document
          .querySelector("#mas-vistas .movie-grid")
          .appendChild(card.cloneNode(true));
      }
    });
  })
  .catch((err) => {
    console.error("Error cargando JSON de películas:", err);
  });

// === Menú hamburguesa ===
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

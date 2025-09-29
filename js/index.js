// ================================
// MoviesHN - Home logic (index.js)
// ================================

let allMovies = [];

// Helpers
const $ = (sel) => document.querySelector(sel);
const appendTo = (selector, node) => {
  const grid = $(selector);
  if (grid) grid.appendChild(node);
};
const clearAllGrids = () => {
  document.querySelectorAll(".movie-grid").forEach((g) => (g.innerHTML = ""));
};

const createCard = (movie) => {
  const card = document.createElement("a");
  card.className = "movie";

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
  return card;
};

// ========================
// RENDER MOVIES
// ========================
function renderMovies(movies, filtered = false) {
  // Limpiar todas las grillas
  document.querySelectorAll(".movie-grid").forEach((grid) => {
    grid.innerHTML = "";
  });

  const sections = document.querySelectorAll(".movie-section");
  const resultsSection = document.querySelector("#search-results");
  const resultsGrid = resultsSection.querySelector(".movie-grid");

  if (filtered) {
    // ✅ Mostrar solo resultados
    sections.forEach((s) => (s.style.display = "none"));
    resultsSection.style.display = "block";

    if (!movies.length) {
      resultsGrid.innerHTML = `
        <div class="no-results">
          No hay películas disponibles para este año.
        </div>
      `;
      return;
    }

    movies.forEach((movie) => {
      const card = createCard(movie);
      resultsGrid.appendChild(card);
    });

    return;
  }

  // ✅ Render normal (estado inicial)
  sections.forEach((s) => (s.style.display = "block"));
  resultsSection.style.display = "none";

  movies.forEach((movie) => {
    const card = createCard(movie);
    const year = parseInt(movie.year, 10) || 0;
    const g = Array.isArray(movie.genre) ? movie.genre : [];

    // === Recientes ===
    if (year >= 2020) appendTo("#recientes .movie-grid", card.cloneNode(true));

    // === Más vistas (placeholder) ===
    if (movie.popularity && movie.popularity >= 80)
      appendTo("#mas-vistas .movie-grid", card.cloneNode(true));

    // === Categorías ===
    if (g.includes("Terror"))
      appendTo("#terror .movie-grid", card.cloneNode(true));
    if (g.includes("Suspenso"))
      appendTo("#suspenso .movie-grid", card.cloneNode(true));
    if (g.includes("Acción"))
      appendTo("#accion .movie-grid", card.cloneNode(true));
    if (g.includes("Comedia"))
      appendTo("#comedia .movie-grid", card.cloneNode(true));
    if (g.includes("Fantasía"))
      appendTo("#fantasia .movie-grid", card.cloneNode(true));
    if (g.includes("Ciencia Ficción"))
      appendTo("#ciencia-ficcion .movie-grid", card.cloneNode(true));
    if (g.includes("Animación"))
      appendTo("#animacion .movie-grid", card.cloneNode(true));
    if (g.includes("Documental"))
      appendTo("#documentales .movie-grid", card.cloneNode(true));
    if (g.includes("TV Series"))
      appendTo("#tv-series .movie-grid", card.cloneNode(true));
    if (g.includes("Aventura"))
      appendTo("#aventura .movie-grid", card.cloneNode(true));
    if (g.includes("Musical"))
      appendTo("#musical .movie-grid", card.cloneNode(true));
    if (g.includes("Drama"))
      appendTo("#drama .movie-grid", card.cloneNode(true));
    if (g.includes("Biografia") || g.includes("Biografía"))
      appendTo("#biografia .movie-grid", card.cloneNode(true));
  });
}

// ========================
// Fetch + Init
// ========================
fetch("./data/movies.json")
  .then((r) => r.json())
  .then((movies) => {
    allMovies = movies || [];
    renderMovies(allMovies);
    initYearFilter();
    initMenu();
  })
  .catch((err) => console.error("Error cargando JSON de películas:", err));

// ========================
// Filtro por AÑO (aside)
// ========================
function initYearFilter() {
  const yearSpans = document.querySelectorAll(".years-grid span");
  if (!yearSpans.length) return;

  yearSpans.forEach((span) => {
    span.addEventListener("click", () => {
      const alreadyActive = span.classList.contains("active");
      document
        .querySelectorAll(".years-grid span")
        .forEach((s) => s.classList.remove("active"));

      if (alreadyActive) {
        renderMovies(allMovies, false); // volver al estado inicial
        return;
      }

      span.classList.add("active");

      const y = span.dataset.year
        ? parseInt(span.dataset.year, 10)
        : parseInt(span.textContent.trim(), 10);

      const filtered = allMovies.filter((m) => parseInt(m.year, 10) === y);
      renderMovies(filtered, true); // mostrar solo resultados
    });
  });
}

// ========================
// Menú hamburguesa
// ========================
function initMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const nav = document.querySelector(".site-nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => nav.classList.add("active"));
  }
  if (menuClose && nav) {
    menuClose.addEventListener("click", () => nav.classList.remove("active"));
  }
  document
    .querySelectorAll(".site-nav a")
    .forEach((link) =>
      link.addEventListener(
        "click",
        () => nav && nav.classList.remove("active")
      )
    );
}

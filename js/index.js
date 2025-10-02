// ================================
// MoviesHN - Home logic (index.js)
// ================================

let allMovies = [];
let allSeries = []; // New array for series

// Helpers
const $ = (sel) => document.querySelector(sel);
const appendTo = (selector, node) => {
  const grid = $(selector);
  if (grid) grid.appendChild(node);
};
const clearAllGrids = () => {
  document.querySelectorAll(".movie-grid").forEach((g) => (g.innerHTML = ""));
};

const createCard = (item, type = 'movie') => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const hasEmbed = item.embed && item.embed.trim() !== "";
  const stored = JSON.parse(localStorage.getItem("myList")) || [];
  const alreadyInList = stored.includes(item.id);

  let linkHref = '';
  if (type === 'movie') {
    linkHref = hasEmbed ? `movie.html?id=${item.id}` : "";
  } else if (type === 'series') {
    linkHref = `series.html?id=${item.id}`;
  }

  card.innerHTML = `
      <a ${linkHref ? `href="${linkHref}"` : ""} class="movie ${!linkHref ? "unavailable" : ""}">
        <img src="${item.cover}" alt="${item.title}">
        <div class="movie-info">
          <h3>${item.title}</h3>
          <p>${item.year}</p>
        </div>      
      </a>
      <button class="add-to-list" data-id="${item.id}" data-type="${type}">
        ${alreadyInList ? "✅ En mi lista" : "+ Mi lista"}
      </button>
  `;
  return card;
};

// ========================
// RENDER HERO
// ========================
function renderHero(movie) {
    const heroBg = document.querySelector('.hero-background img');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const watchNowBtn = document.getElementById('hero-watch-now');

    if (!heroBg || !heroTitle || !heroDescription || !watchNowBtn) {
        console.error('Hero elements not found!');
        return;
    }

    heroBg.src = movie.backdrop || movie.cover;
    heroTitle.textContent = movie.title;
    heroDescription.textContent = movie.description.substring(0, 120) + '...';

    if (movie.embed && movie.embed.trim() !== '') {
        watchNowBtn.href = `movie.html?id=${movie.id}`;
    } else {
        watchNowBtn.classList.add('disabled');
        watchNowBtn.href = '#';
    }
}


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
    // if (movie.popularity && movie.popularity >= 80)
    //   appendTo("#mas-vistas .movie-grid", card.cloneNode(true));

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
    if (g.includes("Hackers y Ciberseguridad")) {
      appendTo("#hackers-y-ciberseguridad .movie-grid", card.cloneNode(true));
    }
  });
}

// ========================
// RENDER LATEST SERIES
// ========================
function renderLatestSeries(seriesList) {
  const latestSeriesGrid = document.querySelector("#latest-series-section .movie-grid");
  if (!latestSeriesGrid) return;

  latestSeriesGrid.innerHTML = ''; // Clear existing content

  // Render a limited number of series, e.g., the first 6
  seriesList.slice(0, 6).forEach(series => {
    const card = createCard(series, 'series');
    latestSeriesGrid.appendChild(card);
  });
}

// ========================
// RENDER ALL TV SERIES CATEGORY
// ========================
function renderTvSeriesCategory(seriesList) {
  const tvSeriesCategoryGrid = document.querySelector("#tv-series-category .movie-grid");
  if (!tvSeriesCategoryGrid) return;

  tvSeriesCategoryGrid.innerHTML = ''; // Clear existing content

  // Render all series in this section
  seriesList.forEach(series => {
    const card = createCard(series, 'series');
    tvSeriesCategoryGrid.appendChild(card);
  });
}

// ========================
// Update counts for Mi Lista and Favoritos
// ========================
function updateCounts() {
  const myListCountSpan = document.getElementById('mylist-count');
  const favoritesCountSpan = document.getElementById('favorites-count');
  const stored = JSON.parse(localStorage.getItem('myList')) || [];
  const count = stored.length;

  if (myListCountSpan) {
    myListCountSpan.textContent = `(${count})`;
  }
  if (favoritesCountSpan) {
    favoritesCountSpan.textContent = `(${count})`; // For now, favorites mirrors mylist
  }
}

// ========================
// Smooth Scroll Function
// ========================
function smoothScrollTo(targetId) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const headerOffset = document.querySelector('.site-header').offsetHeight;
  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerOffset - 20; // 20px extra padding

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

// ========================
// Fetch + Init
// ========================
Promise.all([
  fetch("./data/movies.json").then((r) => r.json()),
  fetch("./data/series.json").then((r) => r.json())
])
  .then(([movies, series]) => {
    allMovies = movies || [];
    allSeries = series || [];

    const availableMovies = allMovies.filter(m => m.embed && m.embed.trim() !== '');
    if (availableMovies.length > 0) {
        const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
        renderHero(randomMovie);
    }

    renderMovies(allMovies);
    renderLatestSeries(allSeries); // Render latest series
    renderTvSeriesCategory(allSeries); // Render all TV series
    initYearFilter();
    initMenu();
    initMyList();
    initAccordion(); // Call the new accordion function
    updateCounts(); // Call updateCounts on initial load
  })
  .catch((err) => console.error("Error cargando JSON de datos:", err));

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

  // Smooth scrolling for nav links
  document.querySelectorAll('#main-fixed-sidebar a[href^="#"], .site-nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      smoothScrollTo(targetId);

      // Close mobile menu if open
      if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
      }
    });
  });
}

/***
 *
 * funciona para manejar los clics de "Mi lista"
 *
 *
 *
 */

function initMyList() {
  document.addEventListener("click", (e) => {
    if (!e.target.matches(".add-to-list")) return;

    console.log("🟡 Click detectado en botón Mi lista");

    const btn = e.target;
    const itemId = btn.dataset.id;
    const itemType = btn.dataset.type; // 'movie' or 'series'
    if (!itemId) return;

    const stored = JSON.parse(localStorage.getItem("myList")) || [];
    const alreadyInList = stored.includes(itemId);

    if (alreadyInList) {
      //QUitar item
      const newList = stored.filter((id) => id !== itemId);
      localStorage.setItem("myList", JSON.stringify(newList));
      btn.textContent = "➕ Mi lista";
    } else {
      //Agregar item
      stored.push(itemId);
      localStorage.setItem("myList", JSON.stringify(stored));
      btn.textContent = "✅ En mi lista";
    }
    updateCounts(); // Call updateCounts after modifying myList
  });
}

// ========================
// Accordion for sidebar-left
// ========================
function initAccordion() {
  document.querySelectorAll('.sidebar-category').forEach(category => {
    const toggle = category.querySelector('.category-toggle');
    const content = toggle.nextElementSibling; // Select the element immediately following the toggle

    if (toggle && content) {
      content.classList.add('category-content'); // Ensure content has the class for CSS transitions

      // Initially collapse all content
      content.classList.remove('expanded');
      toggle.classList.remove('expanded');

      toggle.addEventListener('click', () => {
        console.log('Accordion toggle clicked!', content.classList.contains('expanded') ? 'Collapsing' : 'Expanding');
        // Toggle the expanded class on the content
        content.classList.toggle('expanded');
        // Toggle the expanded class on the toggle itself for arrow rotation
        toggle.classList.toggle('expanded');
      });
    }
  });
}
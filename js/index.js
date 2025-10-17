// ================================
// MoviesHN - Home logic (index.js)
// ================================

let allMovies = [];
let allSeries = []; // New array for series
let heroMovies = []; // Array para las películas del Hero dinámico
let currentHeroMovieIndex = 0;

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
        <img src="${item.cover}" alt="${item.title}" loading="lazy">
        <div class="movie-info">
          <h3>${item.title}</h3>
          <p>${item.year}</p>
        </div>      
      </a>
      <button class="add-to-list ${alreadyInList ? 'added-to-list' : ''}" data-id="${item.id}" data-type="${type}">
        ${alreadyInList ? "En mi lista" : "Mi lista"}
      </button>
  `;
  return card;
};

// ========================
// RENDER HERO
// ========================
function renderHero(movie) {
    const heroSection = document.querySelector(".hero");
    const heroBg = document.querySelector('.hero-background img');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-content p');
    const watchNowBtn = document.getElementById('hero-watch-now');

    if (!heroBg || !heroTitle || !heroDescription || !watchNowBtn || !heroSection) {
        console.error('Hero elements not found!');
        return;
    }

    // Aplicar una clase para la transición de opacidad
    heroSection.classList.add("fade-out");

    setTimeout(() => {
        heroBg.src = movie.backdrop || movie.cover;
        heroBg.loading = 'lazy'; // Lazy loading for hero image
        heroTitle.textContent = movie.title;
        heroDescription.textContent = movie.description.substring(0, 120) + '...';

        // Modificado para apuntar a movie.html
        if (movie.id) { // Asegurarse de que la película tenga un ID
            watchNowBtn.href = `movie.html?id=${movie.id}`;
            watchNowBtn.target = "_self"; // Mantener en la misma pestaña
            watchNowBtn.style.display = "inline-block"; // Mostrar el botón
        } else {
            watchNowBtn.href = "#";
            watchNowBtn.target = "_self";
            watchNowBtn.style.display = "none"; // Ocultar si no hay ID
        }

        heroSection.classList.remove("fade-out");
        heroSection.classList.add("fade-in");
        setTimeout(() => {
            heroSection.classList.remove("fade-in");
        }, 500); // Duración de la transición
    }, 500); // Esperar a que termine el fade-out
}

// ========================
// START DYNAMIC HERO CYCLE
// ========================
function startDynamicHeroCycle() {
    const availableMovies = allMovies.filter(m => m.backdrop && m.backdrop.trim() !== '');
    if (availableMovies.length === 0) {
        console.warn("No movies with backdrops found for dynamic hero.");
        return;
    }

    heroMovies = availableMovies.sort(() => Math.random() - 0.5); // Mezclar películas

    renderHero(heroMovies[currentHeroMovieIndex]);

    setInterval(() => {
        currentHeroMovieIndex = (currentHeroMovieIndex + 1) % heroMovies.length;
        renderHero(heroMovies[currentHeroMovieIndex]);
    }, 8000); // Cambiar cada 8 segundos
}

// ========================
// ADJUST HERO POSITION (for fixed header)
// ========================
function adjustHeroPosition() {
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        const headerHeight = siteHeader.offsetHeight;
        document.body.style.paddingTop = `${headerHeight + 40}px`; // Añadir 40px extra para bajar el Hero
    }
}

// ========================
// RENDER MOVIES
// ========================
// RENDER MOVIES - MODERN LAYOUT WITH LIMITS
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
    // ✅ Mostrar solo resultados (sin cambios)
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

  // ✅ Render moderno con límites (grid normal, no scroll)
  sections.forEach((s) => (s.style.display = "block"));
  resultsSection.style.display = "none";

  // Make headings clickable for navigation
  makeHeadingsClickable();

  // Group movies by category with limits
  const moviesByCategory = {
    recientes: [],
    'mas-vistas': [],
    terror: [],
    suspenso: [],
    accion: [],
    comedia: [],
    fantasia: [],
    'ciencia-ficcion': [],
    aventura: [],
    animacion: [],
    musical: [],
    biografia: [],
    drama: [],
    documentales: [],
    'hackers-y-ciberseguridad': []
  };

  // Categorize movies
  movies.forEach((movie) => {
    const year = parseInt(movie.year, 10) || 0;
    const g = Array.isArray(movie.genre) ? movie.genre : [];

    // === Recientes ===
    if (year >= 2020) moviesByCategory.recientes.push(movie);

    // === Categorías ===
    if (g.includes("Terror"))
      moviesByCategory.terror.push(movie);
    if (g.includes("Suspenso"))
      moviesByCategory.suspenso.push(movie);
    if (g.includes("Acción"))
      moviesByCategory.accion.push(movie);
    if (g.includes("Comedia"))
      moviesByCategory.comedia.push(movie);
    if (g.includes("Fantasía"))
      moviesByCategory.fantasia.push(movie);
    if (g.includes("Ciencia Ficción"))
      moviesByCategory['ciencia-ficcion'].push(movie);
    if (g.includes("Animación"))
      moviesByCategory.animacion.push(movie);
    if (g.includes("Documental"))
      moviesByCategory.documentales.push(movie);
    if (g.includes("Aventura"))
      moviesByCategory.aventura.push(movie);
    if (g.includes("Musical"))
      moviesByCategory.musical.push(movie);
    if (g.includes("Drama"))
      moviesByCategory.drama.push(movie);
    if (g.includes("Biografia") || g.includes("Biografía"))
      moviesByCategory.biografia.push(movie);
    if (g.includes("Hackers y Ciberseguridad"))
      moviesByCategory['hackers-y-ciberseguridad'].push(movie);
  });

  // Render limited items for each category (MAX 10 items in grid)
  Object.keys(moviesByCategory).forEach(categoryId => {
    const categoryMovies = moviesByCategory[categoryId];
    const container = document.querySelector(`#${categoryId} .movie-grid`);
    
    if (container && categoryMovies.length > 0) {
      // Reverse array to show most recent movies first (last in JSON = first in display)
      const reversedMovies = [...categoryMovies].reverse();
      // Limit to 10 items max (2 rows of 5)
      const limitedMovies = reversedMovies.slice(0, 10);
      
      limitedMovies.forEach(movie => {
        const card = createCard(movie);
        container.appendChild(card);
      });

      // Show the section
      const section = document.getElementById(categoryId);
      if (section) {
        section.style.display = 'block';
      }
    } else {
      // Hide empty sections
      const section = document.getElementById(categoryId);
      if (section) {
        section.style.display = 'none';
      }
    }
  });
}

// Make headings clickable for navigation to dedicated pages
function makeHeadingsClickable() {
  const categories = [
    'recientes', 'mas-vistas', 'terror', 'suspenso', 'accion', 
    'comedia', 'fantasia', 'ciencia-ficcion', 'aventura', 
    'animacion', 'musical', 'biografia', 'drama', 'documentales', 
    'hackers-y-ciberseguridad', 'tv-series'
  ];

  categories.forEach(categoryId => {
    const section = document.getElementById(categoryId);
    if (!section) return;

    const heading = section.querySelector('h2');

    if (heading) {
      // Add click handler for category page navigation
      heading.onclick = () => {
        navigateToCategoryPage(categoryId);
      };
      
      // Add cursor pointer for better UX
      heading.style.cursor = 'pointer';
      
      // Add visual indicator for clickable state
      heading.style.borderLeft = '4px solid var(--primary-accent-color)';
      heading.style.transition = 'border-left-color 0.2s ease';
    }
  });
}

// Navigate to dedicated category page
function navigateToCategoryPage(categoryId) {
  console.log(`Navigating to ${categoryId} page`);
  
  // Map category IDs to page names
  const categoryPages = {
    'recientes': 'recientes.html',
    'terror': 'terror.html',
    'accion': 'accion.html',
    'comedia': 'comedia.html',
    'ciencia-ficcion': 'ciencia-ficcion.html',
    'fantasia': 'fantasia.html',
    'aventura': 'aventura.html',
    'drama': 'drama.html',
    'suspenso': 'suspenso.html',
    'animacion': 'animacion.html',
    'documentales': 'documentales.html',
    'musical': 'musical.html',
    'biografia': 'biografia.html',
    'hackers-y-ciberseguridad': 'hackers-y-ciberseguridad.html',
    'tv-series': 'all-series.html',
    'mas-vistas': 'mas-vistas.html'
  };
  
  const categoryPage = categoryPages[categoryId];
  
  if (categoryPage) {
    // Navigate to the dedicated category page
    window.location.href = categoryPage;
  } else {
    // Fallback: use search functionality for now
    console.log(`No dedicated page for ${categoryId}, using search fallback`);
    showFullCategory(categoryId);
  }
}

// Fallback function for categories without dedicated pages (keep for now)
function showFullCategory(categoryId) {
  console.log(`Showing full category: ${categoryId}`);
  
  // Filter movies by category
  const categoryMovies = allMovies.filter(movie => {
    const genres = Array.isArray(movie.genre) ? movie.genre : [];
    const year = parseInt(movie.year, 10) || 0;
    
    switch (categoryId) {
      case 'recientes':
        return year >= 2020;
      case 'terror':
        return genres.includes("Terror");
      case 'accion':
        return genres.includes("Acción");
      case 'comedia':
        return genres.includes("Comedia");
      case 'ciencia-ficcion':
        return genres.includes("Ciencia Ficción");
      case 'fantasia':
        return genres.includes("Fantasía");
      case 'aventura':
        return genres.includes("Aventura");
      case 'drama':
        return genres.includes("Drama");
      case 'suspenso':
        return genres.includes("Suspenso");
      case 'animacion':
        return genres.includes("Animación");
      case 'documentales':
        return genres.includes("Documental");
      case 'musical':
        return genres.includes("Musical");
      case 'biografia':
        return genres.includes("Biografia") || genres.includes("Biografía");
      case 'hackers-y-ciberseguridad':
        return genres.includes("Hackers y Ciberseguridad");
      case 'tv-series':
        return genres.includes("TV Series");
      default:
        return false;
    }
  });

  // Show as search results
  renderMovies(categoryMovies, true);
  
  // Update search results heading with category name
  const categoryNames = {
    'recientes': 'Recientes',
    'terror': 'Terror',
    'accion': 'Acción',
    'comedia': 'Comedia',
    'ciencia-ficcion': 'Ciencia Ficción',
    'fantasia': 'Fantasía',
    'aventura': 'Aventura',
    'drama': 'Drama',
    'suspenso': 'Suspenso',
    'animacion': 'Animación',
    'documentales': 'Documentales',
    'musical': 'Musical',
    'biografia': 'Biografía',
    'hackers-y-ciberseguridad': 'Hackers y Ciberseguridad',
    'tv-series': 'Series de TV',
    'mas-vistas': 'Más Vistas'
  };
  
  const resultsHeading = document.querySelector("#search-results h2");
  if (resultsHeading) {
    const categoryName = categoryNames[categoryId] || categoryId;
    resultsHeading.textContent = categoryName;
  }
}

// ========================
// RENDER LATEST SERIES
// ========================
// INDEX PAGE - MOVIES ONLY
// ========================
console.log('Index page reorganized - movies only, series moved to dedicated page');

// ===============================
// RENDER SIDEBAR CONTENT (SERIES)
// ===============================
function renderSidebarSeries(seriesList) {
  // 1. Render "Últimas Series Agregadas"
  const latestSeriesContainer = document.getElementById('latest-series-sidebar');
  if (latestSeriesContainer) {
    latestSeriesContainer.innerHTML = ''; // Limpiar
    const latestSeries = seriesList.slice(-3).reverse(); // Tomar las últimas 3

    latestSeries.forEach(series => {
      const item = document.createElement('div');
      item.className = 'featured-item';
      item.innerHTML = `
        <img src="${series.cover}" alt="${series.title}" loading="lazy">
        <p>${series.title}</p>
      `;
      item.addEventListener('click', () => {
        window.location.href = `series.html?id=${series.id}`;
      });
      latestSeriesContainer.appendChild(item);
    });
  }

  // 2. Render "Serie del Día"
  const recommendedContainer = document.getElementById('recommended-series-container');
  if (recommendedContainer && seriesList.length > 0) {
    recommendedContainer.innerHTML = ''; // Limpiar
    const randomSeries = seriesList[Math.floor(Math.random() * seriesList.length)];

    const item = document.createElement('div');
    item.className = 'featured-item';
    item.innerHTML = `
        <img src="${randomSeries.cover}" alt="${randomSeries.title}" loading="lazy">
        <p>${randomSeries.title}</p>
    `;
    item.addEventListener('click', () => {
        window.location.href = `series.html?id=${randomSeries.id}`;
    });
    recommendedContainer.appendChild(item);
  }
}

// ========================
// RENDER CONTINUE WATCHING SECTION
// ========================
function renderContinueWatching() {
  const continueWatchingSection = document.getElementById('continue-watching-section');
  const continueWatchingGrid = document.getElementById('continue-watching-grid');
  if (!continueWatchingSection || !continueWatchingGrid) return;

  const recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];

  if (recentlyWatched.length > 0) {
    continueWatchingSection.style.display = 'block';
    continueWatchingGrid.innerHTML = '';

    recentlyWatched.forEach(item => {
      // Find the full movie object from allMovies to get all its properties
      const fullMovieInfo = allMovies.find(m => m.id === item.id);
      if (fullMovieInfo) {
        const card = createCard(fullMovieInfo, 'movie');
        continueWatchingGrid.appendChild(card);
      }
    });

    // Hide the section if no valid movies were found and added
    if (continueWatchingGrid.children.length === 0) {
        continueWatchingSection.style.display = 'none';
    }

  } else {
    continueWatchingSection.style.display = 'none';
  }
}

// ========================
// Update counts for Mi Lista
// ========================
function updateCounts() {
  const myListCountSpan = document.getElementById('mylist-count');
  const stored = JSON.parse(localStorage.getItem('myList')) || [];
  const count = stored.length;

  if (myListCountSpan) {
    myListCountSpan.textContent = `(${count})`;
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
  const offsetPosition = elementPosition - headerOffset - 20; // Restar el alto del header y un poco más para padding

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

// ========================
// Fetch + Init
// ========================
Promise.all([
  fetch("data/movies.json").then((r) => r.json()),
  fetch("data/series.json").then((r) => r.json())
])
  .then(([movies, series]) => {
    allMovies = movies || [];
    allSeries = series || [];

    startDynamicHeroCycle(); // Iniciar el ciclo del Hero dinámico

    renderMovies(allMovies);
    // renderLatestSeries(allSeries); // Render latest series - FUNCIÓN NO DEFINIDA
    // renderTvSeriesCategory(allSeries); // Render all TV series - FUNCIÓN NO DEFINIDA
    renderSidebarSeries(allSeries); // Render sidebar series
    initYearFilter();
    initMenu();
    initMyList();
    updateCounts(); // Call updateCounts on initial load
    renderCarousel(allMovies, allSeries); // Render the new carousel
    renderContinueWatching(); // Render continue watching section

    adjustHeroPosition(); // Ajustar la posición del Hero al cargar
  })
  .catch((err) => console.error("Error cargando JSON de datos:", err));

// Event listeners para ajustar la posición del Hero en resize
window.addEventListener('resize', adjustHeroPosition);

// ========================
// RENDER CAROUSEL
// ========================
function renderCarousel(movies, series) {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    const combinedItems = [];
    // Tomar una selección de las últimas películas y series
    const latestMovies = movies.slice(0, 10); // Últimas 10 películas
    const latestSeries = series.slice(0, 10); // Últimas 10 series

    // Combinar y mezclar ligeramente para variedad
    latestMovies.forEach(m => combinedItems.push({ ...m, type: 'movie' }));
    latestSeries.forEach(s => combinedItems.push({ ...s, type: 'series' }));
    combinedItems.sort(() => 0.5 - Math.random()); // Mezcla simple

    // Duplicar el contenido para un loop continuo
    const itemsToRender = [...combinedItems, ...combinedItems];

    carouselTrack.innerHTML = ''; // Limpiar para evitar duplicados en recargas

    itemsToRender.forEach(item => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const link = document.createElement('a');
        link.className = 'carousel-link';
        link.href = item.type === 'series' ? `series.html?id=${item.id}` : `movie.html?id=${item.id}`;
        link.setAttribute('aria-label', item.title);

        const image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        image.loading = 'lazy';

        const badge = document.createElement('span');
        badge.className = 'carousel-badge';
        badge.textContent = item.type === 'series' ? 'Serie' : 'Película';

        link.appendChild(image);
        link.appendChild(badge);
        carouselItem.appendChild(link);
        carouselTrack.appendChild(carouselItem);
    });

    if (itemsToRender.length) {
        const baseSpeed = 22;
        const duration = Math.max(baseSpeed, combinedItems.length * 3);
        carouselTrack.style.animationDuration = `${duration}s`;
    }
}

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

// Variable para asegurarnos de que solo se inicialice una vez
let myListInitialized = false;

function initMyList() {
  if (myListInitialized) {
    console.log("🟢 initMyList() ya fue inicializada, saltando...");
    return;
  }
  
  console.log("🟢 initMyList() inicializada");
  myListInitialized = true;
  
  document.addEventListener("click", (e) => {
    if (!e.target.matches(".add-to-list")) return;

    console.log("🟡 Click detectado en botón Mi lista");

    const btn = e.target;
    const itemId = btn.dataset.id;
    const itemType = btn.dataset.type; // 'movie' or 'series'
    
    console.log("📋 Item ID:", itemId, "Tipo:", itemType);
    
    if (!itemId) {
      console.error("❌ No se encontró ID del item");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("myList")) || [];
    const alreadyInList = stored.includes(itemId);

    console.log("📦 Lista actual:", stored, "Ya en lista:", alreadyInList);

    if (alreadyInList) {
      //Quitar item
      const newList = stored.filter((id) => id !== itemId);
      localStorage.setItem("myList", JSON.stringify(newList));
      btn.textContent = "Mi lista";
      btn.classList.remove('added-to-list');
      console.log("➖ Item removido de la lista");
    } else {
      //Agregar item al principio de la lista
      stored.unshift(itemId);
      localStorage.setItem("myList", JSON.stringify(stored));
      btn.textContent = "En mi lista";
      btn.classList.add('added-to-list');
      console.log("➕ Item agregado al principio de la lista");
    }
    updateCounts(); // Call updateCounts after modifying myList
  });
}

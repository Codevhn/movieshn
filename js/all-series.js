const STATE = {
  seriesData: [],
  filteredSeries: [],
  activeFilters: {
    genre: '',
    year: '',
    search: ''
  },
  viewMode: 'grid',
  sortOption: 'featured',
  currentPage: 1,
  itemsPerPage: 20,
  quickFilter: 'all' // Nuevo filtro rápido
};

const DOM = {};

document.addEventListener('DOMContentLoaded', async () => {
  cacheDomReferences();

  if (!DOM.seriesGallery) {
    console.error('Series gallery element not found');
    return;
  }

  try {
    showLoadingState();
    STATE.seriesData = await fetchSeriesData();
    console.log('Series data loaded:', STATE.seriesData.length, 'series');
    updateStats(STATE.seriesData);
    setupFilterListeners();
    setupSidebarListeners(); // Nueva función para sidebars
    populateSidebarContent(); // Nueva función para llenar contenido
    applyFilters();
    hideLoadingState();
  } catch (error) {
    console.error('Error al cargar los datos de las series:', error);
    showErrorState();
  }
});

function cacheDomReferences() {
  DOM.seriesGallery = document.getElementById('series-gallery');
  DOM.seriesSearch = document.getElementById('series-search');
  DOM.genreFilter = document.getElementById('genre-filter');
  DOM.yearFilter = document.getElementById('year-filter');
  DOM.sortFilter = document.getElementById('sort-filter');
  DOM.viewButtons = document.querySelectorAll('.view-btn');
  DOM.resultsCount = document.getElementById('results-count');
  DOM.emptyState = document.getElementById('empty-state');
  DOM.loadingState = document.getElementById('loading-state');
  DOM.activeFilters = document.getElementById('active-filters');
  DOM.filterTags = document.getElementById('filter-tags');
  DOM.clearSearch = document.getElementById('clear-search');
  
  // Nuevos elementos del sidebar
  DOM.totalSeriesCount = document.getElementById('total-series-count');
  DOM.favoritesCount = document.getElementById('favorites-count');
  DOM.filterButtons = document.querySelectorAll('.filter-btn');
  DOM.genreTags = document.querySelectorAll('.genre-tag');
  DOM.featuredSeries = document.getElementById('featured-series');
}

async function fetchSeriesData() {
  const response = await fetch('./data/series.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload;
}

function setupFilterListeners() {
  // Búsqueda
  if (DOM.seriesSearch) {
    DOM.seriesSearch.addEventListener('input', debounce((event) => {
      STATE.activeFilters.search = event.target.value.trim();
      STATE.currentPage = 1;
      applyFilters();
    }, 300));
  }

  // Filtros de selección
  [DOM.genreFilter, DOM.yearFilter, DOM.sortFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', (event) => {
        const filterType = filter.id.replace('-filter', '');
        if (filterType === 'sort') {
          STATE.sortOption = event.target.value;
        } else {
          STATE.activeFilters[filterType] = event.target.value;
          STATE.currentPage = 1;
        }
        applyFilters();
      });
    }
  });

  // Botones de vista
  if (DOM.viewButtons) {
    DOM.viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const viewMode = button.dataset.view;
        if (viewMode !== STATE.viewMode) {
          STATE.viewMode = viewMode;
          updateViewButtons();
          renderSeries();
        }
      });
    });
  }

  // Botón shuffle
  if (DOM.shuffleBtn) {
    DOM.shuffleBtn.addEventListener('click', () => {
      shuffleSeries();
    });
  }

  // Limpiar todos los filtros
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('clear-all-filters')) {
      clearAllFilters();
    }
  });

  // Botón clear search
  if (DOM.clearSearch) {
    DOM.clearSearch.addEventListener('click', () => {
      if (DOM.seriesSearch) {
        DOM.seriesSearch.value = '';
        STATE.activeFilters.search = '';
        DOM.clearSearch.style.display = 'none';
        applyFilters();
      }
    });
  }

  // Mostrar/ocultar clear search button en input
  if (DOM.seriesSearch && DOM.clearSearch) {
    DOM.seriesSearch.addEventListener('input', (event) => {
      DOM.clearSearch.style.display = event.target.value ? 'block' : 'none';
    });
  }
}

function updateStats(seriesCollection) {
  if (DOM.resultsCount) {
    DOM.resultsCount.textContent = seriesCollection.length;
  }
}

function applyFilters() {
  // Filtrar datos
  STATE.filteredSeries = STATE.seriesData.filter(series => {
    // Filtro rápido
    if (STATE.quickFilter !== 'all') {
      switch (STATE.quickFilter) {
        case 'popular':
          // Filtrar series populares (con rating alto)
          if (!series.rating || series.rating < 7) return false;
          break;
        case 'recent':
          // Filtrar series recientes (últimos 3 años)
          const currentYear = new Date().getFullYear();
          const seriesYear = extractStartYear(series.year);
          if (currentYear - seriesYear > 3) return false;
          break;
        case 'favorites':
          // Filtrar solo favoritas (simulado)
          const favorites = JSON.parse(localStorage.getItem('mySeriesList') || '[]');
          if (!favorites.includes(series.id)) return false;
          break;
      }
    }
    
    // Filtro de búsqueda
    if (STATE.activeFilters.search) {
      const searchTerm = STATE.activeFilters.search.toLowerCase();
      const matchesTitle = series.title?.toLowerCase().includes(searchTerm);
      const matchesDescription = series.description?.toLowerCase().includes(searchTerm);
      const matchesGenre = series.genre?.some(g => g.toLowerCase().includes(searchTerm));
      
      if (!matchesTitle && !matchesDescription && !matchesGenre) {
        return false;
      }
    }

    // Filtro de género
    if (STATE.activeFilters.genre) {
      const hasGenre = series.genre?.some(g => 
        g.toLowerCase() === STATE.activeFilters.genre.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    // Filtro de año
    if (STATE.activeFilters.year) {
      const seriesYear = extractStartYear(series.year);
      if (STATE.activeFilters.year === 'older') {
        if (seriesYear >= 2021) return false;
      } else {
        const filterYear = parseInt(STATE.activeFilters.year);
        if (seriesYear !== filterYear) return false;
      }
    }

    return true;
  });

  // Ordenar resultados
  sortSeries();
  
  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(STATE.activeFilters).some(filter => filter !== '') || STATE.quickFilter !== 'all';
  
  // Actualizar UI
  updateActiveFilters();
  updateResultsCount();
  updateSidebarStats(); // Actualizar estadísticas del sidebar
  renderSeries();
}

function sortSeries() {
  STATE.filteredSeries.sort((a, b) => {
    switch (STATE.sortOption) {
      case 'newest':
        return extractStartYear(b.year) - extractStartYear(a.year);
      case 'oldest':
        return extractStartYear(a.year) - extractStartYear(b.year);
      case 'az':
        return a.title.localeCompare(b.title, 'es');
      case 'za':
        return b.title.localeCompare(a.title, 'es');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'featured':
      default:
        // Ordenamiento por featured: más nuevas primero, luego por título
        const yearDiff = extractStartYear(b.year) - extractStartYear(a.year);
        return yearDiff !== 0 ? yearDiff : a.title.localeCompare(b.title, 'es');
    }
  });
}

function renderSeries() {
  if (!DOM.seriesGallery) return;

  if (STATE.filteredSeries.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  // Calcular paginación
  const startIndex = (STATE.currentPage - 1) * STATE.itemsPerPage;
  const endIndex = startIndex + STATE.itemsPerPage;
  const paginatedSeries = STATE.filteredSeries.slice(startIndex, endIndex);

  // Aplicar clase de vista
  DOM.seriesGallery.className = `series-gallery ${STATE.viewMode === 'list' ? 'list-view' : ''}`;

  // Renderizar items
  DOM.seriesGallery.innerHTML = paginatedSeries.map(series => 
    createSeriesCard(series)
  ).join('');
}

function createSeriesCard(series) {
  const hasEpisodes = series.seasons && series.seasons.some(season => 
    season.episodes && season.episodes.length > 0
  );
  
  const totalEpisodes = series.seasons ? 
    series.seasons.reduce((total, season) => total + (season.episodes ? season.episodes.length : 0), 0) : 0;
  
  return `
    <article class="series-card">
      <a href="series.html?id=${series.id}" class="series-card__link ${!hasEpisodes ? 'unavailable' : ''}">
        <div class="series-card__poster">
          <img src="${series.cover}" alt="${series.title}" loading="lazy" />
          <div class="play-icon-overlay">
            <i class="fas fa-play"></i>
          </div>
          ${series.quality ? `<span class="series-card__badge">${series.quality}</span>` : ''}
        </div>
        <div class="series-card__body">
          <h3 class="series-card__title">${series.title}</h3>
          <p class="series-card__description">${(series.description || '').substring(0, 100)}${series.description?.length > 100 ? '...' : ''}</p>
          <div class="series-card__meta">
            <span><i class="fas fa-calendar"></i> ${series.year}</span>
            ${totalEpisodes > 0 ? `<span><i class="fas fa-play-circle"></i> ${totalEpisodes} eps</span>` : ''}
          </div>
          ${series.genre ? `<div class="series-card__genres">${series.genre.slice(0, 3).map(g => `<span>${g}</span>`).join('')}</div>` : ''}
        </div>
      </a>
    </article>
  `;
}

function updateActiveFilters() {
  const hasActiveFilters = Object.values(STATE.activeFilters).some(filter => filter !== '');
  
  if (!hasActiveFilters) {
    if (DOM.activeFilters) {
      DOM.activeFilters.hidden = true;
    }
    return;
  }

  if (DOM.activeFilters) {
    DOM.activeFilters.hidden = false;
  }

  if (DOM.filterTags) {
    DOM.filterTags.innerHTML = '';
    
    Object.entries(STATE.activeFilters).forEach(([type, value]) => {
      if (value) {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.innerHTML = `
          ${getFilterLabel(type, value)}
          <button type="button" onclick="removeFilter('${type}')">
            <i class="fas fa-times"></i>
          </button>
        `;
        DOM.filterTags.appendChild(tag);
      }
    });
  }
}

function getFilterLabel(type, value) {
  switch (type) {
    case 'search':
      return `Búsqueda: "${value}"`;
    case 'genre':
      return `Género: ${value}`;
    case 'year':
      return value === 'older' ? 'Año: Anteriores a 2021' : `Año: ${value}`;
    default:
      return value;
  }
}

function removeFilter(type) {
  STATE.activeFilters[type] = '';
  
  // Actualizar input/select correspondiente
  const element = document.getElementById(`${type}-filter`) || DOM.seriesSearch;
  if (element) {
    element.value = '';
  }
  
  STATE.currentPage = 1;
  applyFilters();
}

function clearAllFilters() {
  Object.keys(STATE.activeFilters).forEach(key => {
    STATE.activeFilters[key] = '';
  });
  
  // Restablecer filtro rápido
  STATE.quickFilter = 'all';
  
  // Actualizar botones de filtro rápido
  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });
  
  // Limpiar inputs
  [DOM.seriesSearch, DOM.genreFilter, DOM.yearFilter].forEach(element => {
    if (element) element.value = '';
  });
  
  // Ocultar botón clear search
  if (DOM.clearSearch) {
    DOM.clearSearch.style.display = 'none';
  }
  
  STATE.currentPage = 1;
  applyFilters();
}

function updateResultsCount() {
  if (DOM.resultsCount) {
    const count = STATE.filteredSeries.length;
    DOM.resultsCount.textContent = count;
  }
}

function updateViewButtons() {
  if (DOM.viewButtons) {
    DOM.viewButtons.forEach(btn => {
      const isActive = btn.dataset.view === STATE.viewMode;
      btn.classList.toggle('active', isActive);
    });
  }
}

function shuffleSeries() {
  // Aleatorizar orden
  STATE.filteredSeries = STATE.filteredSeries.sort(() => Math.random() - 0.5);
  STATE.currentPage = 1;
  renderSeries();
}

function showLoadingState() {
  console.log('Showing loading state');
  if (DOM.loadingState) {
    DOM.loadingState.style.display = 'flex';
  }
  if (DOM.emptyState) {
    DOM.emptyState.style.display = 'none';
  }
  if (DOM.seriesGallery) {
    DOM.seriesGallery.innerHTML = '';
  }
}

function hideLoadingState() {
  console.log('Hiding loading state');
  if (DOM.loadingState) {
    DOM.loadingState.style.display = 'none';
  }
}

function showEmptyState() {
  console.log('Showing empty state');
  if (DOM.emptyState) {
    DOM.emptyState.style.display = 'flex';
  }
  if (DOM.seriesGallery) {
    DOM.seriesGallery.innerHTML = '';
  }
}

function hideEmptyState() {
  console.log('Hiding empty state');
  if (DOM.emptyState) {
    DOM.emptyState.style.display = 'none';
  }
}

function showErrorState() {
  hideLoadingState(); // Ocultar loading primero
  if (DOM.seriesGallery) {
    DOM.seriesGallery.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error al cargar las series</h3>
        <p>Hubo un problema al cargar el catálogo. Por favor, recarga la página.</p>
        <button onclick="location.reload()" class="btn-primary">Recargar</button>
      </div>
    `;
  }
}

function extractStartYear(yearString) {
  if (!yearString) return 0;
  const match = yearString.toString().match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Función global para toggle de mi lista
window.toggleMyList = function(seriesId) {
  // Implementar lógica de mi lista aquí
  console.log('Toggle my list for series:', seriesId);
};

// Función global para limpiar filtros
window.clearAllFilters = clearAllFilters;

// ===== NUEVAS FUNCIONES PARA SIDEBARS =====

function setupSidebarListeners() {
  // Filtros rápidos
  if (DOM.filterButtons) {
    DOM.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        setQuickFilter(filter);
      });
    });
  }

  // Tags de géneros
  if (DOM.genreTags) {
    DOM.genreTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const genre = tag.dataset.genre;
        setGenreFilter(genre);
      });
    });
  }
}

function setQuickFilter(filter) {
  STATE.quickFilter = filter;
  
  // Actualizar botones activos
  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  // Aplicar filtro y renderizar
  STATE.currentPage = 1;
  applyFilters();
}

function setGenreFilter(genre) {
  STATE.activeFilters.genre = STATE.activeFilters.genre === genre ? '' : genre;
  
  // Actualizar selector de género si existe
  if (DOM.genreFilter) {
    DOM.genreFilter.value = STATE.activeFilters.genre;
  }
  
  STATE.currentPage = 1;
  applyFilters();
}

function populateSidebarContent() {
  updateSidebarStats();
  populateFeaturedSeries();
}

function updateSidebarStats() {
  if (DOM.totalSeriesCount) {
    DOM.totalSeriesCount.textContent = STATE.seriesData.length;
  }
  
  // Simular conteo de favoritos (en una app real vendría del localStorage o API)
  if (DOM.favoritesCount) {
    const favorites = JSON.parse(localStorage.getItem('mySeriesList') || '[]');
    DOM.favoritesCount.textContent = favorites.length;
  }
}

function populateFeaturedSeries() {
  if (!DOM.featuredSeries || !STATE.seriesData.length) return;
  
  // Seleccionar las mejores series (por rating o más recientes)
  const featured = STATE.seriesData
    .sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA; // Mayor rating primero
    })
    .slice(0, 4); // Top 4 series
  
  DOM.featuredSeries.innerHTML = featured.map(series => `
    <div class="featured-item" onclick="window.location.href='series.html?id=${series.id}'">
      <div class="featured-poster">
        <img src="${series.cover}" alt="${series.title}" loading="lazy">
      </div>
      <div class="featured-info">
        <div class="featured-title">${series.title}</div>
        <div class="featured-rating">
          <i class="fas fa-star"></i>
          <span>${series.rating || 'N/A'}</span>
        </div>
        <div class="featured-genre">${series.genre ? series.genre[0] : 'Serie'}</div>
      </div>
    </div>
  `).join('');
}



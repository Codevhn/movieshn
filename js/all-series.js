const STATE = {
  seriesData: [],
  filteredSeries: [],
  activeFilters: {
    genre: '',
    year: '',
    status: '',
    search: ''
  },
  viewMode: 'grid',
  sortOption: 'featured',
  currentPage: 1,
  itemsPerPage: 20
};

const DOM = {};

const BACKDROP_CONFIG = {
  interval: 9000,
  maxSlides: 8,
};

let showcaseIntervalId = null;

document.addEventListener('DOMContentLoaded', async () => {
  cacheDomReferences();

  if (!DOM.seriesGrid) {
    return;
  }

  try {
    showLoadingState();
    STATE.seriesData = await fetchSeriesData();
    updateStats(STATE.seriesData);
    setupFilterListeners();
    startShowcaseBackdropCycle(STATE.seriesData);
    applyFilters();
    hideLoadingState();
  } catch (error) {
    console.error('Error al cargar los datos de las series:', error);
    showErrorState();
  }
});

function cacheDomReferences() {
  DOM.seriesGrid = document.getElementById('series-grid');
  DOM.seriesSearch = document.getElementById('series-search');
  DOM.genreFilter = document.getElementById('genre-filter');
  DOM.yearFilter = document.getElementById('year-filter');
  DOM.statusFilter = document.getElementById('status-filter');
  DOM.sortFilter = document.getElementById('sort-filter');
  DOM.viewButtons = document.querySelectorAll('.view-btn');
  DOM.resultsCount = document.getElementById('results-count');
  DOM.emptyState = document.getElementById('empty-state');
  DOM.loadingState = document.getElementById('loading-state');
  DOM.activeFilters = document.getElementById('active-filters');
  DOM.filterTags = document.getElementById('filter-tags');
  DOM.shuffleBtn = document.getElementById('shuffle-btn');
  DOM.seriesCount = document.getElementById('series-count');
  DOM.genreCount = document.getElementById('genre-count');
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
  [DOM.genreFilter, DOM.yearFilter, DOM.statusFilter, DOM.sortFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', (event) => {
        const filterType = filter.id.replace('-filter', '').replace('sort-filter', 'sort');
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
}

function updateStats(seriesCollection) {
  if (DOM.seriesCount) {
    DOM.seriesCount.textContent = seriesCollection.length;
  }

  if (!DOM.genreCount) {
    return;
  }

  const uniqueGenres = new Set();
  seriesCollection.forEach((series) => {
    (series.genre || []).forEach((genre) => {
      if (genre) {
        uniqueGenres.add(genre.trim());
      }
    });
  });

  DOM.genreCount.textContent = uniqueGenres.size;
}

function applyFilters() {
  // Filtrar datos
  STATE.filteredSeries = STATE.seriesData.filter(series => {
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
        if (seriesYear >= 2018) return false;
      } else {
        const filterYear = parseInt(STATE.activeFilters.year);
        if (seriesYear !== filterYear) return false;
      }
    }

    // Filtro de estado
    if (STATE.activeFilters.status) {
      const status = series.status?.toLowerCase() || 'completed';
      if (status !== STATE.activeFilters.status) return false;
    }

    return true;
  });

  // Ordenar resultados
  sortSeries();
  
  // Actualizar UI
  updateActiveFilters();
  updateResultsCount();
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
  if (!DOM.seriesGrid) return;

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
  DOM.seriesGrid.className = STATE.viewMode === 'list' ? 'series-list' : 'series-grid';

  // Renderizar items
  DOM.seriesGrid.innerHTML = paginatedSeries.map(series => 
    createSeriesCard(series)
  ).join('');
}

function createSeriesCard(series) {
  const isUnavailable = !series.episodes || series.episodes.length === 0;
  
  return `
    <article class="series-card ${STATE.viewMode === 'list' ? 'series-card--list' : ''}">
      <a href="series.html?id=${series.id}" class="series-card__link ${isUnavailable ? 'unavailable' : ''}">
        <div class="series-card__image">
          <img src="${series.cover}" alt="${series.title}" loading="lazy" />
          ${series.quality ? `<span class="quality-badge">${series.quality}</span>` : ''}
        </div>
        <div class="series-card__content">
          <h3 class="series-card__title">${series.title}</h3>
          <div class="series-card__meta">
            <span class="year">${series.year}</span>
            ${series.genre ? `<span class="genres">${series.genre.slice(0, 2).join(', ')}</span>` : ''}
          </div>
          <p class="series-card__description">${(series.description || '').substring(0, 120)}${series.description?.length > 120 ? '...' : ''}</p>
          ${series.episodes ? `<span class="episodes-count">${series.episodes.length} episodios</span>` : ''}
        </div>
      </a>
      <button class="add-to-list" onclick="toggleMyList('${series.id}')" aria-label="Agregar a mi lista">
        <i class="fas fa-plus"></i>
        Mi Lista
      </button>
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
      return value === 'older' ? 'Año: Anteriores a 2018' : `Año: ${value}`;
    case 'status':
      const statusLabels = {
        ongoing: 'En emisión',
        completed: 'Completadas',
        cancelled: 'Canceladas'
      };
      return `Estado: ${statusLabels[value] || value}`;
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
  
  // Limpiar inputs
  [DOM.seriesSearch, DOM.genreFilter, DOM.yearFilter, DOM.statusFilter].forEach(element => {
    if (element) element.value = '';
  });
  
  STATE.currentPage = 1;
  applyFilters();
}

function updateResultsCount() {
  if (DOM.resultsCount) {
    const count = STATE.filteredSeries.length;
    DOM.resultsCount.textContent = count === 1 
      ? '1 serie encontrada' 
      : `${count} series encontradas`;
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
  if (DOM.loadingState) {
    DOM.loadingState.hidden = false;
  }
  if (DOM.emptyState) {
    DOM.emptyState.hidden = true;
  }
}

function hideLoadingState() {
  if (DOM.loadingState) {
    DOM.loadingState.hidden = true;
  }
}

function showEmptyState() {
  if (DOM.emptyState) {
    DOM.emptyState.hidden = false;
  }
  if (DOM.seriesGrid) {
    DOM.seriesGrid.innerHTML = '';
  }
}

function hideEmptyState() {
  if (DOM.emptyState) {
    DOM.emptyState.hidden = true;
  }
}

function showErrorState() {
  if (DOM.seriesGrid) {
    DOM.seriesGrid.innerHTML = `
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

// Función para el backdrop del showcase
function startShowcaseBackdropCycle(seriesCollection) {
  const showcaseElement = document.getElementById('series-showcase');
  const backdropElement = document.querySelector('.series-showcase__backdrop');
  
  if (!showcaseElement || !backdropElement) {
    return;
  }

  const seriesWithBackdrops = seriesCollection
    .filter(series => series.backdrop)
    .slice(0, BACKDROP_CONFIG.maxSlides);

  if (seriesWithBackdrops.length === 0) {
    return;
  }

  let currentSlideIndex = 0;

  // Crear slides
  seriesWithBackdrops.forEach((series, index) => {
    const slide = document.createElement('div');
    slide.className = `series-showcase__slide ${index === 0 ? 'is-active' : ''}`;
    slide.style.backgroundImage = `url(${series.backdrop})`;
    backdropElement.appendChild(slide);
  });

  // Cycle through slides
  if (seriesWithBackdrops.length > 1) {
    showcaseIntervalId = setInterval(() => {
      const slides = backdropElement.querySelectorAll('.series-showcase__slide');
      if (slides.length === 0) return;

      slides[currentSlideIndex].classList.remove('is-active');
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      slides[currentSlideIndex].classList.add('is-active');
    }, BACKDROP_CONFIG.interval);
  }
}



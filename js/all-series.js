const STATE = {
  seriesData: [],
  filteredSeries: [],
  activeGenres: new Set(),
  viewMode: 'grid',
  searchTerm: '',
  sortOption: 'featured',
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
    STATE.seriesData = await fetchSeriesData();
    updateStats(STATE.seriesData);
    buildGenreFilters(STATE.seriesData);
    buildSpotlight(STATE.seriesData);
    try {
      startShowcaseBackdropCycle(STATE.seriesData);
    } catch (cycleError) {
      console.error('Error iniciando el ciclo de backdrops del hero:', cycleError);
    }
    attachEventListeners();
    applyFilters();
  } catch (error) {
    console.error('Error al cargar los datos de las series:', error);
    showErrorState();
  }
});

function cacheDomReferences() {
  DOM.seriesGrid = document.getElementById('series-grid');
  DOM.seriesSearch = document.getElementById('series-search');
  DOM.seriesSort = document.getElementById('series-sort');
  DOM.viewToggleButtons = document.querySelectorAll('.toggle-button');
  DOM.genreChips = document.getElementById('genre-chips');
  DOM.clearGenreButton = document.getElementById('clear-genre-filter');
  DOM.resultsCount = document.getElementById('results-count');
  DOM.emptyState = document.getElementById('empty-state');
  DOM.seriesCount = document.getElementById('series-count');
  DOM.genreCount = document.getElementById('genre-count');
  DOM.spotlightTrack = document.getElementById('spotlight-track');
  DOM.showcase = document.getElementById('series-showcase');
  DOM.showcaseBackdrop = document.querySelector('.series-showcase__backdrop');
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

function attachEventListeners() {
  if (DOM.seriesSearch) {
    DOM.seriesSearch.addEventListener('input', (event) => {
      STATE.searchTerm = event.target.value.trim();
      applyFilters();
    });
  }

  if (DOM.seriesSort) {
    DOM.seriesSort.addEventListener('change', (event) => {
      STATE.sortOption = event.target.value;
      applyFilters();
    });
  }

  if (DOM.viewToggleButtons && DOM.viewToggleButtons.length > 0) {
    DOM.viewToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const desiredView = button.dataset.view;
        if (!desiredView || desiredView === STATE.viewMode) {
          return;
        }

        STATE.viewMode = desiredView;
        DOM.viewToggleButtons.forEach((btn) => {
          const isActive = btn.dataset.view === STATE.viewMode;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });

        applyFilters();
      });
    });
  }

  if (DOM.clearGenreButton) {
    DOM.clearGenreButton.addEventListener('click', () => {
      STATE.activeGenres.clear();
      if (DOM.genreChips) {
        DOM.genreChips.querySelectorAll('.genre-chip').forEach((chip) => {
          chip.classList.remove('is-active');
          chip.setAttribute('aria-pressed', 'false');
        });
      }
      updateClearGenreButton();
      applyFilters();
    });
  }
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

function buildGenreFilters(seriesCollection) {
  if (!DOM.genreChips) {
    return;
  }

  const genres = Array.from(
    new Set(
      seriesCollection
        .flatMap((series) => series.genre || [])
        .map((genre) => genre && genre.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  DOM.genreChips.innerHTML = '';

  genres.forEach((genre) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'genre-chip';
    chip.textContent = genre;
    chip.dataset.genreKey = normalizeText(genre);
    chip.setAttribute('aria-pressed', 'false');

    chip.addEventListener('click', () => {
      const key = chip.dataset.genreKey;
      const isActive = STATE.activeGenres.has(key);

      if (isActive) {
        STATE.activeGenres.delete(key);
      } else {
        STATE.activeGenres.add(key);
      }

      chip.classList.toggle('is-active', !isActive);
      chip.setAttribute('aria-pressed', String(!isActive));
      updateClearGenreButton();
      applyFilters();
    });

    DOM.genreChips.appendChild(chip);
  });
}

function buildSpotlight(seriesCollection) {
  if (!DOM.spotlightTrack) {
    return;
  }

  const sortedSeries = [...seriesCollection].sort(
    (a, b) => extractStartYear(b.year) - extractStartYear(a.year)
  );

  const spotlightItems = sortedSeries.slice(0, 4);
  DOM.spotlightTrack.innerHTML = '';

  spotlightItems.forEach((series) => {
    const card = document.createElement('article');
    card.className = 'spotlight-card';
    card.setAttribute('role', 'listitem');

    const backdropSrc = series.backdrop || series.cover;

    const image = document.createElement('img');
    image.className = 'spotlight-card__image';
    image.src = backdropSrc;
    image.alt = `Backdrop de ${series.title}`;
    image.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'spotlight-card__content';

    const meta = document.createElement('div');
    meta.className = 'spotlight-card__meta';
    const metaSegments = [series.year, formatSeasons(series.seasons), series.quality]
      .filter(Boolean);
    if (metaSegments.length) {
      metaSegments.forEach((segment) => {
        const chip = document.createElement('span');
        chip.textContent = segment;
        meta.appendChild(chip);
      });
    }

    const title = document.createElement('h3');
    title.className = 'spotlight-card__title';
    title.textContent = series.title;

    const genresWrapper = document.createElement('div');
    genresWrapper.className = 'spotlight-card__genres';
    (series.genre || []).slice(0, 3).forEach((genre) => {
      const pill = document.createElement('span');
      pill.textContent = genre;
      genresWrapper.appendChild(pill);
    });

    const link = document.createElement('a');
    link.href = `series.html?id=${series.id}`;
    link.className = 'btn btn-secondary spotlight-card__cta';
    link.innerHTML = '<span>Ver ficha</span><i class="fas fa-arrow-right"></i>';

    content.append(meta, title, genresWrapper, link);
    card.append(image, content);
    DOM.spotlightTrack.appendChild(card);
  });

}

function startShowcaseBackdropCycle(seriesCollection) {
  if (!DOM.showcaseBackdrop) {
    return;
  }

  const backdropPool = seriesCollection
    .map((series) => series.backdrop || series.cover)
    .filter(Boolean);

  if (!backdropPool.length) {
    return;
  }

  const uniqueSources = Array.from(new Set(backdropPool));
  uniqueSources.sort(() => Math.random() - 0.5);
  const slidesToUse = uniqueSources.slice(0, BACKDROP_CONFIG.maxSlides);

  DOM.showcaseBackdrop.innerHTML = '';

  slidesToUse.forEach((src, index) => {
    const slide = document.createElement('div');
    slide.className = 'series-showcase__slide';
    slide.style.backgroundImage = `url(${src})`;
    if (index === 0) {
      slide.classList.add('is-active');
    }
    DOM.showcaseBackdrop.appendChild(slide);
  });

  const slides = Array.from(DOM.showcaseBackdrop.children);
  if (slides.length <= 1) {
    return;
  }

  if (showcaseIntervalId) {
    clearInterval(showcaseIntervalId);
  }

  let currentIndex = 0;

  showcaseIntervalId = setInterval(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.remove('is-active');
    slides[nextIndex].classList.add('is-active');
    currentIndex = nextIndex;
  }, BACKDROP_CONFIG.interval);
}

function applyFilters() {
  const cleanedTerm = normalizeText(STATE.searchTerm);

  STATE.filteredSeries = STATE.seriesData.filter((series) => {
    const matchesSearch = cleanedTerm
      ? buildSearchCorpus(series).includes(cleanedTerm)
      : true;

    const matchesGenre = STATE.activeGenres.size
      ? (series.genre || []).some((genre) =>
          STATE.activeGenres.has(normalizeText(genre))
        )
      : true;

    return matchesSearch && matchesGenre;
  });

  const sortedSeries = sortSeries(STATE.filteredSeries, STATE.sortOption);
  renderSeries(sortedSeries);
  updateResultsCount(sortedSeries.length);
  toggleEmptyState(sortedSeries.length === 0);
}

function renderSeries(collection) {
  if (!DOM.seriesGrid) {
    return;
  }

  DOM.seriesGrid.innerHTML = '';
  DOM.seriesGrid.classList.toggle('list-view', STATE.viewMode === 'list');

  collection.forEach((series) => {
    DOM.seriesGrid.appendChild(createSeriesCard(series));
  });
}

function createSeriesCard(series) {
  const article = document.createElement('article');
  article.className = 'series-card';

  const link = document.createElement('a');
  link.href = `series.html?id=${series.id}`;
  link.className = 'series-card__link';

  const poster = document.createElement('div');
  poster.className = 'series-card__poster';

  const img = document.createElement('img');
  img.src = series.cover;
  img.alt = series.title;
  img.loading = 'lazy';
  poster.appendChild(img);

  const badge = document.createElement('span');
  badge.className = 'series-card__badge';
  badge.textContent = series.quality || series.year || 'HD';
  poster.appendChild(badge);

  const body = document.createElement('div');
  body.className = 'series-card__body';

  const title = document.createElement('h3');
  title.className = 'series-card__title';
  title.textContent = series.title;

  const meta = document.createElement('div');
  meta.className = 'series-card__meta';
  const metaItems = [series.year, formatSeasons(series.seasons), series.language]
    .filter(Boolean);

  metaItems.forEach((item) => {
    const metaSpan = document.createElement('span');
    metaSpan.textContent = item;
    meta.appendChild(metaSpan);
  });

  const description = document.createElement('p');
  description.className = 'series-card__description';
  description.textContent = series.description || 'Sinopsis no disponible por el momento.';

  const genresWrapper = document.createElement('div');
  genresWrapper.className = 'series-card__genres';
  (series.genre || []).slice(0, 4).forEach((genre) => {
    const pill = document.createElement('span');
    pill.textContent = genre;
    genresWrapper.appendChild(pill);
  });

  const cta = document.createElement('span');
  cta.className = 'series-card__cta';
  cta.textContent = 'Ver detalles';

  const icon = document.createElement('i');
  icon.className = 'fas fa-arrow-right';
  cta.appendChild(icon);

  body.append(title, meta, description, genresWrapper, cta);
  link.append(poster, body);
  article.appendChild(link);

  return article;
}

function sortSeries(collection, sortOption) {
  const list = [...collection];

  switch (sortOption) {
    case 'az':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
    case 'recent':
      return list.sort((a, b) => extractStartYear(b.year) - extractStartYear(a.year));
    case 'oldest':
      return list.sort((a, b) => extractStartYear(a.year) - extractStartYear(b.year));
    default:
      return list;
  }
}

function updateResultsCount(count) {
  if (!DOM.resultsCount) {
    return;
  }

  DOM.resultsCount.textContent = `${count} ${count === 1 ? 'resultado' : 'resultados'}`;
}

function toggleEmptyState(showEmpty) {
  if (!DOM.emptyState) {
    return;
  }

  DOM.emptyState.hidden = !showEmpty;
  DOM.seriesGrid?.classList.toggle('is-empty', showEmpty);
}

function showErrorState() {
  if (DOM.emptyState) {
    DOM.emptyState.hidden = false;
    DOM.emptyState.textContent = 'No se pudieron cargar las series. Inténtalo de nuevo más tarde.';
  }

  if (DOM.seriesGrid) {
    DOM.seriesGrid.innerHTML = '';
  }

  if (DOM.resultsCount) {
    DOM.resultsCount.textContent = '0 resultados';
  }
}

function updateClearGenreButton() {
  if (!DOM.clearGenreButton) {
    return;
  }
  DOM.clearGenreButton.hidden = STATE.activeGenres.size === 0;
}

function buildSearchCorpus(series) {
  const segments = [
    series.title,
    series.originalTitle,
    series.description,
    series.director,
    ...(series.cast || []),
    ...(series.genre || []),
  ];

  return normalizeText(segments.filter(Boolean).join(' '));
}

function normalizeText(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatSeasons(seasons) {
  if (!Array.isArray(seasons) || seasons.length === 0) {
    return null;
  }
  const total = seasons.length;
  return total === 1 ? '1 temporada' : `${total} temporadas`;
}

function extractStartYear(yearField) {
  if (!yearField) {
    return 0;
  }
  const match = yearField.toString().match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
}

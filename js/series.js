document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');

    if (!seriesId) {
        document.getElementById('series-main').innerHTML = '<p class="no-results">Serie no encontrada. Por favor, especifica un ID de serie en la URL.</p>';
        return;
    }

    let seriesData = [];
    try {
        const response = await fetch('/data/series.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        seriesData = await response.json();
    } catch (error) {
        console.error('Error al cargar los datos de las series:', error);
        document.getElementById('series-main').innerHTML = '<p class="no-results">Error al cargar los datos de las series.</p>';
        return;
    }

    const series = seriesData.find(s => s.id === seriesId);
    currentSeries = series; // Guardar la serie actual globalmente

    if (!series) {
        document.getElementById('series-main').innerHTML = `<p class="no-results">La serie con ID "${seriesId}" no fue encontrada.</p>`;
        return;
    }

    renderSeriesDetails(series);
    renderSeasonTabs(series);
    // Cargar el primer episodio de la primera temporada por defecto
    if (series.seasons && series.seasons.length > 0 && series.seasons[0].episodes.length > 0) {
        const firstSeason = series.seasons[0];
        const firstEpisode = firstSeason.episodes[0];
        loadEpisode(firstEpisode.embed, firstSeason.seasonNumber, firstEpisode.episodeNumber, firstEpisode.title);
        renderEpisodes(firstSeason); // Renderizar los episodios de la primera temporada
    } else {
        // Si no hay episodios, ocultar la sección del reproductor
        document.getElementById('episode-player-section').style.display = 'none';
    }

    // Event listeners para los botones de navegación
    document.getElementById('prev-episode-btn').addEventListener('click', () => navigateEpisodes('prev'));
    document.getElementById('next-episode-btn').addEventListener('click', () => navigateEpisodes('next'));

    // Renderizar series relacionadas
    renderRelatedSeries(series, seriesData);
});

function renderRelatedSeries(currentSeries, allSeries) {
    const relatedContainer = document.getElementById('related-series-grid');
    const relatedSection = document.getElementById('related-series-section');
    if (!relatedContainer || !relatedSection) return;

    const currentGenres = currentSeries.genre;
    const related = allSeries.filter(s => {
        // No incluir la serie actual
        if (s.id === currentSeries.id) return false;
        // Comprobar si comparte al menos un género
        return s.genre.some(g => currentGenres.includes(g));
    });

    // Limitar a un número máximo de series relacionadas (ej. 6)
    const seriesToShow = related.slice(0, 6);

    if (seriesToShow.length === 0) {
        relatedSection.style.display = 'none';
        return;
    }

    relatedContainer.innerHTML = ''; // Limpiar el contenedor

    seriesToShow.forEach(s => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <a href="series.html?id=${s.id}">
                <img src="${s.cover}" alt="${s.title}">
                <div class="movie-info">
                    <h3>${s.title}</h3>
                    <p>${s.year}</p>
                </div>
            </a>
        `;
        relatedContainer.appendChild(movieCard);
    });
}

function renderSeriesDetails(series) {
    document.title = `${series.title} - Ver Online en MoviesHN`;

    // Actualizar meta tags para SEO
    document.querySelector('meta[name="description"]').content = `${series.title} - Disfruta esta serie completa en español latino. Calidad HD disponible en MoviesHN.`;
    document.querySelector('meta[name="keywords"]').content = `${series.title}, series gratis, ver series online, cine en español, MoviesHN, ${series.genre.join(', ')}`;
    document.querySelector('meta[property="og:title"]').content = series.title;
    document.querySelector('meta[property="og:description"]').content = `Mira online ${series.title} en español latino, calidad HD y sin complicaciones.`;
    document.querySelector('meta[property="og:image"]').content = series.cover; // Usar la portada de la serie
    document.querySelector('meta[property="og:url"]').content = window.location.href;
    document.querySelector('meta[name="twitter:title"]').content = series.title;
    document.querySelector('meta[name="twitter:description"]').content = `Disfruta esta serie completa en español latino en MoviesHN.`;
    document.querySelector('meta[name="twitter:image"]').content = series.cover; // Usar la portada de la serie

    const heroContainer = document.querySelector('.series-hero-container');
    const hero = heroContainer.querySelector('.series-hero');

    // Establecer el backdrop como fondo del heroContainer
    if (series.backdrop) {
        heroContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${series.backdrop})`;
        heroContainer.style.backgroundSize = 'cover';
        heroContainer.style.backgroundPosition = 'center';
    }

    hero.innerHTML = `
        <div class="poster-container">
            <img src="${series.cover}" alt="${series.title}" class="poster-img">
        </div>
        <div class="hero-info">
            <h1 class="hero-title">${series.title}</h1>
            <div class="hero-meta">
                <span>${series.year}</span>
                <span>${series.genre.join(', ')}</span>
                <span>${series.quality || 'HD'}</span>
                <span>${series.ageRating || 'N/A'}</span>
            </div>
            <div class="hero-synopsis">
                <h3>Sinopsis</h3>
                <p>${series.description}</p>
            </div>
            <div class="hero-actions">
                ${series.trailer ? `<a href="${series.trailer}" target="_blank" class="btn btn-primary">Ver Tráiler</a>` : ''}
                <button class="btn btn-secondary add-to-mylist-btn" data-series-id="${series.id}">Añadir a Mi Lista</button>
            </div>
        </div>
    `;

    // Event listener para el botón de "Añadir a Mi Lista"
    const addToListBtn = hero.querySelector('.add-to-mylist-btn');
    if (addToListBtn) {
        addToListBtn.addEventListener('click', () => {
            alert(`Funcionalidad "Añadir a Mi Lista" para ${series.title} aún no implementada.`);
            // Aquí iría la lógica para añadir a la lista del usuario
        });
    }
}

function renderSeasonTabs(series) {
    const seasonSelectorContainer = document.querySelector('.season-selector-container');
    seasonSelectorContainer.innerHTML = ''; // Limpiar contenido existente

    if (!series.seasons || series.seasons.length <= 1) { // No mostrar si hay 0 o 1 temporada
        seasonSelectorContainer.style.display = 'none';
        return;
    }
    seasonSelectorContainer.style.display = 'flex';

    const label = document.createElement('label');
    label.setAttribute('for', 'season-select');
    label.textContent = 'Temporada:';

    const select = document.createElement('select');
    select.id = 'season-select';
    select.classList.add('season-select');

    series.seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.seasonNumber;
        option.textContent = `Temporada ${season.seasonNumber}`;
        select.appendChild(option);
    });

    select.addEventListener('change', () => {
        const selectedSeasonNumber = parseInt(select.value);
        const selectedSeason = series.seasons.find(s => s.seasonNumber === selectedSeasonNumber);
        if (selectedSeason) {
            renderEpisodes(selectedSeason);
            // Opcional: cargar el primer episodio de la temporada seleccionada si no se está reproduciendo nada
            if (selectedSeason.episodes && selectedSeason.episodes.length > 0) {
                const firstEpisode = selectedSeason.episodes[0];
                loadEpisode(firstEpisode.embed, selectedSeason.seasonNumber, firstEpisode.episodeNumber, firstEpisode.title);
            }
        }
    });

    seasonSelectorContainer.appendChild(label);
    seasonSelectorContainer.appendChild(select);
}

function renderEpisodes(season) {
    const episodesContainer = document.getElementById('season-episodes-container');
    episodesContainer.innerHTML = ''; // Limpiar episodios existentes

    if (!season.episodes || season.episodes.length === 0) {
        episodesContainer.innerHTML = '<p class="no-results">No hay episodios disponibles para esta temporada.</p>';
        return;
    }

    season.episodes.forEach(episode => {
        const episodeItem = document.createElement('div');
        episodeItem.classList.add('episode-item'); // Contenedor para el querySelector
        episodeItem.dataset.seasonNumber = season.seasonNumber;
        episodeItem.dataset.episodeNumber = episode.episodeNumber;

        const cleanedTitle = cleanEpisodeTitle(episode.title);

        // La tarjeta visual que el usuario ve y con la que interactúa
        const cardHTML = `
            <div class="episode-card" tabindex="0">
                <img src="${episode.thumbnail || season.cover || 'assets/covers/placeholder.webp'}" alt="${cleanedTitle}">
                <div class="play-icon-overlay"></div>
            </div>
            <div class="episode-title-below">
                <h3>T${season.seasonNumber} E${episode.episodeNumber}</h3>
                <p>${cleanedTitle}</p>
            </div>
        `;
        
        episodeItem.innerHTML = cardHTML;

        // Añadir evento de clic al contenedor
        episodeItem.addEventListener('click', (event) => {
            event.preventDefault();
            if (episode.embed) {
                loadEpisode(episode.embed, season.seasonNumber, episode.episodeNumber, episode.title);
            }
        });

        episodesContainer.appendChild(episodeItem);
    });

    // No se necesita el bloque de event listeners delegados porque se asignan en el bucle.
}

function cleanEpisodeTitle(title) {
    if (!title) return 'Título no disponible';

    // Eliminar prefijos como "eps1.0_" o "eps2.1 " etc.
    let cleanedTitle = title.replace(/^eps\d+\.\d+[\s_]/i, '');

    // Eliminar extensiones de archivo comunes y reemplazar separadores restantes
    cleanedTitle = cleanedTitle
        .replace(/\.(mp4|mkv|avi|mpeg|wmv|asf|flv|m4v|tc|ksd|asec|hc|aes|sme|p12|fve|axx|p7z|h|gz|so|par2|r00|inc|chk|ko|torrent)$/i, '')
        .replace(/[._]/g, ' ');

    // Capitalizar la primera letra y limpiar espacios
    return cleanedTitle.trim().charAt(0).toUpperCase() + cleanedTitle.trim().slice(1);
}

let currentSeries = null;
let currentSeasonIndex = 0;
let currentEpisodeIndex = 0;

function loadEpisode(embedUrl, seasonNumber, episodeNumber, episodeTitle) {
    const playerFrame = document.getElementById('main-episode-player');
    const currentSeasonEpisodeSpan = document.getElementById('current-season-episode');
    const currentEpisodeTitleSpan = document.getElementById('current-episode-title');
    const episodePlayerSection = document.getElementById('episode-player-section');

    const cleanedTitle = cleanEpisodeTitle(episodeTitle); // Limpiar el título

    if (playerFrame) {
        playerFrame.src = embedUrl;
        episodePlayerSection.style.display = 'block'; // Asegurarse de que la sección del reproductor sea visible
    }
    if (currentSeasonEpisodeSpan) {
        currentSeasonEpisodeSpan.textContent = `T${seasonNumber} E${episodeNumber}`;
    }
    if (currentEpisodeTitleSpan) {
        currentEpisodeTitleSpan.textContent = cleanedTitle; // Usar el título limpio
    }

    // Actualizar índices globales
    currentSeasonIndex = currentSeries.seasons.findIndex(s => s.seasonNumber === seasonNumber);
    currentEpisodeIndex = currentSeries.seasons[currentSeasonIndex].episodes.findIndex(e => e.episodeNumber === episodeNumber);

    // Resaltar el episodio actual en la lista
    document.querySelectorAll('.episode-card').forEach(card => card.classList.remove('active-episode'));
    const activeEpisodeElement = document.querySelector(`.episode-item[data-season-number="${seasonNumber}"][data-episode-number="${episodeNumber}"]`);
    if (activeEpisodeElement) {
        const activeCard = activeEpisodeElement.querySelector('.episode-card');
        if (activeCard) {
            activeCard.classList.add('active-episode');
        }
        // Hacer scroll a la vista del episodio activo
        activeEpisodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Actualizar estado de los botones de navegación
    updateNavigationButtons();
}

// Función para navegar entre episodios
function navigateEpisodes(direction) {
    if (!currentSeries || !currentSeries.seasons || currentSeries.seasons.length === 0) return;

    let newEpisodeIndex = currentEpisodeIndex;
    let newSeasonIndex = currentSeasonIndex;

    if (direction === 'next') {
        newEpisodeIndex++;
        if (newEpisodeIndex >= currentSeries.seasons[newSeasonIndex].episodes.length) {
            newSeasonIndex++;
            newEpisodeIndex = 0;
        }
    } else if (direction === 'prev') {
        newEpisodeIndex--;
        if (newEpisodeIndex < 0) {
            newSeasonIndex--;
            if (newSeasonIndex < 0) {
                // Ya estamos en el primer episodio de la primera temporada
                newSeasonIndex = 0;
                newEpisodeIndex = 0;
                return;
            }
            newEpisodeIndex = currentSeries.seasons[newSeasonIndex].episodes.length - 1;
        }
    }

    if (newSeasonIndex >= 0 && newSeasonIndex < currentSeries.seasons.length &&
        newEpisodeIndex >= 0 && newEpisodeIndex < currentSeries.seasons[newSeasonIndex].episodes.length) {
        
        currentSeasonIndex = newSeasonIndex;
        currentEpisodeIndex = newEpisodeIndex;

        const season = currentSeries.seasons[currentSeasonIndex];
        const episode = season.episodes[currentEpisodeIndex];

        loadEpisode(episode.embed, season.seasonNumber, episode.episodeNumber, episode.title);
        
        // Actualizar la pestaña de temporada activa
        document.querySelectorAll('.season-tab').forEach(btn => btn.classList.remove('active'));
        const activeSeasonTab = document.querySelector(`.season-tab[data-season-number="${season.seasonNumber}"]`);
        if (activeSeasonTab) {
            activeSeasonTab.classList.add('active');
        }
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-episode-btn');
    const nextBtn = document.getElementById('next-episode-btn');

    if (!currentSeries || !currentSeries.seasons || currentSeries.seasons.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const totalSeasons = currentSeries.seasons.length;
    const currentSeason = currentSeries.seasons[currentSeasonIndex];
    const totalEpisodesInSeason = currentSeason.episodes.length;

    // Botón Anterior
    if (currentSeasonIndex === 0 && currentEpisodeIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    // Botón Siguiente
    if (currentSeasonIndex === totalSeasons - 1 && currentEpisodeIndex === totalEpisodesInSeason - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}
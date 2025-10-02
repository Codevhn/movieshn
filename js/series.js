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

    if (!series) {
        document.getElementById('series-main').innerHTML = `<p class="no-results">La serie con ID "${seriesId}" no fue encontrada.</p>`;
        return;
    }

    renderSeriesDetails(series);
    renderSeasonTabs(series);
    // Cargar la primera temporada por defecto
    if (series.seasons && series.seasons.length > 0) {
        renderEpisodes(series.seasons[0]);
    }
});

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
    const seasonTabsContainer = document.querySelector('.season-tabs');
    seasonTabsContainer.innerHTML = ''; // Limpiar pestañas existentes

    if (!series.seasons || series.seasons.length === 0) {
        seasonTabsContainer.innerHTML = '<p>No hay temporadas disponibles.</p>';
        return;
    }

    series.seasons.forEach((season, index) => {
        const button = document.createElement('button');
        button.classList.add('season-tab');
        if (index === 0) {
            button.classList.add('active'); // Activar la primera temporada por defecto
        }
        button.dataset.seasonNumber = season.seasonNumber;
        button.textContent = `Temporada ${season.seasonNumber}`;
        button.addEventListener('click', () => {
            // Remover 'active' de todas las pestañas
            document.querySelectorAll('.season-tab').forEach(btn => btn.classList.remove('active'));
            // Añadir 'active' a la pestaña clickeada
            button.classList.add('active');
            renderEpisodes(season);
        });
        seasonTabsContainer.appendChild(button);
    });
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
        episodeItem.classList.add('episode-item', 'featured-item'); // Reutilizar estilos existentes
        episodeItem.innerHTML = `
            <img src="${season.cover || 'assets/covers/placeholder.webp'}" alt="Episodio ${episode.episodeNumber}">
            <div class="episode-info">
                <h3>T${season.seasonNumber} E${episode.episodeNumber} - ${episode.title}</h3>
                <p>${episode.description}</p>
                ${episode.embed ? `<a href="#" class="btn btn-primary watch-episode-btn" data-embed-url="${episode.embed}">Ver Episodio</a>` : ''}
                ${episode.downloadLinks && episode.downloadLinks.length > 0 ? `
                    <div class="download-links-container">
                        ${episode.downloadLinks.map(link => `<a href="${link.url}" target="_blank" class="btn btn-secondary download-link">${link.name}</a>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        episodesContainer.appendChild(episodeItem);
    });

    // Añadir event listeners para los botones "Ver Episodio"
    episodesContainer.querySelectorAll('.watch-episode-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const embedUrl = event.target.dataset.embedUrl;
            if (embedUrl) {
                // Aquí puedes implementar un modal o redirigir a una página de reproducción
                alert(`Reproduciendo episodio desde: ${embedUrl}`);
                // Ejemplo de cómo podrías abrir un modal con el iframe:
                // openVideoModal(embedUrl);
            }
        });
    });
}

// Placeholder para la función openVideoModal si decides usar un modal
function openVideoModal(embedUrl) {
    // Implementar la lógica para abrir un modal y cargar el iframe
    console.log('Abriendo modal para:', embedUrl);
}
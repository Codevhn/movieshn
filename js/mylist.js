document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.getElementById('my-list-grid');
    const seriesGrid = document.getElementById('my-series-grid');
    const emptyMessageContainer = document.getElementById('empty-list-message');
    const moviesSection = document.getElementById('my-list-section');
    const seriesSection = document.getElementById('my-series-section');

    if (!movieGrid || !seriesGrid || !emptyMessageContainer || !moviesSection || !seriesSection) {
        console.error('Error: No se encontraron todos los elementos necesarios en el DOM.');
        return;
    }

    const fetchData = async () => {
        try {
            const [moviesRes, seriesRes] = await Promise.all([
                fetch('./data/movies.json'),
                fetch('./data/series.json')
            ]);
            const movies = await moviesRes.json();
            const series = await seriesRes.json();
            return { movies, series };
        } catch (error) {
            console.error("Error cargando datos:", error);
            emptyMessageContainer.innerHTML = '<p class="empty-list-text">Error al cargar los datos. Inténtalo de nuevo más tarde.</p>';
            emptyMessageContainer.style.display = 'flex';
            return null;
        }
    };

    const createCard = (item, type) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const link = type === 'movie' ? `movie.html?id=${item.id}` : `series.html?id=${item.id}`;
        const storageKey = type === 'movie' ? 'myList' : 'mySeriesList';

        card.innerHTML = `
            <a href="${link}" class="movie">
                <img src="${item.cover}" alt="${item.title}" loading="lazy">
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <p>${item.year}</p>
                </div>      
            </a>
            <button class="remove-from-list" data-id="${item.id}" data-type="${type}" aria-label="Quitar de mi lista">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        return card;
    };

    const renderList = (grid, section, allItems, storedIds, type) => {
        if (storedIds.length === 0) {
            section.style.display = 'none';
            return;
        }

        const listItems = storedIds
            .map(id => allItems.find(item => item.id === id))
            .filter(item => item !== undefined);

        if (listItems.length === 0) {
            section.style.display = 'none';
            return;
        }

        grid.innerHTML = '';
        listItems.forEach(item => {
            const card = createCard(item, type);
            grid.appendChild(card);
        });
        section.style.display = 'block';
    };

    const checkEmptyState = () => {
        const movieIds = JSON.parse(localStorage.getItem('myList')) || [];
        const seriesIds = JSON.parse(localStorage.getItem('mySeriesList')) || [];

        if (movieIds.length === 0 && seriesIds.length === 0) {
            moviesSection.style.display = 'none';
            seriesSection.style.display = 'none';
            emptyMessageContainer.style.display = 'flex';
        } else {
            emptyMessageContainer.style.display = 'none';
        }
    };

    const initRemoveButtons = (allData) => {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.remove-from-list');
            if (!button) return;

            const id = button.dataset.id;
            const type = button.dataset.type;
            const storageKey = type === 'movie' ? 'myList' : 'mySeriesList';

            let storedIds = JSON.parse(localStorage.getItem(storageKey)) || [];
            storedIds = storedIds.filter(storedId => storedId !== id);
            localStorage.setItem(storageKey, JSON.stringify(storedIds));

            // Re-render the specific list that was changed
            if (type === 'movie') {
                renderList(movieGrid, moviesSection, allData.movies, storedIds, 'movie');
            } else {
                renderList(seriesGrid, seriesSection, allData.series, storedIds, 'series');
            }

            checkEmptyState();
        });
    };

    fetchData().then(allData => {
        if (!allData) return;

        const movieIds = JSON.parse(localStorage.getItem('myList')) || [];
        const seriesIds = JSON.parse(localStorage.getItem('mySeriesList')) || [];

        renderList(movieGrid, moviesSection, allData.movies, movieIds, 'movie');
        renderList(seriesGrid, seriesSection, allData.series, seriesIds, 'series');

        checkEmptyState();
        initRemoveButtons(allData);
    });
});

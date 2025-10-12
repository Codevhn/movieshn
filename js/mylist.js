document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('my-list-grid');
    const emptyMessageContainer = document.getElementById('empty-list-message');
    const myListSection = document.getElementById('my-list-section');

    if (!grid || !emptyMessageContainer || !myListSection) return;

    const showEmptyMessage = () => {
        myListSection.style.display = 'none';
        emptyMessageContainer.style.display = 'flex';
    };

    const showMyList = () => {
        myListSection.style.display = 'block';
        emptyMessageContainer.style.display = 'none';
    };

    const createCard = (movie) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const hasEmbed = movie.embed && movie.embed.trim() !== '';
        const stored = JSON.parse(localStorage.getItem('myList')) || [];
        const alreadyInList = stored.includes(movie.id);

        card.innerHTML = `
            <a ${hasEmbed ? `href="movie.html?id=${movie.id}"` : ''} class="movie ${!hasEmbed ? 'unavailable' : ''}">
                <img src="${movie.cover}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.year}</p>
                </div>      
            </a>
            <button class="add-to-list" data-id="${movie.id}">
                ${alreadyInList ? '✅ En mi lista' : '+ Mi lista'}
            </button>
        `;
        return card;
    };

    const renderMyList = (allMovies) => {
        const storedIds = JSON.parse(localStorage.getItem('myList')) || [];
        
        if (storedIds.length === 0) {
            showEmptyMessage();
            return;
        }

        // Mantener el orden de storedIds (más recientes primero)
        const myListMovies = storedIds
            .map(id => allMovies.find(movie => movie.id === id))
            .filter(movie => movie !== undefined);

        if (myListMovies.length === 0) {
            showEmptyMessage(); // No movies found from stored IDs
            return;
        }

        grid.innerHTML = ''; // Limpiar antes de renderizar
        myListMovies.forEach(movie => {
            const card = createCard(movie);
            grid.appendChild(card);
        });
        showMyList();
    };

    // Lógica para manejar los clics en "Mi lista" en esta página
    let myListButtonsInitialized = false;
    const initMyListButtons = () => {
        if (myListButtonsInitialized) {
            console.log('initMyListButtons ya inicializado, saltando...');
            return;
        }
        myListButtonsInitialized = true;
        
        document.addEventListener('click', (e) => {
            if (!e.target.matches('.add-to-list')) return;

            const btn = e.target;
            const movieId = btn.dataset.id;
            if (!movieId) return;

            let stored = JSON.parse(localStorage.getItem('myList')) || [];
            const alreadyInList = stored.includes(movieId);

            if (alreadyInList) {
                stored = stored.filter((m) => m !== movieId);
                // Opcional: quitar la tarjeta de la vista inmediatamente
                btn.closest('.movie-card').remove();
            } else {
                // Agregar al principio de la lista
                stored.unshift(movieId);
            }
            localStorage.setItem('myList', JSON.stringify(stored));
            
            if (stored.length === 0) {
                showEmptyMessage();
            } else if (grid.children.length === 0) { // If all cards were removed from view
                showEmptyMessage();
            }
        });
    };

    // Cargar todas las películas y luego renderizar la lista
    fetch('./data/movies.json')
        .then(res => res.json())
        .then(allMovies => {
            renderMyList(allMovies);
            initMyListButtons(); // Activar los botones de la lista
        })
        .catch(err => {
            console.error("Error cargando películas:", err);
            grid.innerHTML = '<p class="no-results">Error al cargar los datos de las películas.</p>';
            showEmptyMessage(); // Show empty message on error too
        });
});

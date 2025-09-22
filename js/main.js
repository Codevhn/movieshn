/** document.addEventListener("DOMContentLoaded", () => {
  const catalog = document.getElementById("catalog");

  fetch("data/movies.json")
    .then((res) => res.json())
    .then((movies) => {
      movies.forEach((movie) => {
        const card = document.createElement("a");
        card.href = `movie.html?id=${movie.id}`;
        card.classList.add("movie");

        card.innerHTML = ` 
      <img src="${movie.cover}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      `;

        catalog.appendChild(card);
      });
    })
    .catch((err) => {
      catalog.innerHTML = "<p>Error al cargar el catalogo</p>";
      console.log("Error cargando json", err);
    });
});

movies.forEach((movie) => {
  const isAvailable = movie.embed.trim() !== "";

  const article = document.createElement("article");
  article.classList.add("movie-card");

  if (!isAvailable) {
    article.classList.add("unavailable");
  }

  // Si está disponible, se convierte en enlace clickeable
  if (isAvailable) {
    article.innerHTML = `
    <a href="movie.html?id=${movie.id}">
      <img src="${movie.cover}" alt="${movie.title}" class="movie-cover" />
    <h2>${movie.title}</h2>
    <p>${movie.year}</p>
    </a>
    `;
  } else {
    // Si no, solo se muestra como tarjeta sin clic
    article.innerHTML = `
    <img src="${movie.cover}" alt="${movie.title}" class="movie-cover" />
    <h2>${movie.title}</h2>
    <p>${movie.year}</p>
    `;
  }
  container.appendChild(article);
});
*/

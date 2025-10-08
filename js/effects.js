document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.movie-card, .series-card, .spotlight-card, .movie-section h2, .series-catalog__header, .series-showcase__content > *, .hero-content > *'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// === Menú hamburguesa ===
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const nav = document.querySelector(".site-nav");
  const body = document.body;

  if (!menuToggle || !menuClose || !nav) return;

  // abrir menú
  menuToggle.addEventListener("click", () => {
    nav.classList.add("active");
    body.classList.add("nav-open");
  });

  // cerrar menú con botón X
  menuClose.addEventListener("click", () => {
    nav.classList.remove("active");
    body.classList.remove("nav-open");
  });

  // cerrar menú al hacer clic en un link y desplazamiento suave
  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Solo aplicar desplazamiento suave si es un enlace de anclaje en la misma página
      if (href && href.startsWith("#")) {
        e.preventDefault(); // Prevenir el comportamiento de salto predeterminado

        const targetId = href.substring(1); // Obtener el ID sin el '#'
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = document.querySelector(".site-header").offsetHeight;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset - 20; // Restar el alto del header y un poco más para padding

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }

      nav.classList.remove("active"); // Cerrar el menú después del clic
      body.classList.remove("nav-open");
    });
  });

  // cerrar con Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("active")) {
      nav.classList.remove("active");
      body.classList.remove("nav-open");
    }
  });
});

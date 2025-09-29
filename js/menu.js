// === Menú hamburguesa ===
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const nav = document.querySelector(".site-nav");

  if (!menuToggle || !menuClose || !nav) return;

  // abrir menú
  menuToggle.addEventListener("click", () => {
    nav.classList.add("active");
  });

  // cerrar menú con botón X
  menuClose.addEventListener("click", () => {
    nav.classList.remove("active");
  });

  // cerrar menú al hacer clic en un link
  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
    });
  });
});

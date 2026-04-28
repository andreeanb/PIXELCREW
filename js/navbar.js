/**
 * navbar.js
 * Gestión del menú de navegación móvil
 */

(function () {
  'use strict';

  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  /* Abrir / cerrar menú en móvil */
  toggle.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  /* Cerrar menú al hacer clic en un enlace */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Cerrar menú al hacer clic fuera */
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

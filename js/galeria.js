/**
 * galeria.js
 * Galería dinámica con:
 *  - Filtrado por categoría con animación
 *  - Lightbox con navegación por teclado y ratón
 */

(function () {
  'use strict';

  /* ---- Referencias al DOM ---- */
  const filters   = document.querySelectorAll('.gallery-filter');
  const items     = document.querySelectorAll('.gallery-item');
  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lightboxBackdrop');
  const lbImg     = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');

  /* Índice del ítem activo en el lightbox */
  let currentIndex = 0;
  /* Array de ítems visibles (los que pasan el filtro activo) */
  let visibleItems = Array.from(items);

  /* ============================================
     FILTRADO
     ============================================ */

  /**
   * Aplica el filtro seleccionado mostrando solo los ítems que coincidan con la categoría
   * @param {string} filter - Valor del atributo data-category o 'all'
   */
  function applyFilter(filter) {
    visibleItems = [];

    items.forEach(function (item, index) {
      const cat = item.dataset.category;
      const match = filter === 'all' || cat === filter;

      if (match) {
        item.classList.remove('hidden');
        /* Animación escalonada de reentrada */
        item.style.animationDelay = (visibleItems.length * 0.08) + 's';
        item.style.animation = 'none';
        /* Forzar reflow para reiniciar la animación */
        void item.offsetWidth;
        item.style.animation = '';
        visibleItems.push(item);
      } else {
        item.classList.add('hidden');
      }
    });
  }

  /* Eventos de los botones de filtro */
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ============================================
     LIGHTBOX
     ============================================ */

  /**
   * Abre el lightbox mostrando el ítem indicado
   * @param {number} index - Índice dentro de visibleItems
   */
  function openLightbox(index) {
    if (index < 0 || index >= visibleItems.length) return;

    currentIndex = index;
    const item   = visibleItems[currentIndex];
    const img    = item.querySelector('.gallery-item__img');
    const title  = item.querySelector('.gallery-item__title');

    lbImg.src     = img.src;
    lbImg.alt     = img.alt;
    lbCaption.textContent = title ? title.textContent : '';

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    /* Foco accesible al lightbox */
    lbClose.focus();
  }

  /** Cierra el lightbox */
  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /** Muestra el ítem anterior */
  function showPrev() {
    openLightbox((currentIndex - 1 + visibleItems.length) % visibleItems.length);
  }

  /** Muestra el ítem siguiente */
  function showNext() {
    openLightbox((currentIndex + 1) % visibleItems.length);
  }

  /* Abrir lightbox al hacer clic en un ítem de galería */
  items.forEach(function (item) {
    item.addEventListener('click', function () {
      /* Buscar posición del ítem en los visibles */
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });

    /* Accesibilidad: abrir con teclado */
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
      }
    });
  });

  /* Botones de navegación del lightbox */
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);
  backdrop.addEventListener('click', closeLightbox);

  /* Navegación con teclado dentro del lightbox */
  document.addEventListener('keydown', function (e) {
    if (lightbox.hasAttribute('hidden')) return;

    switch (e.key) {
      case 'Escape':    closeLightbox(); break;
      case 'ArrowLeft': showPrev();      break;
      case 'ArrowRight':showNext();      break;
    }
  });

  /* ============================================
     INICIALIZACIÓN
     ============================================ */
  applyFilter('all');

})();

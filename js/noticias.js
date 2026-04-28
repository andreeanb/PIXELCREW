/**
 * noticias.js
 * Carga noticias desde un archivo JSON externo mediante Ajax (fetch API)
 * y permite filtrarlas por categoría sin recargar la página.
 */

(function () {
  'use strict';

  /* ---- Referencias al DOM ---- */
  const grid    = document.getElementById('newsGrid');
  const loading = document.getElementById('newsLoading');
  const filters = document.querySelectorAll('.news__filter');

  /* Almacenamos todos los artículos para poder filtrar sin nueva petición */
  let allArticles = [];

  /**
   * Formatea una fecha ISO a formato legible en español
   * @param {string} isoDate - Fecha en formato YYYY-MM-DD
   * @returns {string}
   */
  function formatDate(isoDate) {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Genera el HTML de una tarjeta de noticia
   * @param {Object} article - Objeto de noticia del JSON
   * @param {number} index - Índice para animación escalonada
   * @returns {string} HTML de la tarjeta
   */
  function createCardHTML(article, index) {
    return `
      <article class="news-card" role="listitem" style="animation-delay: ${index * 0.1}s">
        <div class="news-card__img-wrap">
          <img
            class="news-card__img"
            src="${article.imagen}"
            alt="Imagen del artículo: ${article.titulo}"
            loading="lazy"
            onerror="this.src='https://placehold.co/600x200/111/e8ff00?text=PIXELCRAFT'"
          >
        </div>
        <div class="news-card__body">
          <div class="news-card__meta">
            <span class="news-card__cat">${article.categoria}</span>
            <time class="news-card__date" datetime="${article.fecha}">${formatDate(article.fecha)}</time>
          </div>
          <h3 class="news-card__title">${article.titulo}</h3>
          <p class="news-card__desc">${article.resumen}</p>
          <p class="news-card__author">Por ${article.autor}</p>
        </div>
      </article>
    `;
  }

  /**
   * Renderiza en el grid los artículos recibidos
   * @param {Array} articles
   */
  function renderArticles(articles) {
    if (articles.length === 0) {
      grid.innerHTML = '<p class="news__loading">No hay artículos en esta categoría.</p>';
      return;
    }

    grid.innerHTML = articles
      .map((article, i) => createCardHTML(article, i))
      .join('');

    /* Actualizar aria-busy una vez cargado */
    grid.setAttribute('aria-busy', 'false');
  }

  /**
   * Activa el filtro seleccionado y filtra los artículos
   * @param {string} category - Categoría a filtrar o 'all'
   */
  function applyFilter(category) {
    const filtered = category === 'all'
      ? allArticles
      : allArticles.filter(a => a.categoria === category);

    renderArticles(filtered);
  }

  /**
   * Carga las noticias desde el archivo JSON usando Ajax (fetch)
   */
  function loadNews() {
    /* Construir ruta al JSON.
       Desde index.html (raíz) la ruta es 'data/noticias.json'.
       Desde views/*.html la ruta sería '../data/noticias.json'.
       Detectamos el contexto comprobando si la URL actual incluye '/views/'. */
    const inViews = window.location.pathname.includes('/views/');
    const jsonPath = inViews ? '../data/noticias.json' : 'data/noticias.json';

    fetch(jsonPath)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Error de red: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        allArticles = data;

        /* Eliminar spinner */
        if (loading) loading.remove();

        renderArticles(allArticles);
      })
      .catch(function (error) {
        console.error('Error al cargar noticias:', error);
        grid.innerHTML = '<p class="news__loading">Error al cargar las noticias. Por favor, inténtalo de nuevo.</p>';
        grid.setAttribute('aria-busy', 'false');
      });
  }

  /* ---- Eventos de filtro ---- */
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* Actualizar estado activo */
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      applyFilter(btn.dataset.filter);
    });
  });

  /* ---- Iniciar carga ---- */
  loadNews();
})();

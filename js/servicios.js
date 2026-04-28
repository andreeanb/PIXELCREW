/**
 * servicios.js
 * Interacciones de la página de servicios:
 *  - Animación de entrada de filas al hacer scroll (IntersectionObserver)
 *  - Efecto de atenuación de filas al pasar el ratón
 *  - Resaltado progresivo de pasos del proceso
 *  - Ocultación/aparición del navbar al hacer scroll
 */

(function () {
  'use strict';

  /* ============================================
     REFERENCIAS AL DOM
     ============================================ */
  const srvRows      = document.querySelectorAll('.srv-row');
  const processSteps = document.querySelectorAll('.process-step');
  const srvList      = document.querySelector('.srv-list');
  const processGrid  = document.querySelector('.process__grid');
  const navbar       = document.querySelector('.navbar');

  /* ============================================
     1. ANIMACIÓN DE ENTRADA AL HACER SCROLL
     ============================================ */

  function aplicarFadeIn(elementos, retardo) {
    elementos.forEach(function (el, i) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(16px)';
      el.style.transition =
        'opacity 0.35s ease ' + (i * retardo) + 's, ' +
        'transform 0.35s ease ' + (i * retardo) + 's';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    elementos.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (srvRows.length)      aplicarFadeIn(srvRows, 0.04);
  if (processSteps.length) aplicarFadeIn(processSteps, 0.04);

  /* ============================================
     2. EFECTO DE ATENUACIÓN AL PASAR EL RATÓN
     ============================================ */
  if (srvList && srvRows.length) {

    srvRows.forEach(function (row) {
      row.style.transition = 'opacity 0.15s ease';
    });

    srvList.addEventListener('mouseenter', function () {
      srvRows.forEach(function (row) { row.style.opacity = '0.4'; });
    });

    srvList.addEventListener('mouseleave', function () {
      srvRows.forEach(function (row) { row.style.opacity = '1'; });
    });

    srvRows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        srvRows.forEach(function (r) {
          r.style.opacity = r === row ? '1' : '0.4';
        });
      });
    });
  }

  /* ============================================
     3. RESALTADO PROGRESIVO DEL PROCESO
     ============================================ */
  if (processSteps.length) {

    processSteps.forEach(function (step, indice) {
      step.addEventListener('mouseenter', function () {
        processSteps.forEach(function (s, i) {
          s.classList.toggle('process-step--active', i <= indice);
        });
      });
    });

        if (processGrid) {
          processGrid.addEventListener('mouseleave', function () {
            processSteps.forEach(function (s) {
              s.classList.remove('process-step--active');
            });
          });
        }
      }
    })();
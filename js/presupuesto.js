/**
 * presupuesto.js
 * Lógica del formulario de presupuesto:
 *  - Validación de datos de contacto con JavaScript
 *  - Cálculo dinámico del presupuesto en tiempo real
 *  - Envío y reseteo del formulario
 */

(function () {
  'use strict';

  /* ============================================
     REFERENCIAS AL DOM
     ============================================ */
  const nombre     = document.getElementById('nombre');
  const apellidos  = document.getElementById('apellidos');
  const telefono   = document.getElementById('telefono');
  const email      = document.getElementById('email');
  const producto   = document.getElementById('producto');
  const plazo      = document.getElementById('plazo');
  const plazoBadge = document.getElementById('plazoBadge');
  const extras     = document.querySelectorAll('.extra-check');
  const budgetAmt  = document.getElementById('budgetAmount');
  const budgetBrk  = document.getElementById('budgetBreakdown');
  const submitBtn  = document.getElementById('submitBtn');
  const resetBtn   = document.getElementById('resetBtn');
  const formEl     = document.getElementById('budgetForm');
  const successEl  = document.getElementById('formSuccess');

  /* ============================================
     VALIDACIÓN DE CAMPOS DE CONTACTO
     ============================================ */

  /** Expresiones regulares de validación */
  const REGEX = {
    soloLetras: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/,
    soloNumeros: /^\d+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  };

  /**
   * Muestra u oculta el mensaje de error de un campo
   * @param {HTMLElement} input - El input a evaluar
   * @param {string}      errorId - ID del span de error
   * @param {string}      msg - Mensaje de error ('' = sin error)
   */
  function setError(input, errorId, msg) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;

    errorEl.textContent = msg;
    input.classList.toggle('input-error', msg !== '');
    input.classList.toggle('input-ok', msg === '' && input.value.trim() !== '');
    input.setAttribute('aria-invalid', msg !== '' ? 'true' : 'false');
  }

  /**
   * Valida el campo Nombre
   * @returns {boolean}
   */
  function validateNombre() {
    const val = nombre.value.trim();
    if (!val) {
      setError(nombre, 'nombre-error', 'El nombre es obligatorio.');
      return false;
    }
    if (!REGEX.soloLetras.test(val)) {
      setError(nombre, 'nombre-error', 'Solo se permiten letras.');
      return false;
    }
    if (val.length > 15) {
      setError(nombre, 'nombre-error', 'Máximo 15 caracteres.');
      return false;
    }
    setError(nombre, 'nombre-error', '');
    return true;
  }

  /**
   * Valida el campo Apellidos
   * @returns {boolean}
   */
  function validateApellidos() {
    const val = apellidos.value.trim();
    if (!val) {
      setError(apellidos, 'apellidos-error', 'Los apellidos son obligatorios.');
      return false;
    }
    if (!REGEX.soloLetras.test(val)) {
      setError(apellidos, 'apellidos-error', 'Solo se permiten letras.');
      return false;
    }
    if (val.length > 40) {
      setError(apellidos, 'apellidos-error', 'Máximo 40 caracteres.');
      return false;
    }
    setError(apellidos, 'apellidos-error', '');
    return true;
  }

  /**
   * Valida el campo Teléfono
   * @returns {boolean}
   */
  function validateTelefono() {
    const val = telefono.value.trim();
    if (!val) {
      setError(telefono, 'telefono-error', 'El teléfono es obligatorio.');
      return false;
    }
    if (!REGEX.soloNumeros.test(val)) {
      setError(telefono, 'telefono-error', 'Solo se permiten números.');
      return false;
    }
    if (val.length > 9) {
      setError(telefono, 'telefono-error', 'Máximo 9 dígitos.');
      return false;
    }
    setError(telefono, 'telefono-error', '');
    return true;
  }

  /**
   * Valida el campo Email
   * @returns {boolean}
   */
  function validateEmail() {
    const val = email.value.trim();
    if (!val) {
      setError(email, 'email-error', 'El correo electrónico es obligatorio.');
      return false;
    }
    if (!REGEX.email.test(val)) {
      setError(email, 'email-error', 'Formato incorrecto. Ejemplo: nombre@correo.com');
      return false;
    }
    setError(email, 'email-error', '');
    return true;
  }

  /**
   * Valida el campo Plazo
   * @returns {boolean}
   */
  function validatePlazo() {
    const val = parseInt(plazo.value, 10);
    if (!plazo.value || isNaN(val)) {
      document.getElementById('plazo-error').textContent = 'Indica un plazo en meses.';
      plazo.classList.add('input-error');
      return false;
    }
    if (val < 1 || val > 24) {
      document.getElementById('plazo-error').textContent = 'El plazo debe estar entre 1 y 24 meses.';
      plazo.classList.add('input-error');
      return false;
    }
    document.getElementById('plazo-error').textContent = '';
    plazo.classList.remove('input-error');
    return true;
  }

  /**
   * Valida el campo Producto (select)
   * @returns {boolean}
   */
  function validateProducto() {
    return producto.value !== '';
  }

  /**
   * Valida la aceptación de privacidad
   * @returns {boolean}
   */
  function validatePrivacidad() {
    const cb = document.getElementById('privacidad');
    const errEl = document.getElementById('privacidad-error');
    if (!cb.checked) {
      errEl.textContent = 'Debes aceptar la política de privacidad.';
      return false;
    }
    errEl.textContent = '';
    return true;
  }

  /* ============================================
     CÁLCULO DEL PRESUPUESTO EN TIEMPO REAL
     ============================================ */

  /**
   * Obtiene el factor de descuento/recargo según el plazo
   * @param {number} meses
   * @returns {{ factor: number, label: string, tipo: string }}
   */
  function getPlazoInfo(meses) {
    if (meses >= 1 && meses <= 3) {
      return { factor: 1.20, label: '+20% (urgente)', tipo: 'urgente' };
    }
    if (meses >= 4 && meses <= 6) {
      return { factor: 1.00, label: 'Sin recargo', tipo: 'normal' };
    }
    return { factor: 0.90, label: '−10% (descuento)', tipo: 'descuento' };
  }

  /** Recalcula y muestra el presupuesto total */
  function calcularPresupuesto() {
    /* Precio base del producto */
    const opt       = producto.options[producto.selectedIndex];
    const basePrice = opt && opt.dataset.price ? parseInt(opt.dataset.price, 10) : 0;

    /* Suma de extras seleccionados */
    let extrasTotal = 0;
    const extrasSeleccionados = [];

    extras.forEach(function (cb) {
      if (cb.checked) {
        const p = parseInt(cb.dataset.price, 10);
        extrasTotal += p;
        const name = cb.closest('.extra-option').querySelector('.extra-name').textContent;
        extrasSeleccionados.push({ name, price: p });
      }
    });

    /* Factor de plazo */
    const meses = parseInt(plazo.value, 10);
    let factor = 1;
    let plazoLabel = '—';
    let plazotipo = 'normal';

    if (!isNaN(meses) && meses >= 1 && meses <= 24) {
      const info = getPlazoInfo(meses);
      factor      = info.factor;
      plazoLabel  = info.label;
      plazotipo   = info.tipo;
    }

    /* Actualizar badge de plazo */
    plazoBadge.textContent = meses && !isNaN(meses) ? plazoLabel : '';
    plazoBadge.className = 'plazo-badge ' + plazotipo;

    /* Total */
    const subtotal = (basePrice + extrasTotal) * factor;
    const total    = Math.round(subtotal);

    /* Actualizar display */
    budgetAmt.textContent = total.toLocaleString('es-ES') + ' €';

    /* Desglose detallado */
    if (basePrice === 0) {
      budgetBrk.innerHTML = '';
      return;
    }

    let breakdown = `Base: ${basePrice.toLocaleString('es-ES')} €`;

    if (extrasSeleccionados.length > 0) {
      breakdown += '<br>';
      extrasSeleccionados.forEach(function (e) {
        breakdown += `+ ${e.name}: ${e.price.toLocaleString('es-ES')} € <br>`;
      });
    }

    if (factor !== 1) {
      breakdown += `<br>Ajuste plazo: ${plazoLabel}`;
    }

    budgetBrk.innerHTML = breakdown;
  }

  /* ============================================
     EVENTOS DE VALIDACIÓN EN TIEMPO REAL
     ============================================ */
  nombre.addEventListener('input', validateNombre);
  nombre.addEventListener('blur',  validateNombre);

  apellidos.addEventListener('input', validateApellidos);
  apellidos.addEventListener('blur',  validateApellidos);

  telefono.addEventListener('input', function () {
    /* Solo permitir números mientras se escribe */
    this.value = this.value.replace(/\D/g, '');
    validateTelefono();
  });
  telefono.addEventListener('blur', validateTelefono);

  email.addEventListener('input', validateEmail);
  email.addEventListener('blur',  validateEmail);

  /* Actualizar presupuesto al cambiar cualquier opción */
  producto.addEventListener('change', calcularPresupuesto);
  plazo.addEventListener('input', function () {
    validatePlazo();
    calcularPresupuesto();
  });

  extras.forEach(function (cb) {
    cb.addEventListener('change', calcularPresupuesto);
  });

  /* ============================================
     ENVÍO DEL FORMULARIO
     ============================================ */
  submitBtn.addEventListener('click', function () {
    /* Validar todos los campos */
    const validNombre    = validateNombre();
    const validApellidos = validateApellidos();
    const validTelefono  = validateTelefono();
    const validEmail     = validateEmail();
    const validPlazo     = validatePlazo();
    const validProducto  = validateProducto();
    const validPriv      = validatePrivacidad();

    if (!validNombre || !validApellidos || !validTelefono || !validEmail
        || !validPlazo || !validProducto || !validPriv) {

      if (!validProducto) {
        producto.focus();
        producto.classList.add('input-error');
      }
      return;
    }

    /* Todo correcto: mostrar éxito */
    formEl.style.display   = 'none';
    successEl.removeAttribute('hidden');
    successEl.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================
     RESETEO DEL FORMULARIO
     ============================================ */
  resetBtn.addEventListener('click', function () {
    /* Limpiar campos de texto */
    [nombre, apellidos, telefono, email].forEach(function (inp) {
      inp.value = '';
      inp.classList.remove('input-error', 'input-ok');
      inp.removeAttribute('aria-invalid');
    });

    /* Limpiar errores */
    document.querySelectorAll('.form-error').forEach(function (el) {
      el.textContent = '';
    });

    /* Resetear select y número */
    producto.value  = '';
    plazo.value     = '';
    plazoBadge.textContent = '';
    plazoBadge.className = 'plazo-badge';

    /* Desmarcar extras y privacidad */
    extras.forEach(cb => { cb.checked = false; });
    document.getElementById('privacidad').checked = false;

    /* Resetear clases del producto */
    producto.classList.remove('input-error');

    /* Actualizar display del presupuesto */
    calcularPresupuesto();

    /* Devolver foco al primer campo */
    nombre.focus();
  });

  /* ============================================
     INICIALIZACIÓN
     ============================================ */
  calcularPresupuesto();

})();

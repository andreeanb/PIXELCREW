'use strict';

const AGENCY = {
  lat: 41.3879,
  lng: 2.16992,
  nombre: 'PIXELCREW',
  direccion: 'ZONA FRANCA, Calle nr 3,<br>08038 Barcelona, España'
};

let map;
let routeLayer;
let userMarker;
let agencyMarker;

/* HELPERS */
const $ = (id) => document.getElementById(id);

function showHint(text, type = '') {
  const hint = $('route-hint');
  hint.textContent = text;
  hint.className = `route-tool__hint ${type}`;
}

function toggleButtons(disabled) {
  $('routeBtn').disabled = disabled;
  $('use-location').disabled = disabled;
}

function clearMap() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
  }

  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
}

/* FORMATO TIEMPO */
function formatTime(seconds) {
  const totalMinutes = Math.round(seconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

/* MAPA */
function initMap() {
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([AGENCY.lat, AGENCY.lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  agencyMarker = L.marker([AGENCY.lat, AGENCY.lng])
    .addTo(map)
    .bindPopup(`<b>${AGENCY.nombre}</b><br>${AGENCY.direccion}`)
    .openPopup();
}

/* GEOCODE ESPAÑA */
async function geocode(address) {
  let query = address.trim();

  query = `${query}, España`;

  const url =
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=1&addressdetails=1&accept-language=es`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) {
    throw new Error('notfound');
  }

  return {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon)
  };
}

/* RUTA */
async function getRoute(fromLat, fromLng, toLat, toLng, profile) {
  const mode = profile === 'cycling' ? 'bike' : profile;

  const url =
    `https://router.project-osrm.org/route/v1/${mode}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes.length) {
    throw new Error('route');
  }

  const route = data.routes[0];

  return {
    coords: route.geometry.coordinates.map(point => [point[1], point[0]]),
    distance: route.distance,
    duration: route.duration
  };
}

/* DIBUJAR RUTA */
function drawRoute(route) {
  routeLayer = L.polyline(route.coords, {
    color: '#e8ff00',
    weight: 6,
    opacity: 0.9
  }).addTo(map);

  map.fitBounds(routeLayer.getBounds(), {
    padding: [50, 50],
    animate: true
  });

  const km = (route.distance / 1000).toFixed(1);
  const time = formatTime(route.duration);

  showHint(`Distancia: ${km} km · Tiempo estimado: ${time}`, 'success');
}

/* DIRECCIÓN MANUAL */
async function calculateFromAddress() {
  const address = $('userAddress').value.trim();
  const profile = $('mode').value;

  if (!address) {
    showHint('Introduce una dirección o código postal.', 'error');
    return;
  }

  try {
    toggleButtons(true);
    clearMap();

    showHint('Buscando ubicación...');

    const coords = await geocode(address);

    userMarker = L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup('Tu ubicación')
      .openPopup();

    showHint('Calculando ruta...');

    const route = await getRoute(
      coords.lat,
      coords.lng,
      AGENCY.lat,
      AGENCY.lng,
      profile
    );

    drawRoute(route);

  } catch (error) {
    if (error.message === 'notfound') {
      showHint('No se encontró la dirección en España.', 'error');
    } else {
      showHint('Error calculando la ruta.', 'error');
    }
  } finally {
    toggleButtons(false);
  }
}

/* GEOLOCALIZACIÓN */
function calculateFromGPS() {
  if (!navigator.geolocation) {
    showHint('Tu navegador no permite geolocalización.', 'error');
    return;
  }

  const profile = $('mode').value;

  toggleButtons(true);
  clearMap();

  showHint('Obteniendo ubicación...');

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      userMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup('Tu ubicación')
        .openPopup();

      showHint('Calculando ruta...');

      const route = await getRoute(
        lat,
        lng,
        AGENCY.lat,
        AGENCY.lng,
        profile
      );

      drawRoute(route);

    } catch {
      showHint('Error calculando la ruta.', 'error');
    } finally {
      toggleButtons(false);
    }

  }, (error) => {
    let msg = 'No se pudo obtener tu ubicación.';

    if (error.code === 1) {
      msg = 'Permiso de ubicación denegado.';
    }

    showHint(msg, 'error');
    toggleButtons(false);
  });
}

/* INICIO */
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  $('routeBtn').addEventListener('click', calculateFromAddress);
  $('use-location').addEventListener('click', calculateFromGPS);
});
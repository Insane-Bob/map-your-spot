<template>
  <div id="map" class="map-container"></div>

  <!-- Logo -->
  <img src="/logo.png" alt="Project Logo" class="project-logo" />

  <!-- Bouton ajouter un point par adresse -->
  <button class="add-spot-btn" @click="showAddressModal = true">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    {{ addSpotLabel }}
  </button>

  <!-- Modal clic sur carte -->
  <Modal
    v-if="showModal && !selectedPoint"
    :newPoint="newPoint"
    :language="language"
    @save="savePoint"
    @close="closeModal"
  />

  <!-- Modal ajout par adresse -->
  <Modal
    v-if="showAddressModal"
    :addressMode="true"
    :language="language"
    @save="savePoint"
    @close="showAddressModal = false"
  />

  <InfoCard
    v-if="selectedPoint && !showModal"
    :point="selectedPoint"
    :language="language"
    @close="closeInfoCard"
  />

  <div class="contact-banner-wrapper">
    <ContactBanner />
  </div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { computed, defineProps, nextTick, onMounted, ref } from 'vue'
import { categories } from '../config/categories.js'
import { getLabel } from '../config/i18n.js'
import { roadColorForHighway, roadPriority, roadWeightForHighway } from '../config/roads.js'
import InfoCard from './InfoCard.vue'
import Modal from './Modal.vue'
import ContactBanner from './ContactBanner.vue'

const props = defineProps({
  language: {
    type: String,
    default: 'de',
  },
})

const addSpotLabel = computed(() => getLabel('addSpotBtn', props.language))

const points        = ref([])
const selectedPoint = ref(null)
const showModal     = ref(false)
const showAddressModal = ref(false)
const newPoint      = ref(null)

let map = null
let roadsLayer = null
let roadRefreshTimer = null

/* ---------------------------
   LOAD POINTS FROM DATABASE
---------------------------- */
async function loadPoints() {
  try {
    const res = await fetch('/api/point')
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    points.value = data

    data.forEach((point) => {
      if (point.lat && point.lng && point.category && categories[point.category]) {
        addMarkerToMap(point)
      }
    })
  } catch (err) {
    console.error('Erreur chargement points:', err)
    // Fallback: utiliser les seed points si l'API échoue
    points.value = []
  }
}

/* ---------------------------
   MAP INIT
---------------------------- */
onMounted(() => {
  nextTick(async () => {
    map = L.map('map', {
      center: [47.8095, 13.055],
      zoom: 13,
      zoomControl: true,
    })

    if (!map.getPane('roadsPane')) {
      map.createPane('roadsPane')
      map.getPane('roadsPane').style.zIndex = '420'
    }

    const apiKey = import.meta.env.VITE_STADIA_KEY

    L.tileLayer(
      `https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png?api_key=${apiKey}`,
      {
        attribution: '&copy; Stadia Maps &copy; OpenStreetMap contributors',
        maxZoom: 20,
      },
    ).addTo(map)

    map.on('click', handleMapClick)
    map.on('moveend', scheduleRoadRefresh)

    await loadPoints()
    loadRoadOverlay()
  })
})

/* ---------------------------
   ROAD OVERLAY
---------------------------- */
function scheduleRoadRefresh() {
  clearTimeout(roadRefreshTimer)
  roadRefreshTimer = setTimeout(loadRoadOverlay, 250)
}

async function loadRoadOverlay() {
  if (!map) return

  const bounds = map.getBounds()
  const query = `
    [out:json][timeout:20];
    way["highway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    out geom;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    if (!response.ok) return

    const data = await response.json()

    if (roadsLayer) map.removeLayer(roadsLayer)
    roadsLayer = L.layerGroup().addTo(map)

    const ways = (data.elements || [])
      .filter((el) => el.type === 'way' && el.tags?.highway && el.geom?.length)
      .sort((a, b) => roadPriority(a.tags.highway) - roadPriority(b.tags.highway))

    for (const el of ways) {
      const latLngs = el.geom.map((n) => [n.lat, n.lon])

      L.polyline(latLngs, {
        color: roadColorForHighway(el.tags.highway),
        weight: roadWeightForHighway(el.tags.highway),
        opacity: 0.95,
        interactive: false,
        lineCap: 'round',
        lineJoin: 'round',
        pane: 'roadsPane',
      }).addTo(roadsLayer)
    }
  } catch (err) {
    console.warn('Overlay unavailable:', err)
  }
}

/* ---------------------------
   CLICK → CREATE POINT
---------------------------- */
function handleMapClick(e) {
  if (e?.originalEvent?.target?.classList?.contains('leaflet-interactive')) return

  newPoint.value = {
    lat: e.latlng.lat,
    lng: e.latlng.lng,
  }
  showModal.value = true
}

/* ---------------------------
   ADD MARKER
---------------------------- */
function addMarkerToMap(point) {
  if (!point.category || !categories[point.category]) return

  const category = categories[point.category]
  const color = category.color

  const circle = L.circleMarker([point.lat, point.lng], {
    radius: 12,
    fillColor: color,
    color: color,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.9,
  }).addTo(map)

  circle.bindTooltip(`<strong>${point.title}</strong><br/><small>${category.label}</small>`, {
    direction: 'top',
    offset: [0, -12],
  })

  circle.on('click', (event) => {
    // Block click propagation so map.on('click') does not open the add-point modal.
    L.DomEvent.stopPropagation(event)
    selectedPoint.value = point
  })

  circle.on('mouseover', function () {
    this.setRadius(16)
  })

  circle.on('mouseout', function () {
    this.setRadius(12)
  })
}

/* ---------------------------
   SAVE POINT TO DATABASE
---------------------------- */
async function savePoint(data) {
  try {
    const res = await fetch('/api/point', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const savedPoint = await res.json()

    points.value.push(savedPoint)
    addMarkerToMap(savedPoint)
    closeModal()
    showAddressModal.value = false

    console.log('✅ Point sauvegardé:', savedPoint)
  } catch (err) {
    console.error('Erreur sauvegarde:', err)
    alert('Erreur lors de la sauvegarde: ' + err.message)
  }
}

/* ---------------------------
   CLOSE HANDLERS
---------------------------- */
function closeModal() {
  showModal.value = false
  newPoint.value = null
}

function closeInfoCard() {
  selectedPoint.value = null
}
</script>

<style scoped>
/* ─── Map container ───────────────────────────────────────── */
.map-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  inset: 0;
  touch-action: pan-x pan-y;
}

/* ─── Logo ────────────────────────────────────────────────── */
.project-logo {
  position: fixed;
  left: -15px;
  bottom: -30px;
  width: 250px;
  height: auto;
  z-index: 900;
  pointer-events: none;
  opacity: 0.92;
}

@media (max-width: 768px) {
  .project-logo { width: 180px; left: -20px; bottom: -20px; }
}
@media (max-width: 480px) {
  .project-logo { width: 140px; left: -15px; bottom: -15px; }
}

/* ─── Add spot button ─────────────────────────────────────── */
.add-spot-btn {
  position: fixed;
  bottom: 28px;
  right: 18px;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: var(--c-accent-pink);
  color: rgba(255, 255, 255, 0.92);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: var(--shadow-md), 0 3px 0 0 rgba(0, 0, 0, 0.3);
  transition: all 0.15s ease;
}

.add-spot-btn:hover {
  background: var(--c-accent-pink-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg), 0 3px 0 0 rgba(0, 0, 0, 0.3);
}

.add-spot-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 0 0 rgba(0, 0, 0, 0.3);
}

@media (max-width: 480px) {
  .add-spot-btn { bottom: 18px; right: 12px; padding: 9px 14px; font-size: 11px; }
}

/* ─── Contact banner wrapper ──────────────────────────────── */
.contact-banner-wrapper {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 900;
}

@media (max-width: 600px) {
  .contact-banner-wrapper { top: 12px; left: 12px; }
}
</style>

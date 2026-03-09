<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="$emit('close')">
      <div class="modal-card">

        <!-- HEADER -->
        <div class="modal-header">
          <div class="header-left">
            <svg class="logo" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 16 L16 3 A13 13 0 0 1 29 16 Z" fill="none"/>
              <path d="M16 16 L29 16 A13 13 0 0 1 16 29 Z" fill="#f48837"/>
              <path d="M16 16 L16 29 A13 13 0 0 1 3 16 Z" fill="#b192f2"/>
              <path d="M16 16 L3 16 A13 13 0 0 1 16 3 Z" fill="#ea5f90"/>
            </svg>
            <span class="header-title">MAP YOUR SPOT</span>
          </div>
           <button class="close-btn" @click="$emit('close')" aria-label="Fermer">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line
              x1="1"
              y1="1"
              x2="11"
              y2="11"
              stroke="#f0449a"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <line
              x1="11"
              y1="1"
              x2="1"
              y2="11"
              stroke="#f0449a"
              stroke-width="2.2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        </div>

        <!-- FORM -->
        <form class="modal-body" @submit.prevent="save">

          <!-- ADDRESS (addressMode only) -->
          <div v-if="addressMode" class="field-block">
            <label class="field-label">{{ t('address') }}</label>
            <div class="address-row">
              <input
                v-model="address"
                type="text"
                class="field-input"
                :placeholder="t('addressPlaceholder')"
                :disabled="isGeocoding"
                @keydown="handleAddressKeydown"
              />
              <button
                type="button"
                class="search-btn"
                :disabled="isGeocoding || !address.trim()"
                @click="searchAddress"
              >
                <svg v-if="isGeocoding" class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
            <p v-if="geocodeError" class="feedback feedback--error">{{ geocodeError }}</p>
            <p v-if="geocodedPoint" class="feedback feedback--ok">✓ {{ geocodedPoint.displayName }}</p>
          </div>

          <!-- TITLE -->
          <div class="field-block">
            <label class="field-label">{{ t('title') }}</label>
            <input v-model="title" type="text" class="field-input" :placeholder="t('titlePlaceholder')" required/>
          </div>

          <!-- AUTHOR -->
          <div class="field-block">
            <label class="field-label">{{ t('author') }}</label>
            <input v-model="author" type="text" class="field-input" :placeholder="t('authorPlaceholder')"/>
          </div>

          <!-- DESCRIPTION DE -->
          <div class="field-block">
            <label class="field-label">
              {{ t('description') }}
              <span class="lang-chip lang-chip--de">DE</span>
            </label>
            <textarea v-model="descriptionDe" class="field-input field-textarea" :placeholder="t('descriptionPlaceholder')" rows="3"></textarea>
          </div>

          <!-- DESCRIPTION EN -->
          <div class="field-block">
            <label class="field-label">
              {{ t('description') }}
              <span class="lang-chip lang-chip--en">EN</span>
            </label>
            <textarea v-model="descriptionEn" class="field-input field-textarea" :placeholder="t('descriptionPlaceholder')" rows="3"></textarea>
          </div>

          <!-- CATEGORY -->
          <div class="field-block">
            <label class="field-label">{{ t('category') }}</label>
            <div class="cat-grid">
              <label
                v-for="(cat, key) in categories"
                :key="key"
                class="cat-tile"
                :class="{ 'cat-tile--active': category === key }"
                :style="category === key ? { '--cc': cat.color } : {}"
              >
                <input type="radio" :value="key" v-model="category" class="sr-only"/>
                <div class="cat-tile__icon" :style="category === key ? { background: cat.color } : {}">
                  <img :src="cat.icon" :alt="getCategoryLabel(key)"/>
                </div>
                <span class="cat-tile__name">{{ getCategoryLabel(key) }}</span>
              </label>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="$emit('close')">
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn--save"
              :disabled="!title || !category || (addressMode && !geocodedPoint)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ t('save') }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { categories } from '../config/categories.js'
import { getLabel } from '../config/i18n.js'

const props = defineProps({
  newPoint:    Object,
  language:    { type: String,  default: 'de' },
  addressMode: { type: Boolean, default: false },
})
const emit = defineEmits(['save', 'close'])

const title         = ref('')
const author        = ref('')
const descriptionDe = ref('')
const descriptionEn = ref('')
const category      = ref('')
const address       = ref('')
const geocodedPoint = ref(null)
const isGeocoding   = ref(false)
const geocodeError  = ref('')

const t = (key) => getLabel(key, props.language)
const getCategoryLabel = (key) => getLabel(`categories.${key}`, props.language)

async function searchAddress() {
  if (!address.value.trim()) return
  isGeocoding.value = true; geocodeError.value = ''; geocodedPoint.value = null
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address.value)}&format=json&limit=1`, { headers: { 'Accept-Language': props.language } })
    const data = await res.json()
    if (!data.length) geocodeError.value = t('geocodeError')
    else geocodedPoint.value = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name }
  } catch { geocodeError.value = t('geocodeError') }
  finally { isGeocoding.value = false }
}

function handleAddressKeydown(e) {
  if (e.key === 'Enter') { e.preventDefault(); searchAddress() }
}

function save() {
  if (!title.value || !category.value) return
  const point = props.addressMode ? geocodedPoint.value : props.newPoint
  if (!point) return
  emit('save', { lat: point.lat, lng: point.lng, title: title.value, author: author.value, description_de: descriptionDe.value, description_en: descriptionEn.value, category: category.value })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&display=swap');

/* ─── Card ───────────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 3, 20, 0.58);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
  animation: fade 0.18s ease both;
}
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }

.modal-card {
  background: #c6f136;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.4) inset,
    0 6px 0 #9fcc08,
    0 10px 50px rgba(0,0,0,0.28);
  animation: rise 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.modal-card::-webkit-scrollbar { display: none; }
@keyframes rise {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to   { opacity: 1; transform: none; }
}

/* ─── Header ─────────────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));
}

.header-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: #4a28cc;
}

.close-btn {
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.5);
  border: 1.5px solid rgba(255,255,255,0.8);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.14s, transform 0.12s;
}
.close-btn:hover {
  background: rgba(255,255,255,0.82);
  transform: scale(1.08);
}

/* ─── Form body ──────────────────────────────────────────── */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 18px 22px;
}

/* ─── Field block ────────────────────────────────────────── */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(26,16,64,0.5);
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-chip {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: 4px;
}
.lang-chip--de { background: #4a28cc; color: #fff; }
.lang-chip--en { background: #1a1040; color: #fff; }

/* ─── Inputs ─────────────────────────────────────────────── */
.field-input {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  color: #1a1040;
  background: rgba(255,255,255,0.78);
  border: 1.5px solid rgba(255,255,255,0.9);
  border-radius: 11px;
  padding: 10px 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: background 0.14s, border-color 0.14s, box-shadow 0.14s;
}
.field-input:focus {
  background: rgba(255,255,255,0.97);
  border-color: #4a28cc;
  box-shadow: 0 0 0 3px rgba(74,40,204,0.15);
}
.field-input::placeholder {
  color: rgba(26,16,64,0.22);
  font-weight: 400;
}
.field-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.55;
}

/* ─── Address ────────────────────────────────────────────── */
.address-row { display: flex; gap: 8px; }
.address-row .field-input { flex: 1; min-width: 0; }

.search-btn {
  background: #4a28cc;
  color: #fff;
  border: none;
  border-radius: 11px;
  padding: 0 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 0 #341aa0;
  transition: background 0.13s, transform 0.1s, box-shadow 0.1s;
}
.search-btn:hover:not(:disabled) { background: #3d1fb0; }
.search-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 #341aa0; }
.search-btn:disabled { background: rgba(74,40,204,0.28); box-shadow: none; cursor: not-allowed; }

@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.spin-icon { animation: spin 0.75s linear infinite; }

.feedback {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.72rem;
  padding: 6px 10px;
  border-radius: 8px;
}
.feedback--error { background: rgba(200,40,40,0.1); color: #b92d1e; }
.feedback--ok    { background: rgba(30,160,80,0.1); color: #186b35; }

/* ─── Category : pills horizontales (icône + label) ─────── */
.cat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.cat-tile {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 7px;
  background: rgba(255, 255, 255, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s, transform 0.12s, box-shadow 0.12s;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.07);
}
.cat-tile:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.cat-tile--active {
  background: #ffffff;
  border-color: var(--cc, #4a28cc);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--cc, #4a28cc) 22%, transparent),
    0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.cat-tile__icon {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.14s;
}
.cat-tile--active .cat-tile__icon {
  background: var(--cc, #4a28cc);
}

.cat-tile__icon img {
  width: 15px;
  height: 15px;
  min-width: 15px;
  min-height: 15px;
  max-width: 15px;
  max-height: 15px;
  object-fit: contain;
  filter: brightness(0) invert(0.2);
  transition: filter 0.13s;
}
.cat-tile--active .cat-tile__icon img {
  filter: brightness(0) invert(1);
}

.cat-tile__name {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: rgba(26, 16, 64, 0.6);
  white-space: nowrap;
}
.cat-tile--active .cat-tile__name {
  color: var(--cc, #4a28cc);
  font-weight: 600;
}

/* ─── Actions ────────────────────────────────────────────── */
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.btn {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  padding: 11px 20px;
  border-radius: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  transition: all 0.13s ease;
}

.btn--save {
  flex: 1;
  justify-content: center;
  background: #4a28cc;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 0 #341aa0;
}
.btn--save:hover:not(:disabled) {
  background: #3d1fb0;
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #341aa0;
}
.btn--save:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #341aa0;
}
.btn--save:disabled {
  background: rgba(74,40,204,0.28);
  color: rgba(255,255,255,0.45);
  box-shadow: none;
  cursor: not-allowed;
}

.btn--cancel {
  background: rgba(255,255,255,0.48);
  color: rgba(26,16,64,0.65);
  border: 1.5px solid rgba(255,255,255,0.75);
  box-shadow: 0 4px 0 rgba(0,0,0,0.06);
}
.btn--cancel:hover {
  background: rgba(255,255,255,0.72);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 rgba(0,0,0,0.06);
}
.btn--cancel:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}

/* ─── Utils ──────────────────────────────────────────────── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 480px) {
  .backdrop { padding: 0; align-items: flex-end; }
  .modal-card {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 92vh;
  }
}
</style>
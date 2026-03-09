<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="$emit('close')">
      <div class="info-card">
        <!-- CLOSE BTN -->
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

        <!-- TOP : icône catégorie carré lime + titre -->
        <div class="card-top">
          <div class="cat-square">
            <img
              v-if="point.category && categories[point.category]"
              :src="categories[point.category].icon"
              :alt="getCategoryLabel(point.category)"
              class="cat-square__icon"
            />
          </div>

          <div class="title-wrap">
            <h1 class="card-title">{{ point.title }}</h1>
            <div class="title-underline"></div>
          </div>
        </div>

        <!-- META : logo + nom + auteur -->
        <div class="card-meta">
          <div class="meta-row">
            <svg class="logo" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 16 L16 3 A13 13 0 0 1 29 16 Z" fill="none"/>
              <path d="M16 16 L29 16 A13 13 0 0 1 16 29 Z" fill="#f48837"/>
              <path d="M16 16 L16 29 A13 13 0 0 1 3 16 Z" fill="#b192f2"/>
              <path d="M16 16 L3 16 A13 13 0 0 1 16 3 Z" fill="#ea5f90"/>
            </svg>
            <span class="meta-name">{{ point.title }}</span>
          </div>
          <span v-if="point.author" class="meta-author">{{ point.author }}</span>
        </div>

        <!-- BULLE DESCRIPTION -->
        <div class="desc-bubble">
          <p class="desc-text">{{ pointDescription || t('noDescription') }}</p>
          <div class="bubble-tail" aria-hidden="true"></div>
        </div>

        <!-- CATÉGORIE PILL -->
        <div v-if="point.category && categories[point.category]" class="card-footer">
          <div class="cat-pill" :style="{ '--cc': categories[point.category].color }">
            <div
              class="cat-pill__icon-wrap"
              :style="{ background: categories[point.category].color }"
            >
              <img
                :src="categories[point.category].icon"
                :alt="getCategoryLabel(point.category)"
                class="cat-pill__icon"
              />
            </div>
            <span class="cat-pill__label">{{ getCategoryLabel(point.category) }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { categories } from '../config/categories.js'
import { getLabel } from '../config/i18n.js'

const props = defineProps({
  point: Object,
  language: { type: String, default: 'de' },
})
defineEmits(['close'])

const t = (key) => getLabel(key, props.language)
const getCategoryLabel = (key) => getLabel(`categories.${key}`, props.language)

const pointDescription = computed(() => {
  const p = props.point
  if (!p) return ''
  if (props.language === 'en') return p.description_en || p.description_de || p.description || ''
  return p.description_de || p.description || ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');

/* ─── Backdrop ───────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 3, 20, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
  animation: fade 0.2s ease both;
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ─── Card ───────────────────────────────────────────────── */
.info-card {
  background: #6b3ff6;
  border-radius: 22px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 22px 22px 26px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.16) inset,
    0 6px 0 #4a22cc,
    0 12px 50px rgba(0, 0, 0, 0.35);
  animation: rise 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.info-card::-webkit-scrollbar {
  display: none;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ─── Close btn ── */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  background: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.12s,
    box-shadow 0.12s;
  z-index: 2;
  flex-shrink: 0;
}
.close-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

/* ─── Top : carré + titre ────────────────────────────────── */
.card-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-right: 44px;
}

.cat-square {
  width: 72px;
  height: 72px;
  min-width: 72px;
  background: #c6f136;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-shrink: 0;
  box-shadow:
    0 4px 0 #9fcc08,
    0 8px 18px rgba(0, 0, 0, 0.2);
}
.cat-square__icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: brightness(0) invert(0.1);
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  min-width: 0;
}
.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(1.15rem, 4vw, 1.55rem);
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.1;
  word-break: break-word;
}
.title-underline {
  height: 3px;
  width: 100%;
  background: #c6f136;
  border-radius: 2px;
}

/* ─── Meta ───────────────────────────────────────────────── */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.meta-logo {
  flex-shrink: 0;
}
.meta-name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
}
.meta-author {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  padding-left: 31px;
}

/* ─── Bulle description ──────────────────────────────────── */
.desc-bubble {
  background: #ffffff;
  border: 2.5px solid #c6f136;
  border-radius: 4px 16px 16px 16px;
  padding: 18px 20px 20px;
  position: relative;
}

/* Queue pointue haut-gauche, vers l'auteur */
.bubble-tail {
  position: absolute;
  top: -16px;
  left: 30px;
  width: 20px;
  height: 16px;
  overflow: hidden;
}
.bubble-tail::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 10px solid #c6f136;
  border-top: 16px solid transparent;
}
.bubble-tail::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 7px solid #ffffff;
  border-top: 13px solid transparent;
}

.desc-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 0.88rem;
  color: #1a1040;
  line-height: 1.75;
  margin: 0;
}

/* ─── Footer catégorie ─────────────── */
.card-footer {
  display: flex;
  padding-top: 8px;
}
.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 7px;
  background: rgba(255, 255, 255, 0.14);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 9px;
}
.cat-pill__icon-wrap {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cat-pill__icon {
  width: 15px;
  height: 15px;
  min-width: 15px;
  min-height: 15px;
  max-width: 15px;
  max-height: 15px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.cat-pill__label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 480px) {
  .backdrop {
    padding: 0;
    align-items: flex-end;
  }
  .info-card {
    max-width: 100%;
    border-radius: 22px 22px 0 0;
    max-height: 92vh;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.12) inset,
      0 -8px 40px rgba(0, 0, 0, 0.3);
  }
  .cat-square {
    width: 60px;
    height: 60px;
    min-width: 60px;
    border-radius: 13px;
  }
  .cat-square__icon {
    width: 26px;
    height: 26px;
  }
  .card-title {
    font-size: 1.05rem;
  }
}
</style>

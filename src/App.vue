<template>
  <div id="app">
    <!-- Language Switcher -->
    <div class="language-switcher">
      <button @click="setLanguage('de')" :class="{ active: currentLanguage === 'de' }">
        <span class="flag">🇩🇪</span>
        <span class="lang-label">DE</span>
      </button>
      <div class="switcher-divider"></div>
      <button @click="setLanguage('en')" :class="{ active: currentLanguage === 'en' }">
        <span class="flag">🇬🇧</span>
        <span class="lang-label">EN</span>
      </button>
    </div>

    <MapView :language="currentLanguage" />
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'
import MapView from './components/MapView.vue'

const currentLanguage = ref('de')

const setLanguage = (lang) => {
  currentLanguage.value = lang
}

provide('language', currentLanguage)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
  margin: 0;
  padding: 0;
  cursor: url('/cursor_bis.png'), auto;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
  inset: 0;
}

/* ─── Language Switcher ───────────────────────────────────── */
.language-switcher {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0;

  background: #6b3ff6;
  border-radius: 14px;
  padding: 5px;

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.16) inset,
    0 4px 0 #4a22cc,
    0 8px 28px rgba(0, 0, 0, 0.3);
}

.switcher-divider {
  width: 1.5px;
  height: 18px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  flex-shrink: 0;
}

.language-switcher button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}

.language-switcher button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.language-switcher button:active {
  transform: scale(0.95);
}

.language-switcher button.active {
  background: #c6f136;
  box-shadow: 0 2px 0 #9fcc08;
}

.flag {
  font-size: 14px;
  line-height: 1;
}

.lang-label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.85);
  transition: color 0.15s ease;
}

.language-switcher button.active .lang-label {
  color: #1a1040;
}

@media (max-width: 768px) {
  .language-switcher {
    top: auto;
    right: auto;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
    transform: translateX(-50%);
    padding: 6px;
    border-radius: 16px;
  }

  .language-switcher button {
    min-height: 40px;
    padding: 8px 14px;
  }

  .switcher-divider {
    height: 20px;
  }

  .flag {
    font-size: 15px;
  }

  .lang-label {
    font-size: 0.78rem;
  }
}
</style>

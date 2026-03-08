<template>
  <div class="orbyte-banner">
    <!-- Left: CTA pink -->
    <div class="banner-left">
      <p class="banner-tagline">
        MAP YOUR SPOT<br />
        &amp; JOIN <span class="brand-name">ORBYTE</span>
      </p>
    </div>

    <!-- Right: Nav white -->
    <div class="banner-right">
      <a href="#" class="banner-item instagram" aria-label="Instagram">
        <svg
          class="ig-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>

      <a href="#" class="banner-item kontakt">KONTAKT</a>
      <a href="#" class="banner-item faq">FAQ</a>
    </div>
  </div>
</template>

<script setup>
// No props needed — fully self-contained banner component
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap');

/* ── Banner shell ─────────────────────────────────────── */
.orbyte-banner {
  display: inline-flex;
  align-items: stretch;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0 0 3px #7c4dff;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  user-select: none;
}

/* ── Left pink panel ──────────────────────────────────── */
.banner-left {
  background: #f0449a;
  padding: 18px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.banner-tagline {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.4;
  color: #fff;
}

.brand-name {
  color: #6b3ff6;
}

/* ── Right white panel ────────────────────────────────── */
.banner-right {
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

/* ── Nav items ────────────────────────────────────────── */
.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 26px;
  height: 100%;
  font-size: 0.92rem;
  font-weight: 800;
  text-decoration: none;
  color: #111;
  transition: opacity 0.18s ease;
  white-space: nowrap;
}

.banner-item:hover {
  opacity: 0.65;
}

.banner-item.instagram {
  padding: 0 22px;
}

.ig-icon {
  width: 26px;
  height: 26px;
  stroke: #111;
}

.banner-item.kontakt {
  color: #ff5c00;
}

/* ── Mobile compact (≤ 600px) ─────────────────────────── */
@media (max-width: 600px) {
  .orbyte-banner {
    border-radius: 10px;
    box-shadow: 0 0 0 2px #7c4dff;
  }

  .banner-left {
    padding: 10px 14px;
    min-width: unset;
  }

  .banner-tagline {
    font-size: 0.65rem;
    line-height: 1.3;
  }

  .banner-right {
    padding: 0 4px;
  }

  .banner-item {
    padding: 0 10px;
    font-size: 0.6rem;
    letter-spacing: 0.08em;
  }

  .banner-item.instagram {
    padding: 0 8px;
  }

  .ig-icon {
    width: 16px;
    height: 16px;
  }

  /* Cacher IMPRESSUM sur très petit écran */
  .banner-item.impressum {
    display: none;
  }
}
</style>
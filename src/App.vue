<template>
  <div id="app">
    <!-- Header -->
    <header class="site-header">
      <div class="container">
        <nav style="display: flex; justify-content: space-between; align-items: center;">
          <router-link to="/" class="site-title">Kubishi Sentences</router-link>

          <!-- Desktop Navigation -->
          <div class="desktop-nav" style="display: flex; gap: 1.5rem; align-items: center;">
            <div class="site-nav">
              <router-link to="/builder">Builder</router-link>
              <router-link to="/translator">Translator</router-link>
              <router-link to="/about">About</router-link>
              <a href="https://dictionary.kubishi.com" target="_blank">Dictionary</a>
            </div>
            <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
              {{ isDarkMode ? 'Light' : 'Dark' }}
            </button>
          </div>

          <!-- Mobile Navigation -->
          <div class="mobile-nav">
            <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'" style="margin-right: 0.5rem;">
              {{ isDarkMode ? 'Light' : 'Dark' }}
            </button>
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="hamburger-toggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        <!-- Mobile Menu Dropdown -->
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <router-link to="/builder" @click="mobileMenuOpen = false">Builder</router-link>
          <router-link to="/translator" @click="mobileMenuOpen = false">Translator</router-link>
          <router-link to="/about" @click="mobileMenuOpen = false">About</router-link>
          <a href="https://dictionary.kubishi.com" target="_blank" @click="mobileMenuOpen = false">Dictionary</a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container">
        <p>© 2024 Kubishi Research Group</p>
        <p style="margin-top: 0.5rem;">
          <a href="https://github.com/kubishi" target="_blank" style="color: var(--text-tertiary);">GitHub</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isDarkMode: false,
      mobileMenuOpen: false
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      this.isDarkMode = true
      document.body.classList.add('dark-mode')
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        document.body.classList.remove('dark-mode')
        localStorage.setItem('theme', 'light')
      }
    }
  }
}
</script>

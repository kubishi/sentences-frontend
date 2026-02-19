<template>
  <span class="info-button-wrapper">
    <button type="button" class="info-btn" @click.stop="open = !open" :aria-expanded="open">?</button>
    <div v-if="open" class="info-popover" @click.stop>
      <p v-for="(line, i) in lines" :key="i">{{ line }}</p>
    </div>
  </span>
</template>

<script>
export default {
  name: 'InfoButton',
  props: {
    text: { type: String, required: true },
  },
  data() {
    return { open: false }
  },
  computed: {
    lines() {
      // Split on sentence boundaries that separate the description from the word list
      // e.g. "A noun lemma. Known nouns: cat, dog, ... placeholder."
      return this.text.split(/(?<=\.)\s+(?=Known |If )/).filter(Boolean)
    },
  },
  mounted() {
    this._onClickOutside = (e) => {
      if (this.open && !this.$el.contains(e.target)) {
        this.open = false
      }
    }
    document.addEventListener('click', this._onClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this._onClickOutside)
  },
}
</script>

<style scoped>
.info-button-wrapper {
  position: relative;
  display: inline-block;
}

.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 1px solid var(--border-secondary);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  vertical-align: middle;
  transition: all 0.15s;
}

.info-btn:hover,
.info-btn[aria-expanded="true"] {
  background: var(--accent-light);
  color: var(--accent-text);
  border-color: var(--accent-border);
}

.info-popover {
  position: absolute;
  left: 50%;
  top: calc(100% + 0.4rem);
  transform: translateX(-50%);
  z-index: 100;
  min-width: 14rem;
  max-width: 22rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-secondary);
  background: var(--bg-secondary, #1a1a2e);
  color: var(--text-primary);
  font-size: 0.8rem;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.info-popover p {
  margin: 0;
}

.info-popover p + p {
  margin-top: 0.4rem;
}
</style>

<template>
  <div class="translator-page">
    <div class="container">
      <div class="page-header">
        <h1>Translator</h1>
        <p class="subtitle">Translate English sentences to Owens Valley Paiute</p>
      </div>

      <div class="disclaimer">
        <p>
          This translator is based on the research presented in the paper
          <a href="https://arxiv.org/abs/2405.08997" target="_blank">LLM-Assisted Rule Based Machine Translation for Low/No-Resource Languages</a>.
          It is an educational tool and is not perfect.
          Please take the results with a grain of salt and always consult our
          great teachers at the <a href="http://www.ovcdc.com/language" target="_blank">Nüümü Yadoha Language Program</a>
          for the most accurate translations.
        </p>
      </div>

      <div class="suggestions">
        <p><strong>Some suggestions to try:</strong></p>
        <ul>
          <li @click="setInput('I eat rice.')">I eat rice.</li>
          <li @click="setInput('The dog and I are running.')">The dog and I are running.</li>
          <li @click="setInput('The cat slept.')">The cat slept.</li>
          <li @click="setInput('He will fish.')">He will fish.</li>
        </ul>
      </div>

      <div class="translator-form">
        <div class="input-wrapper">
          <input
            type="text"
            v-model="inputText"
            placeholder="Enter a sentence in English"
            @keypress.enter="translate"
            :disabled="loading"
          />
          <button @click="translate" :disabled="loading || !inputText.trim()" class="btn btn-primary">
            {{ loading ? 'Translating...' : 'Translate' }}
          </button>
        </div>
      </div>

      <div v-if="result" class="translation-result">
        <div class="result-row">
          <div class="result-label">English</div>
          <div class="result-text">{{ result.source }}</div>
        </div>
        <div class="result-row">
          <div class="result-label">Paiute</div>
          <div class="result-text paiute-text">{{ result.target }}</div>
        </div>
        <div v-if="result.back_translation" class="result-row">
          <div class="result-label">Back-translation</div>
          <div class="result-text">{{ result.back_translation.source }}</div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { translatePipeline } from '../services/api'

export default {
  name: 'Translator',
  data() {
    return {
      inputText: '',
      result: null,
      loading: false,
      error: ''
    }
  },
  methods: {
    setInput(text) {
      this.inputText = text
    },
    async translate() {
      if (!this.inputText.trim()) return

      this.loading = true
      this.error = ''
      this.result = null

      try {
        this.result = await translatePipeline(this.inputText)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.translator-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-tertiary);
}

.disclaimer {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.disclaimer p {
  color: var(--text-secondary);
  line-height: 1.8;
}

.disclaimer a {
  color: var(--accent-primary);
}

.suggestions {
  text-align: center;
  margin-bottom: 2rem;
}

.suggestions p {
  margin-bottom: 0.5rem;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.suggestions li {
  background: var(--bg-tertiary);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
  font-style: italic;
}

.suggestions li:hover {
  background: var(--border-secondary);
}

.translator-form {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.input-wrapper {
  display: flex;
  border: 2px solid var(--border-secondary);
  border-radius: 0.25rem;
  overflow: hidden;
}

.input-wrapper input {
  flex: 1;
  padding: 1rem;
  border: none;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-tertiary);
}

.btn {
  padding: 1rem 1.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.translation-result {
  max-width: 600px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.result-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.result-row:last-of-type {
  margin-bottom: 0;
}

.result-label {
  font-weight: 600;
  min-width: 80px;
  color: var(--text-secondary);
}

.result-text {
  flex: 1;
}

.paiute-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.result-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.result-message.success {
  background: #d4edda;
  color: #155724;
}

.result-message.warning {
  background: #fff3cd;
  color: #856404;
}

body.dark-mode .result-message.success {
  background: #1e3a2f;
  color: #7dd89a;
}

body.dark-mode .result-message.warning {
  background: #3a3520;
  color: #e0c060;
}

.error-message {
  max-width: 600px;
  margin: 0 auto;
  color: var(--error-text);
  background: var(--error-bg);
  padding: 1rem;
  border-radius: 0.25rem;
  text-align: center;
}
</style>

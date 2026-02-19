<template>
  <div class="builder-page">
    <div class="container">
      <div class="page-header">
        <h1>Sentence Builder</h1>
        <p class="subtitle">Build grammatically correct Owens Valley Paiute sentences by selecting components</p>
      </div>

      <div v-if="loading" class="loading">Loading sentence types...</div>

      <template v-else-if="sentenceTypes.length > 0">
        <!-- Sentence Type Tabs -->
        <div class="sentence-type-tabs">
          <button
            v-for="st in sentenceTypes"
            :key="st.sentence_type"
            :class="{ active: activeSentenceType === st.sentence_type }"
            @click="switchSentenceType(st)"
          >
            {{ formatTypeName(st.sentence_type) }}
          </button>
        </div>

        <!-- Builder Grid -->
        <div class="builder-grid" :style="gridStyle">
          <div
            v-for="(propSchema, propKey) in topLevelProperties"
            :key="activeSentenceType + '-' + propKey"
            class="builder-column"
          >
            <h2 class="column-title">{{ formatLabel(propKey) }}</h2>
            <SchemaField
              :modelValue="formData[propKey]"
              @update:modelValue="updateTopLevel(propKey, $event)"
              :schema="resolveSchema(propSchema, activeSchema)"
              :rootSchema="activeSchema"
              :fieldKey="propKey"
              :required="true"
              :depth="0"
            />
          </div>
        </div>

        <!-- Sentence Display -->
        <div class="sentence-section">
          <div v-if="rendered" class="sentence-display">{{ rendered }}</div>
          <div v-else class="sentence-placeholder">
            Your sentence isn't valid yet, please select more words.
          </div>

          <div class="button-row">
            <button @click="loadRandomExample" class="btn btn-secondary" :disabled="examples.length === 0">
              Load Example
            </button>
            <button
              v-if="rendered"
              @click="translateToEnglish"
              class="btn btn-primary"
              :disabled="translating"
            >
              {{ translating ? 'Translating...' : 'Translate to English' }}
            </button>
          </div>

          <div v-if="translation" class="translation-display">
            <strong>English:</strong> {{ translation }}
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
        </div>
      </template>

      <div v-else class="error-message">
        No sentence types found for this language.
      </div>
    </div>
  </div>
</template>

<script>
import SchemaField from '../components/SchemaField.vue'
import { getSentenceTypes, getSentenceExamples, renderSentence, toEnglish } from '../services/api'
import { resolveSchema, buildDefaultValue, formatLabel, formatEnumValue } from '../services/schemaUtils'

export default {
  name: 'Builder',
  components: { SchemaField },
  data() {
    return {
      sentenceTypes: [],
      activeSentenceType: null,
      activeSchema: null,
      formData: {},
      rendered: '',
      renderDebounceTimer: null,
      examples: [],
      translation: null,
      translating: false,
      loading: true,
      error: '',
    }
  },
  computed: {
    topLevelProperties() {
      if (!this.activeSchema?.properties) return {}
      return this.activeSchema.properties
    },
    gridStyle() {
      const count = Object.keys(this.topLevelProperties).length
      return { gridTemplateColumns: `repeat(${count}, 1fr)` }
    },
  },
  async mounted() {
    try {
      this.sentenceTypes = await getSentenceTypes()
      if (this.sentenceTypes.length > 0) {
        await this.switchSentenceType(this.sentenceTypes[0])
      }
    } catch (err) {
      this.error = err.message
    } finally {
      this.loading = false
    }
  },
  methods: {
    resolveSchema,
    formatLabel,
    formatEnumValue,
    formatTypeName(name) {
      // "SubjectVerbSentence" -> "Subject Verb"
      return name
        .replace(/Sentence$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    },
    async switchSentenceType(st) {
      this.activeSentenceType = st.sentence_type
      this.activeSchema = st.json_schema
      this.formData = buildDefaultValue(st.json_schema, st.json_schema)
      this.rendered = ''
      this.translation = null
      this.error = ''
      try {
        const res = await getSentenceExamples(st.sentence_type)
        this.examples = res?.examples || []
      } catch {
        this.examples = []
      }
    },
    updateTopLevel(key, value) {
      this.formData = { ...this.formData, [key]: value }
      this.debouncedRender()
    },
    debouncedRender() {
      clearTimeout(this.renderDebounceTimer)
      this.renderDebounceTimer = setTimeout(() => this.tryRender(), 300)
    },
    async tryRender() {
      try {
        const result = await renderSentence(this.activeSentenceType, this.formData)
        if (result) {
          this.rendered = result.rendered
        } else {
          this.rendered = ''
        }
      } catch {
        this.rendered = ''
      }
    },
    async loadRandomExample() {
      if (this.examples.length === 0) return
      const example = this.examples[Math.floor(Math.random() * this.examples.length)]
      this.formData = { ...example.structured }
      this.translation = null
      await this.tryRender()
    },
    async translateToEnglish() {
      this.translating = true
      this.error = ''
      this.translation = null
      try {
        const result = await toEnglish(this.activeSentenceType, this.formData)
        if (result) {
          this.translation = result.english
        } else {
          this.error = 'Could not translate. Please check all fields are filled.'
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.translating = false
      }
    },
  },
}
</script>

<style scoped>
.builder-page {
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

.loading {
  text-align: center;
  color: var(--text-tertiary);
  padding: 2rem;
}

.sentence-type-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.sentence-type-tabs button {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.25rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.sentence-type-tabs button.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.sentence-type-tabs button:hover:not(.active) {
  background: var(--bg-tertiary);
}

.builder-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .builder-grid {
    grid-template-columns: 1fr !important;
  }
}

.builder-column {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 2px dashed var(--border-secondary);
}

.builder-column:nth-child(1) {
  border-color: #dc3545;
}

.builder-column:nth-child(2) {
  border-color: #007bff;
}

.builder-column:nth-child(3) {
  border-color: #28a745;
}

.builder-column:nth-child(4) {
  border-color: #fd7e14;
}

.column-title {
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 1rem;
}

.sentence-section {
  text-align: center;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
}

.sentence-display {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.sentence-placeholder {
  color: var(--text-tertiary);
  font-style: italic;
  margin-bottom: 1rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
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

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-secondary);
}

.translation-display {
  font-size: 1.25rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.25rem;
  margin-top: 1rem;
}

.error-message {
  color: var(--error-text);
  background: var(--error-bg);
  padding: 1rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
}
</style>

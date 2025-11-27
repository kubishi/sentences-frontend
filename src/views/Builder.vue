<template>
  <div class="builder-page">
    <div class="container">
      <div class="page-header">
        <h1>Sentence Builder</h1>
        <p class="subtitle">Build grammatically correct Owens Valley Paiute sentences by selecting components</p>
      </div>

      <!-- Builder Grid -->
      <div class="builder-grid">
        <!-- Subject Column -->
        <div class="builder-column subject-column">
          <h2 class="column-title">
            Subject
            <button class="help-button" @click="showHelp('subject')" title="Help">?</button>
          </h2>
          <div class="dropdown-group">
            <label>Subject</label>
            <select v-model="selections.subject_noun" @change="updateChoices" :disabled="!choices.subject_noun || Object.keys(choices.subject_noun.choices).length === 0">
              <option value="">Select...</option>
              <option v-for="[key, label] in choices.subject_noun?.choices || []" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="dropdown-group">
            <label>Suffix</label>
            <select v-model="selections.subject_suffix" @change="updateChoices" :disabled="choices.subject_suffix?.requirement === 'disabled'">
              <option value="">Select...</option>
              <option v-for="[key, label] in choices.subject_suffix?.choices || []" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Object Column -->
        <div class="builder-column object-column">
          <h2 class="column-title">
            Object
            <button class="help-button" @click="showHelp('object')" title="Help">?</button>
          </h2>
          <div class="dropdown-group">
            <label>Object</label>
            <select v-model="selections.object_noun" @change="updateChoices" :disabled="choices.object_noun?.requirement === 'disabled'">
              <option value="">Select...</option>
              <option v-for="[key, label] in choices.object_noun?.choices || []" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="dropdown-group">
            <label>Suffix</label>
            <select v-model="selections.object_suffix" @change="updateChoices" :disabled="choices.object_suffix?.requirement === 'disabled'">
              <option value="">Select...</option>
              <option v-for="[key, label] in choices.object_suffix?.choices || []" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Verb Column -->
        <div class="builder-column verb-column">
          <h2 class="column-title">
            Verb
            <button class="help-button" @click="showHelp('verb')" title="Help">?</button>
          </h2>
          <div class="dropdown-row">
            <div class="dropdown-group">
              <label>Pronoun</label>
              <select v-model="selections.object_pronoun" @change="updateChoices" :disabled="choices.object_pronoun?.requirement === 'disabled'">
                <option value="">Select...</option>
                <option v-for="[key, label] in choices.object_pronoun?.choices || []" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="dropdown-group">
              <label>Verb</label>
              <select v-model="selections.verb" @change="updateChoices" :disabled="!choices.verb || Object.keys(choices.verb.choices).length === 0">
                <option value="">Select...</option>
                <option v-for="[key, label] in choices.verb?.choices || []" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="dropdown-group">
              <label>Tense</label>
              <select v-model="selections.verb_tense" @change="updateChoices" :disabled="choices.verb_tense?.requirement === 'disabled'">
                <option value="">Select...</option>
                <option v-for="[key, label] in choices.verb_tense?.choices || []" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentence Display -->
      <div class="sentence-section">
        <div v-if="sentence.length > 0" class="sentence-display">
          <span v-for="(word, index) in sentence" :key="index" :class="'word-' + word.type">
            {{ word.text }}{{ index < sentence.length - 1 ? ' ' : '' }}
          </span>
        </div>
        <div v-else class="sentence-placeholder">
          Your sentence isn't valid yet, please select more words.
        </div>

        <div class="button-row">
          <button v-if="sentence.length === 0" @click="randomize" class="btn btn-secondary" :disabled="loading">
            {{ loading ? 'Loading...' : 'Randomize Choices' }}
          </button>
          <button v-if="sentence.length > 0" @click="translate" class="btn btn-primary" :disabled="translating">
            {{ translating ? 'Translating...' : 'Translate' }}
          </button>
        </div>

        <div v-if="translation" class="translation-display">
          <strong>English:</strong> {{ translation }}
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- Help Modal -->
      <div v-if="helpTopic" class="modal-overlay" @click="helpTopic = null">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="helpTopic = null">&times;</button>
          <div v-if="helpTopic === 'subject'">
            <h3>Subject</h3>
            <p>The <strong>subject</strong> is the doer of the action in a sentence.</p>
            <p>You can choose a noun (like "dog" or "coyote") or a pronoun (like "I" or "he/she").</p>
            <p>The <strong>suffix</strong> indicates proximity:</p>
            <ul>
              <li><strong>-ii</strong> (proximal): the subject is nearby or visible</li>
              <li><strong>-uu</strong> (distal): the subject is far away or not visible</li>
            </ul>
            <p>Pronouns don't need a suffix.</p>
          </div>
          <div v-else-if="helpTopic === 'object'">
            <h3>Object</h3>
            <p>The <strong>object</strong> is the receiver of the action in a sentence.</p>
            <p>Not all sentences need an object - intransitive verbs (like "run" or "sleep") don't take objects.</p>
            <p>The <strong>suffix</strong> indicates proximity:</p>
            <ul>
              <li><strong>-eika</strong> (proximal): the object is nearby or visible</li>
              <li><strong>-oka</strong> (distal): the object is far away or not visible</li>
            </ul>
          </div>
          <div v-else-if="helpTopic === 'verb'">
            <h3>Verb</h3>
            <p>The <strong>verb</strong> describes the action that the subject is taking.</p>
            <p>The <strong>object pronoun</strong> is attached to the verb and must match the object's proximity (proximal or distal).</p>
            <p>The <strong>tense</strong> indicates when the action takes place:</p>
            <ul>
              <li><strong>-ti</strong>: present ongoing (-ing)</li>
              <li><strong>-dü</strong>: present simple</li>
              <li><strong>-ku</strong>: completive (past)</li>
              <li><strong>-wei</strong>: future (will)</li>
              <li><strong>-pü</strong>: have done / am done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getChoices, getRandomSentence, translateBuilder } from '../services/api'

export default {
  name: 'Builder',
  data() {
    return {
      choices: {},
      sentence: [],
      selections: {
        subject_noun: '',
        subject_suffix: '',
        verb: '',
        verb_tense: '',
        object_pronoun: '',
        object_noun: '',
        object_suffix: ''
      },
      translation: '',
      loading: false,
      translating: false,
      error: '',
      helpTopic: null
    }
  },
  async mounted() {
    await this.updateChoices()
  },
  methods: {
    async updateChoices() {
      this.loading = true
      this.error = ''
      this.translation = ''
      try {
        const data = await getChoices(this.selections)
        this.choices = data.choices
        this.sentence = data.sentence || []

        // Sync selections with returned values
        for (const key of Object.keys(this.selections)) {
          if (this.choices[key]) {
            this.selections[key] = this.choices[key].value || ''
          }
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async randomize() {
      this.loading = true
      this.error = ''
      this.translation = ''
      try {
        const data = await getRandomSentence(this.selections)
        this.choices = data.choices
        this.sentence = data.sentence || []

        // Sync selections with returned values
        for (const key of Object.keys(this.selections)) {
          if (this.choices[key]) {
            this.selections[key] = this.choices[key].value || ''
          }
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async translate() {
      this.translating = true
      this.error = ''
      try {
        const data = await translateBuilder(this.selections)
        this.translation = data.translation
      } catch (err) {
        this.error = err.message
      } finally {
        this.translating = false
      }
    },
    showHelp(topic) {
      this.helpTopic = topic
    }
  }
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

.builder-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }
}

.builder-column {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 2px dashed var(--border-secondary);
}

.subject-column {
  border-color: #dc3545;
}

.object-column {
  border-color: #28a745;
}

.verb-column {
  border-color: #007bff;
}

.column-title {
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.help-button {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-button:hover {
  background: var(--bg-tertiary);
}

.dropdown-group {
  margin-bottom: 1rem;
}

.dropdown-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.dropdown-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.25rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.dropdown-group select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .dropdown-row {
    grid-template-columns: 1fr;
  }
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

.word-subject {
  color: #dc3545;
}

.word-object {
  color: #28a745;
}

.word-verb {
  color: #007bff;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-tertiary);
}

.modal-content h3 {
  margin-bottom: 1rem;
}

.modal-content p {
  margin-bottom: 0.75rem;
}

.modal-content ul {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.modal-content li {
  margin-bottom: 0.25rem;
}
</style>

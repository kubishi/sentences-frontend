<template>
  <!-- Enum: dropdown -->
  <div v-if="classification === 'enum'" class="schema-field">
    <label>{{ label }} <InfoButton v-if="resolved.description" :text="resolved.description" /></label>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option value="">Select...</option>
      <option v-for="val in resolved.enum" :key="val" :value="val">
        {{ formatEnumValue(val) }}
      </option>
    </select>
  </div>

  <!-- Boolean: checkbox -->
  <div v-else-if="classification === 'boolean'" class="schema-field schema-field-boolean">
    <label>
      <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
      {{ label }} <InfoButton v-if="resolved.description" :text="resolved.description" />
    </label>
  </div>

  <!-- Union: type picker + fields -->
  <div v-else-if="classification === 'union'" class="schema-field schema-union">
    <div class="union-picker">
      <button
        v-for="v in variants"
        :key="v.name"
        :class="{ active: selectedVariant === v.name }"
        @click="switchVariant(v.name)"
        type="button"
      >
        {{ formatLabel(v.name) }}
      </button>
    </div>
    <div v-if="activeVariantSchema" class="union-fields">
      <!-- Object variant: render child fields -->
      <template v-if="activeVariantSchema.properties">
        <SchemaField
          v-for="(propSchema, propKey) in activeVariantSchema.properties"
          :key="selectedVariant + '-' + propKey"
          :modelValue="(modelValue || {})[propKey]"
          @update:modelValue="updateProperty(propKey, $event)"
          :schema="resolveSchema(propSchema, rootSchema)"
          :rootSchema="rootSchema"
          :fieldKey="propKey"
          :required="(activeVariantSchema.required || []).includes(propKey)"
          :depth="depth + 1"
        />
      </template>
      <!-- Non-object variant (enum, string, etc.): render directly -->
      <template v-else>
        <SchemaField
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :schema="activeVariantSchema"
          :rootSchema="rootSchema"
          :fieldKey="selectedVariant"
          :required="true"
          :depth="depth + 1"
        />
      </template>
    </div>
  </div>

  <!-- Optional: toggle + fields -->
  <div v-else-if="classification === 'optional'" class="schema-field schema-optional">
    <label>
      <input type="checkbox" :checked="modelValue != null" @change="toggleOptional($event.target.checked)" />
      {{ label }} <InfoButton v-if="resolved.description" :text="resolved.description" />
    </label>
    <div v-if="modelValue != null" class="optional-fields">
      <SchemaField
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :schema="nonNullSchema"
        :rootSchema="rootSchema"
        :fieldKey="fieldKey"
        :required="false"
        :depth="depth + 1"
      />
    </div>
  </div>

  <!-- Object: render child fields -->
  <div v-else-if="classification === 'object'" class="schema-field schema-object">
    <SchemaField
      v-for="(propSchema, propKey) in resolved.properties"
      :key="propKey"
      :modelValue="(modelValue || {})[propKey]"
      @update:modelValue="updateProperty(propKey, $event)"
      :schema="resolveSchema(propSchema, rootSchema)"
      :rootSchema="rootSchema"
      :fieldKey="propKey"
      :required="(resolved.required || []).includes(propKey)"
      :depth="depth + 1"
    />
  </div>

  <!-- String: text input (fallback) -->
  <div v-else-if="classification === 'string'" class="schema-field">
    <label>{{ label }} <InfoButton v-if="resolved.description" :text="resolved.description" /></label>
    <input type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script>
import {
  resolveSchema,
  classifySchema,
  getUnionVariants,
  buildDefaultValue,
  detectVariant,
  formatLabel,
  formatEnumValue,
} from '../services/schemaUtils'
import InfoButton from './InfoButton.vue'

export default {
  name: 'SchemaField',
  components: { InfoButton },
  props: {
    modelValue: { default: null },
    schema: { type: Object, required: true },
    rootSchema: { type: Object, required: true },
    fieldKey: { type: String, default: '' },
    required: { type: Boolean, default: false },
    depth: { type: Number, default: 0 },
  },
  emits: ['update:modelValue'],
  computed: {
    resolved() {
      return resolveSchema(this.schema, this.rootSchema) || {}
    },
    classification() {
      return classifySchema(this.schema, this.rootSchema)
    },
    label() {
      return formatLabel(this.fieldKey)
    },
    variants() {
      if (this.classification !== 'union' || !this.resolved.anyOf) return []
      return getUnionVariants(this.resolved.anyOf, this.rootSchema)
    },
    activeVariantSchema() {
      return this.variants.find(v => v.name === this.selectedVariant)?.schema || null
    },
    nonNullSchema() {
      if (!this.resolved.anyOf) return null
      const nonNull = this.resolved.anyOf.filter(item => item.type !== 'null')
      if (nonNull.length === 1) return resolveSchema(nonNull[0], this.rootSchema)
      return null
    },
  },
  data() {
    return {
      selectedVariant: '',
      _userSwitched: false,
    }
  },
  watch: {
    modelValue: {
      handler() {
        if (this.classification === 'union' && this.variants.length > 0) {
          if (this._userSwitched) {
            this._userSwitched = false
            return
          }
          this.selectedVariant = detectVariant(this.modelValue, this.variants)
        }
      },
      immediate: true,
    },
    variants: {
      handler() {
        if (this.variants.length > 0 && !this.selectedVariant) {
          this.selectedVariant = this.variants[0].name
        }
      },
      immediate: true,
    },
  },
  methods: {
    resolveSchema,
    formatLabel,
    formatEnumValue,
    updateProperty(key, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [key]: value })
    },
    switchVariant(variantName) {
      this.selectedVariant = variantName
      const variant = this.variants.find(v => v.name === variantName)
      if (variant) {
        this._userSwitched = true
        this.$emit('update:modelValue', buildDefaultValue(variant.schema, this.rootSchema))
      }
    },
    toggleOptional(checked) {
      if (checked) {
        this.$emit('update:modelValue', buildDefaultValue(this.nonNullSchema, this.rootSchema))
      } else {
        this.$emit('update:modelValue', null)
      }
    },
  },
}
</script>

<style scoped>
.schema-field {
  margin-bottom: 0.75rem;
}

.schema-field label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.schema-field select,
.schema-field input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.25rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
}

.schema-field select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.schema-field-boolean label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.schema-field-boolean input[type="checkbox"] {
  width: auto;
}

.union-picker {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.union-picker button {
  flex: 1;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.25rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all 0.2s;
}

.union-picker button.active {
  background: var(--accent-light);
  color: var(--accent-text);
  border-color: var(--accent-border);
}

.union-picker button:hover:not(.active) {
  background: var(--border-secondary);
}

.schema-optional > label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.schema-optional input[type="checkbox"] {
  width: auto;
}

.optional-fields {
  padding-left: 1rem;
  border-left: 2px solid var(--border-primary);
}
</style>

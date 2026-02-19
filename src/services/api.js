const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LANGUAGE_CODE = import.meta.env.VITE_LANGUAGE_CODE || 'ovp';
const DEFAULT_AGENT = {
  provider: import.meta.env.VITE_DEFAULT_PROVIDER || 'openai',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4o',
  temperature: 0.0
};

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    if (response.status === 422) return null;
    if (response.status === 429) throw new Error('Too many requests. Please try again later.');
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

export async function getSentenceTypes(languageCode = LANGUAGE_CODE) {
  return apiFetch(`${API_BASE}/api/languages/${languageCode}/sentence-types`);
}

export async function getSentenceExamples(sentenceTypeName, languageCode = LANGUAGE_CODE) {
  return apiFetch(`${API_BASE}/api/languages/${languageCode}/sentence-types/${sentenceTypeName}/examples`);
}

export async function renderSentence(sentenceTypeName, data, languageCode = LANGUAGE_CODE) {
  return apiFetch(
    `${API_BASE}/api/languages/${languageCode}/sentence-types/${sentenceTypeName}/render`,
    { method: 'POST', body: JSON.stringify(data) }
  );
}

export async function toEnglish(sentenceTypeName, data, agent = DEFAULT_AGENT, languageCode = LANGUAGE_CODE) {
  return apiFetch(
    `${API_BASE}/api/languages/${languageCode}/sentence-types/${sentenceTypeName}/to-english`,
    { method: 'POST', body: JSON.stringify({ data, agent }) }
  );
}

export async function translatePipeline(text, agent = DEFAULT_AGENT, languageCode = LANGUAGE_CODE) {
  return apiFetch(
    `${API_BASE}/api/translate/pipeline`,
    { method: 'POST', body: JSON.stringify({ text, language_code: languageCode, agent }) }
  );
}

export { LANGUAGE_CODE, DEFAULT_AGENT };

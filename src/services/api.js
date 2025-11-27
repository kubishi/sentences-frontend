const API_BASE = import.meta.env.VITE_API_URL || 'https://api.sentences.kubishi.com';

export async function getChoices(data = {}) {
  const response = await fetch(`${API_BASE}/builder/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to get choices');
  return response.json();
}

export async function getRandomSentence(data = {}) {
  const response = await fetch(`${API_BASE}/builder/random`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to get random sentence');
  return response.json();
}

export async function translateBuilder(data) {
  const response = await fetch(`${API_BASE}/builder/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    throw new Error('Failed to translate');
  }
  return response.json();
}

export async function translateEnglish(english) {
  const response = await fetch(`${API_BASE}/translator/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ english })
  });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    throw new Error('Failed to translate');
  }
  return response.json();
}

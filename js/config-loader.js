export async function loadConfig() {
  // Load config from localStorage only (for public hosting security)
  const stored = localStorage.getItem('leen-demo-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored config:', e);
      return null;
    }
  }
  return null;  // No config found
}

export function saveConfigToStorage(config) {
  localStorage.setItem('leen-demo-config', JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem('leen-demo-config');
}

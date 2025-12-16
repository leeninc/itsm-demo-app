export async function loadConfig() {
  try {
    // Try to import from config.js file (user-created)
    const module = await import('../config.js');
    return module.CONFIG;
  } catch (e) {
    // Fall back to localStorage if file doesn't exist
    const stored = localStorage.getItem('leen-demo-config');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;  // No config found
  }
}

export function saveConfigToStorage(config) {
  localStorage.setItem('leen-demo-config', JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem('leen-demo-config');
}

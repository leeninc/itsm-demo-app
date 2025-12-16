import { loadConfig, saveConfigToStorage } from './config-loader.js';
import { LeenAPIClient } from './api.js';
import { DemoUI } from './ui.js';

let app = null;

async function init() {
  // Try to load configuration
  let config = await loadConfig();

  if (!config || !config.apiKey || !config.connectionId) {
    showConfigurationPanel();
    return;
  }

  // Initialize API client
  const apiClient = new LeenAPIClient(config);

  // Test connection
  showConfigStatus('Testing connection...', 'loading');
  try {
    await apiClient.getProjects({ limit: 1 });
    showConfigStatus('Connected', 'success');
    hideConfigurationPanel();
  } catch (error) {
    showConfigStatus('Connection failed', 'error');
    showConfigurationError(error);
    return;
  }

  // Initialize UI
  app = new DemoUI(apiClient);
  await app.init();
}

function showConfigurationPanel() {
  const panel = document.getElementById('config-panel');
  panel.classList.remove('hidden');
  panel.innerHTML = `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-yellow-900 mb-4">Configuration Required</h2>
        <p class="text-sm text-yellow-700 mb-4">
          To use this demo, you need to configure your API credentials. You can either:
        </p>

        <div class="space-y-4">
          <div class="bg-white rounded-md p-4">
            <h3 class="font-medium text-gray-900 mb-2">Option 1: Configuration File (Recommended)</h3>
            <ol class="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Copy <code class="bg-gray-100 px-1 rounded">config.js.example</code> to <code class="bg-gray-100 px-1 rounded">config.js</code></li>
              <li>Edit the file with your API key and connection ID</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div class="bg-white rounded-md p-4">
            <h3 class="font-medium text-gray-900 mb-2">Option 2: Enter Credentials Here</h3>
            <form id="config-form" class="space-y-3 mt-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input type="text" name="apiKey" required
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  placeholder="Get from https://portal.leen.dev/settings/api-keys">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Connection ID</label>
                <input type="text" name="connectionId" required
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  placeholder="UUID from https://portal.leen.dev/integrations">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
                <input type="text" name="apiBaseUrl"
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  value="https://api.leen.dev"
                  placeholder="https://api.leen.dev or http://localhost:8000">
              </div>
              <button type="submit" class="w-full bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save and Connect
              </button>
            </form>
            <p class="text-xs text-gray-500 mt-2">Credentials will be saved in browser localStorage.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add form submit handler
  document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const config = {
      apiKey: formData.get('apiKey'),
      connectionId: formData.get('connectionId'),
      apiBaseUrl: formData.get('apiBaseUrl') || 'https://api.leen.dev'
    };

    // Save to localStorage
    saveConfigToStorage(config);

    // Try to connect
    showConfigStatus('Testing connection...', 'loading');
    const apiClient = new LeenAPIClient(config);
    try {
      await apiClient.getProjects({ limit: 1 });
      showConfigStatus('Connected', 'success');

      // Reload page to initialize properly
      window.location.reload();
    } catch (error) {
      showConfigStatus('Connection failed', 'error');
      alert(`Connection failed: ${error.message}\n\nPlease check your credentials and try again.`);
    }
  });
}

function hideConfigurationPanel() {
  const panel = document.getElementById('config-panel');
  panel.classList.add('hidden');
  document.getElementById('main-content').classList.remove('hidden');
}

function showConfigurationError(error) {
  const panel = document.getElementById('config-panel');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'max-w-2xl mx-auto px-4 py-4';
  errorDiv.innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-red-900 mb-2">Connection Error</h3>
      <p class="text-sm text-red-700">${error.message}</p>
      <button onclick="location.reload()" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">
        Try Again
      </button>
    </div>
  `;
  panel.appendChild(errorDiv);
}

function showConfigStatus(message, status) {
  const statusDiv = document.getElementById('config-status');
  const classes = {
    loading: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600'
  };

  const icons = {
    loading: '<div class="spinner w-4 h-4"></div>',
    success: '✓',
    error: '✗'
  };

  statusDiv.innerHTML = `
    <div class="flex items-center space-x-2 ${classes[status]}">
      ${icons[status]}
      <span class="text-sm font-medium">${message}</span>
    </div>
  `;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);

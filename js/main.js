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
      <div class="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-sky-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-sky-900">Connect to Leen API</h2>
        </div>
        <p class="text-sm text-sky-700 mb-6">
          Enter your Leen API credentials to get started. Your credentials are stored securely in your browser and never sent to this demo server.
        </p>

        <div class="bg-white rounded-md p-6 shadow-sm">
          <form id="config-form" class="space-y-4">
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
                Connect
              </button>
            </form>

            <div class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-600">
                <strong>Note:</strong> Your credentials are stored only in your browser's localStorage and are never sent to this demo application server.
              </p>
            </div>
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

import { getAllAlertTemplates, getAlertById } from './alerts.js';

export class DemoUI {
  constructor(apiClient) {
    this.api = apiClient;
    this.state = {
      projects: [],
      users: [],
      tickets: [],
      selectedAlert: null,
      activeTab: 'alerts',
      activityLog: [],
      isLoading: false
    };
  }

  async init() {
    this.showLoading(true);
    await Promise.all([
      this.loadProjects(),
      this.loadUsers()
    ]);
    this.setupEventListeners();
    this.switchTab('alerts');
    this.showLoading(false);
  }

  showLoading(show) {
    this.state.isLoading = show;
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.classList.toggle('hidden', !show);
    }
  }

  async loadProjects() {
    try {
      const response = await this.api.getProjects({ limit: 100 });
      this.state.projects = response.items || [];
      this.logActivity('success', `Loaded ${this.state.projects.length} projects`);
    } catch (error) {
      this.logActivity('error', `Failed to load projects: ${error.message}`);
    }
  }

  async loadUsers() {
    try {
      const response = await this.api.getUsers({ limit: 100 });
      this.state.users = response.items || [];
      this.logActivity('success', `Loaded ${this.state.users.length} users`);
    } catch (error) {
      this.logActivity('error', `Failed to load users: ${error.message}`);
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Alert card clicks
    document.addEventListener('click', (e) => {
      const alertCard = e.target.closest('.alert-card');
      if (alertCard) {
        const alertId = alertCard.dataset.alertId;
        this.selectAlert(alertId);
      }
    });

    // Create ticket from alert button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'create-from-alert-btn') {
        this.createTicketFromAlert();
      }
    });

    // Create ticket form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'create-ticket-form') {
        e.preventDefault();
        this.handleCreateTicket();
      }
    });

    // Refresh tickets button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'refresh-tickets-btn') {
        this.loadTickets();
      }
    });
  }

  switchTab(tabName) {
    this.state.activeTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle('border-sky-500', isActive);
      button.classList.toggle('text-sky-600', isActive);
      button.classList.toggle('border-transparent', !isActive);
      button.classList.toggle('text-gray-500', !isActive);
    });

    // Render appropriate content
    const content = document.getElementById('tab-content');
    switch (tabName) {
      case 'alerts':
        content.innerHTML = this.renderAlertsTab();
        break;
      case 'create':
        content.innerHTML = this.renderCreateTab();
        break;
      case 'manage':
        content.innerHTML = this.renderManageTab();
        this.loadTickets();
        break;
      case 'docs':
        content.innerHTML = this.renderDocsTab();
        break;
    }
  }

  renderAlertsTab() {
    const alerts = getAllAlertTemplates();
    return `
      <div class="grid grid-cols-1 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Security Alert Templates</h2>
          <p class="text-gray-600 mb-6">Select a security alert scenario to create an ITSM ticket automatically.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${alerts.map(alert => `
              <div class="alert-card border rounded-lg p-4 cursor-pointer hover:border-sky-500 transition-all" data-alert-id="${alert.id}">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getSeverityBadgeClass(alert.severity)}">
                      ${alert.severity}
                    </span>
                    <span class="ml-2 text-sm text-gray-500">${alert.category}</span>
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${alert.title}</h3>
                <p class="text-sm text-gray-600 line-clamp-2">${alert.description.split('\n')[0]}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="alert-detail" class="bg-white p-6 rounded-lg shadow hidden">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Alert Details</h2>
            <button id="create-from-alert-btn" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Ticket from Alert
            </button>
          </div>
          <div id="alert-detail-content"></div>
        </div>
      </div>
    `;
  }

  renderCreateTab() {
    return `
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Create New ITSM Ticket</h2>

        <form id="create-ticket-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select name="project_id" required class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
              <option value="">Select a project...</option>
              ${this.state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select name="type" required class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
              <option value="">Select type...</option>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" name="name" required class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="Ticket summary">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows="6" class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="Detailed description (supports Markdown)"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
                <option value="">Select priority...</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="INFORMATIONAL">Informational</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigned User</label>
              <select name="assigned_user_id" class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
                <option value="">Select assignee...</option>
                ${this.state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Identifier (optional)</label>
            <input type="text" name="identifier" class="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="Custom identifier (auto-generated if omitted)">
          </div>

          <div class="bg-sky-50 border border-sky-200 rounded-md p-4">
            <h3 class="text-sm font-medium text-sky-900 mb-2">Vendor-First Pattern</h3>
            <p class="text-sm text-sky-700">This will create the ticket in your vendor system (e.g., Jira) first, then store it in the Leen database.</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('create-ticket-form').reset()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Clear Form
            </button>
            <button type="submit" class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm font-medium">
              Create Ticket
            </button>
          </div>
        </form>

        <div id="ticket-result" class="mt-6 hidden"></div>
      </div>
    `;
  }

  renderManageTab() {
    return `
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Manage Tickets</h2>
          <button id="refresh-tickets-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Refresh
          </button>
        </div>

        <div id="tickets-list">
          <div class="flex justify-center py-8">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;
  }

  renderDocsTab() {
    return `
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">API Reference</h2>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Available Endpoints</h3>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">POST</span>
                <code class="text-sm">/v1/itsm/tickets</code>
                <span class="text-sm text-gray-500">- Create a new ticket</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">PATCH</span>
                <code class="text-sm">/v1/itsm/tickets/{id}</code>
                <span class="text-sm text-gray-500">- Update a ticket</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">GET</span>
                <code class="text-sm">/v1/itsm/tickets</code>
                <span class="text-sm text-gray-500">- List all tickets</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">GET</span>
                <code class="text-sm">/v1/itsm/tickets/{id}</code>
                <span class="text-sm text-gray-500">- Get ticket by ID</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">GET</span>
                <code class="text-sm">/v1/itsm/tickets/by-identifier/{identifier}</code>
                <span class="text-sm text-gray-500">- Get ticket by identifier</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Authentication Headers</h3>
            <div class="code-block">
              <pre>X-API-KEY: your-api-key
X-CONNECTION-ID: your-connection-id
Content-Type: application/json</pre>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Example: Create Ticket</h3>
            <div class="code-block">
              <pre>POST /v1/itsm/tickets
{
  "project_id": "uuid-here",
  "type": "Bug",
  "name": "Critical vulnerability detected",
  "description": "Details...",
  "priority": "CRITICAL",
  "assigned_user_id": "uuid-here",
  "identifier": "VULN-CVE-2024-1234"
}</pre>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Example: Get Ticket by Identifier</h3>
            <div class="code-block">
              <pre>GET /v1/itsm/tickets/by-identifier/VULN-CVE-2024-1234

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "identifier": "VULN-CVE-2024-1234",
  "name": "Critical vulnerability detected",
  "type": "Bug",
  "status": "OPEN",
  "priority": "CRITICAL",
  "project_id": "...",
  "url": "https://your-jira.atlassian.net/browse/PROJ-123"
}</pre>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Valid Values</h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>OPEN</li>
                  <li>TODO</li>
                  <li>IN_PROGRESS</li>
                  <li>IN_REVIEW</li>
                  <li>RESOLVED</li>
                  <li>CLOSED</li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>CRITICAL</li>
                  <li>HIGH</li>
                  <li>MEDIUM</li>
                  <li>LOW</li>
                  <li>INFORMATIONAL</li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Type</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>Bug</li>
                  <li>Task</li>
                  <li>Story</li>
                  <li>Epic</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectAlert(alertId) {
    this.state.selectedAlert = getAlertById(alertId);
    const detailDiv = document.getElementById('alert-detail');
    const contentDiv = document.getElementById('alert-detail-content');

    if (this.state.selectedAlert) {
      detailDiv.classList.remove('hidden');
      contentDiv.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getSeverityBadgeClass(this.state.selectedAlert.severity)}">
              ${this.state.selectedAlert.severity}
            </span>
            <span class="text-gray-600">${this.state.selectedAlert.category}</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">${this.state.selectedAlert.title}</h3>
          <div class="prose prose-sm max-w-none text-gray-600">
            ${this.markdownToHtml(this.state.selectedAlert.description)}
          </div>
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Suggested Ticket Details</h4>
            <dl class="grid grid-cols-2 gap-2 text-sm">
              <dt class="text-gray-600">Type:</dt>
              <dd class="font-medium">${this.state.selectedAlert.suggestedType}</dd>
              <dt class="text-gray-600">Priority:</dt>
              <dd class="font-medium">${this.state.selectedAlert.suggestedPriority}</dd>
              <dt class="text-gray-600">Identifier:</dt>
              <dd class="font-medium">${this.state.selectedAlert.identifier}</dd>
            </dl>
          </div>
        </div>
      `;
      detailDiv.scrollIntoView({ behavior: 'smooth' });
    }
  }

  createTicketFromAlert() {
    if (!this.state.selectedAlert) return;

    this.switchTab('create');

    // Pre-fill the form
    setTimeout(() => {
      const form = document.getElementById('create-ticket-form');
      if (form) {
        form.querySelector('[name="type"]').value = this.state.selectedAlert.suggestedType;
        form.querySelector('[name="name"]').value = this.state.selectedAlert.title;
        form.querySelector('[name="description"]').value = this.state.selectedAlert.description;
        form.querySelector('[name="priority"]').value = this.state.selectedAlert.suggestedPriority;
        form.querySelector('[name="identifier"]').value = this.state.selectedAlert.identifier;
      }
    }, 100);
  }

  async handleCreateTicket() {
    const form = document.getElementById('create-ticket-form');
    const formData = new FormData(form);

    const ticketData = {
      project_id: formData.get('project_id'),
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      priority: formData.get('priority') || undefined,
      assigned_user_id: formData.get('assigned_user_id') || undefined,
      identifier: formData.get('identifier') || undefined
    };

    // Remove undefined values
    Object.keys(ticketData).forEach(key =>
      ticketData[key] === undefined && delete ticketData[key]
    );

    try {
      this.showLoading(true);
      const ticket = await this.api.createTicket(ticketData);
      this.logActivity('success', `Created ticket: ${ticket.identifier || ticket.id}`);

      // Show success result
      document.getElementById('ticket-result').innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 class="text-sm font-medium text-green-900 mb-2">Ticket Created Successfully!</h3>
          <dl class="grid grid-cols-2 gap-2 text-sm">
            <dt class="text-green-700">Leen ID:</dt>
            <dd class="font-medium text-green-900">${ticket.id}</dd>
            <dt class="text-green-700">Identifier:</dt>
            <dd class="font-medium text-green-900">${ticket.identifier || 'N/A'}</dd>
            <dt class="text-green-700">Status:</dt>
            <dd class="font-medium text-green-900">${ticket.status}</dd>
            ${ticket.url ? `
              <dt class="text-green-700">Vendor URL:</dt>
              <dd class="font-medium text-green-900"><a href="${ticket.url}" target="_blank" class="underline">View in ${ticket.vendor_attributes?.vendor || 'ITSM'}</a></dd>
            ` : ''}
          </dl>
        </div>
      `;
      document.getElementById('ticket-result').classList.remove('hidden');
      form.reset();
    } catch (error) {
      this.logActivity('error', `Failed to create ticket: ${error.message}`);
      document.getElementById('ticket-result').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 class="text-sm font-medium text-red-900 mb-2">Error Creating Ticket</h3>
          <p class="text-sm text-red-700">${error.message}</p>
        </div>
      `;
      document.getElementById('ticket-result').classList.remove('hidden');
    } finally {
      this.showLoading(false);
    }
  }

  async loadTickets() {
    const listDiv = document.getElementById('tickets-list');
    listDiv.innerHTML = '<div class="flex justify-center py-8"><div class="spinner"></div></div>';

    try {
      const response = await this.api.getTickets({ limit: 20 });
      this.state.tickets = response.items || [];

      if (this.state.tickets.length === 0) {
        listDiv.innerHTML = `
          <div class="text-center py-12">
            <p class="text-gray-500">No tickets found. Create your first ticket!</p>
          </div>
        `;
        return;
      }

      listDiv.innerHTML = `
        <div class="space-y-4">
          ${this.state.tickets.map(ticket => `
            <div class="border rounded-lg p-4 hover:border-sky-500 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-gray-900">${ticket.identifier || ticket.id}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${this.getStatusBadgeClass(ticket.status)}">
                      ${ticket.status}
                    </span>
                    ${ticket.priority ? `
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${this.getPriorityBadgeClass(ticket.priority)}">
                        ${ticket.priority}
                      </span>
                    ` : ''}
                  </div>
                  <h3 class="text-lg font-medium text-gray-900">${ticket.name}</h3>
                </div>
              </div>
              ${ticket.description ? `
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${ticket.description.split('\n')[0]}</p>
              ` : ''}
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Type: ${ticket.type}</span>
                ${ticket.url ? `
                  <a href="${ticket.url}" target="_blank" class="text-sky-600 hover:text-sky-700 underline">View in ${ticket.vendor_attributes?.vendor || 'ITSM'}</a>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      this.logActivity('success', `Loaded ${this.state.tickets.length} tickets`);
    } catch (error) {
      this.logActivity('error', `Failed to load tickets: ${error.message}`);
      listDiv.innerHTML = `
        <div class="text-center py-12">
          <p class="text-red-600">Error loading tickets: ${error.message}</p>
        </div>
      `;
    }
  }

  logActivity(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    this.state.activityLog.unshift({ level, message, timestamp });

    // Keep only last 20 entries
    if (this.state.activityLog.length > 20) {
      this.state.activityLog = this.state.activityLog.slice(0, 20);
    }

    this.renderActivityLog();
  }

  renderActivityLog() {
    const logDiv = document.getElementById('activity-log-content');
    if (!logDiv) return;

    const recentLogs = this.state.activityLog.slice(0, 5);
    logDiv.innerHTML = recentLogs.map(log => `
      <div class="flex items-center space-x-2 text-sm">
        <span class="text-gray-500">${log.timestamp}</span>
        <span class="${log.level === 'error' ? 'text-red-600' : 'text-green-600'}">
          ${log.level === 'error' ? '✗' : '✓'}
        </span>
        <span class="text-gray-700">${log.message}</span>
      </div>
    `).join('');
  }

  getSeverityBadgeClass(severity) {
    const classes = {
      'CRITICAL': 'bg-red-100 text-red-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-blue-100 text-blue-800'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
  }

  getStatusBadgeClass(status) {
    const classes = {
      'OPEN': 'bg-blue-100 text-blue-800',
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'IN_REVIEW': 'bg-purple-100 text-purple-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-600'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityBadgeClass(priority) {
    const classes = {
      'CRITICAL': 'bg-red-100 text-red-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-blue-100 text-blue-800',
      'INFORMATIONAL': 'bg-gray-100 text-gray-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  markdownToHtml(markdown) {
    // Simple markdown conversion
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  }
}

# Leen ITSM Ticket Demo

A standalone demonstration application showcasing Leen's ITSM write endpoints for automated ticket management. This web application demonstrates how to create and manage ITSM tickets programmatically using the Leen API.

## Quick Start

```bash
# 1. Start a web server (REQUIRED - see note below)
python3 -m http.server 8080

# 2. Open http://localhost:8080 in your browser

# 3. Enter your Leen API credentials in the login form
```

> **⚠️ Important:** You MUST run this through a web server (not open index.html directly). Opening the file directly in your browser will cause CORS errors because ES6 modules require HTTP/HTTPS protocol.

## Features

- **Security Alert Automation**: Pre-configured templates for common security scenarios (vulnerabilities, compliance violations, EDR alerts, etc.)
- **Ticket Creation**: Create ITSM tickets programmatically through Leen's unified API
- **Ticket Updates**: Update ticket status, priority, assignee, and other fields
- **Vendor-First Pattern**: Demonstrates how tickets are created in vendor systems (Jira) first, then stored locally
- **Real-Time Activity Log**: Track all API operations with success/failure indicators
- **No Build Process**: Pure HTML/JS/CSS, runs directly in browser

## Project Structure

```
itsm-demo-app/
├── index.html              # Main demo application
├── leen-logo.png          # Leen logo
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── js/
│   ├── config-loader.js   # Configuration loader (localStorage)
│   ├── api.js             # API client wrapper
│   ├── ui.js              # UI rendering and state
│   ├── alerts.js          # Security alert templates
│   └── main.js            # Application entry point
└── css/
    └── demo.css           # Custom styles
```

## Prerequisites

- A Leen API key (get from [Leen Portal](https://portal.leen.dev/settings/api-keys))
- A configured ITSM connection (Jira, ServiceNow, etc.)
- The connection ID for your ITSM integration
- Modern web browser with ES6 module support
- **Python 3, Node.js, or PHP** to run a local web server (required for ES6 modules)

## Setup

### Step 1: Run the Demo

**⚠️ IMPORTANT:** You MUST use a web server. Do NOT open index.html directly in your browser.

Start a local web server:

```bash
# Using Python 3 (most common, usually pre-installed on Mac/Linux)
python3 -m http.server 8080

# Or using Node.js (if you have it installed)
npx http-server -p 8080

# Or using PHP (if you have it installed)
php -S localhost:8080
```

Open your browser to `http://localhost:8080`

**Note:** Use `http://localhost:8080`, NOT `file:///path/to/index.html`

### Step 2: Enter Your Credentials

When you first open the demo, you'll see a login form:

1. Enter your **API Key**
2. Enter your **Connection ID**
3. (Optional) Change the **API Base URL** if using a local development environment
4. Click **Connect**

Your credentials are securely stored in your browser's localStorage only and are never sent to the demo server.

### Step 3: Start Creating Tickets

Once connected, you can start using the demo to create and manage ITSM tickets!

## Usage

### Creating Tickets from Security Alerts

1. Navigate to the **Security Alerts** tab
2. Select an alert template (e.g., "Critical Vulnerability")
3. Review the alert details in the preview card
4. Click "Create Ticket from Alert"
5. Select the target project and assignee
6. Click "Create Ticket"
7. View the created ticket with both Leen ID and vendor ID

### Manual Ticket Creation

1. Navigate to the **Create Ticket** tab
2. Fill in ticket details:
   - **Project**: Select from dropdown (loaded from your ITSM system)
   - **Type**: Bug, Task, Story, Epic, or Sub-task
   - **Title**: Ticket summary
   - **Description**: Detailed description (supports Markdown)
   - **Priority**: CRITICAL, HIGH, MEDIUM, LOW, or INFORMATIONAL
   - **Assigned User**: Select from dropdown
   - **Identifier**: Optional custom identifier (auto-generated if omitted)
3. Click "Create Ticket"
4. View success message with ticket details

### Managing Existing Tickets

1. Navigate to the **Manage Tickets** tab
2. Browse your tickets with their current status
3. Click "Refresh" to reload the ticket list
4. View ticket details including vendor links

### API Reference

Navigate to the **API Reference** tab to see:
- Available endpoints
- Request/response examples
- Authentication headers
- Valid enum values for status, priority, and type

## What Happens During Ticket Creation

The demo demonstrates Leen's **vendor-first pattern**:

1. **Validate Input**: Checks that all required fields are provided
2. **Create in Vendor System**: Calls your ITSM vendor (e.g., Jira) to create the ticket
3. **Store Locally**: If vendor creation succeeds, stores ticket in Leen database
4. **Return Unified Response**: Returns ticket with both Leen ID and vendor attributes
5. **Log Activity**: Records operation in activity log

This pattern ensures your vendor system is always the source of truth, while Leen provides a unified API across all ITSM vendors.

## Use Cases

### 1. CI/CD Pipeline Integration

Automatically create bug tickets when tests fail:

```javascript
// Pseudo-code example
if (testsPassed === false) {
  await leenAPI.createTicket({
    project_id: cicdProjectId,
    type: 'Bug',
    name: `Build #${buildNumber} failed`,
    description: `Test failures:\n${testOutput}`,
    priority: 'HIGH'
  });
}
```

### 2. Security Alert Automation

Create tickets from vulnerability scanner results:

```javascript
// When Tenable finds a critical CVE
const ticket = await leenAPI.createTicket({
  project_id: securityProjectId,
  type: 'Bug',
  name: `Critical CVE: ${cveId}`,
  description: formatVulnerabilityReport(vulnData),
  priority: 'CRITICAL',
  identifier: `VULN-${cveId}`
});
```

### 3. Compliance Tracking

Track remediation of compliance violations:

```javascript
// When CSPM tool finds misconfiguration
await leenAPI.createTicket({
  project_id: complianceProjectId,
  type: 'Task',
  name: `SOC2 Violation: ${controlId}`,
  description: complianceFinding.details,
  priority: 'HIGH'
});
```

### 4. Status Synchronization

Keep internal systems in sync with ITSM:

```javascript
// Update ticket status when remediation completes
await leenAPI.updateTicket(ticketId, {
  status: 'RESOLVED',
  description: 'Vulnerability patched and verified'
});
```

## Troubleshooting

### CORS Error: "Cross origin requests are only supported for protocol schemes..."

**Error message:**
```
Access to script at 'file://...' from origin 'null' has been blocked by CORS policy
```

**Cause:** You're opening `index.html` directly in your browser (file:// protocol) instead of through a web server.

**Solution:** You MUST run the app through a web server:

```bash
# Navigate to the itsm-demo-app directory
cd itsm-demo-app

# Start a web server (choose one):
python3 -m http.server 8080       # Python 3
npx http-server -p 8080            # Node.js
php -S localhost:8080              # PHP

# Then open http://localhost:8080 in your browser
```

ES6 modules (which this app uses) require HTTP/HTTPS protocol and won't work with file:// protocol.

### "Invalid API Key" Error

- Verify your API key is correct in `config.js`
- Check that the key hasn't been revoked in Leen Portal
- Ensure you're using an environment-scoped key, not a user-specific key

### "Connection Not Found" Error

- Verify the connection ID is correct (UUID format)
- Check that the connection exists in Leen Portal
- Ensure the connection hasn't been deleted

### "Project Not Found" Error

- Verify you have projects in your ITSM system
- Check that the connection has synced successfully
- Try refreshing the project list

### "Validation Error: Invalid Priority" Error

Valid priority values are:
- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`
- `INFORMATIONAL`
- `UNKNOWN`

### Network/CORS Errors

- Ensure you're running the demo through a web server (not opening index.html directly)
- Check that `apiBaseUrl` in config is correct (`https://api.leen.dev`)
- Verify your network allows connections to the Leen API

### Empty Dropdowns

If projects or users don't load:
1. Verify your connection has completed at least one sync
2. Try manually fetching:
   ```bash
   curl -H "X-API-KEY: your-key" \
        -H "X-CONNECTION-ID: your-id" \
        https://api.leen.dev/v1/itsm/projects
   ```

## API Documentation

For complete API documentation, visit:
- [Leen API Docs](https://docs.leen.dev/api-reference)
- [ITSM Endpoints](https://docs.leen.dev/api-reference/itsm/supported-connectors)

## Advanced Topics

### Custom Alert Templates

Add your own alert templates by editing `js/alerts.js`:

```javascript
export const ALERT_TEMPLATES = {
  // ... existing templates
  myCustomAlert: {
    id: 'myCustomAlert',
    category: 'Custom Category',
    severity: 'HIGH',
    title: 'My Custom Alert',
    description: 'Alert description with markdown support',
    suggestedType: 'Bug',
    suggestedPriority: 'HIGH',
    identifier: 'CUSTOM-001'
  }
};
```

### Using with Production API

Update `config.js` to point to production:

```javascript
export const CONFIG = {
  apiKey: 'prod-api-key',
  connectionId: 'prod-connection-id',
  apiBaseUrl: 'https://api.leen.dev'
};
```

### Integrating with Your Tools

The demo is a reference implementation. To integrate with your security tools:

1. Use the API client (`js/api.js`) as a starting point
2. Map your tool's alert format to Leen's ticket format
3. Call `createTicket()` when alerts are generated
4. Store ticket IDs to update later with `updateTicket()`

Example webhook handler:

```javascript
// Express.js example
app.post('/webhook/security-alert', async (req, res) => {
  const alert = req.body;

  const ticket = await leenAPI.createTicket({
    project_id: process.env.SECURITY_PROJECT_ID,
    type: 'Bug',
    name: alert.title,
    description: formatAlert(alert),
    priority: mapSeverityToPriority(alert.severity)
  });

  res.json({ success: true, ticketId: ticket.id });
});
```

## Development

### Running Locally

The demo requires no build process. Simply:

1. Start a local web server (see Step 3 in Setup)
2. Navigate to `http://localhost:8080` (or your chosen port)
3. Make changes to HTML/CSS/JS files and refresh to see updates

### File Organization

- **js/alerts.js** - Contains all security alert templates
- **js/api.js** - API client with methods for all ITSM endpoints
- **js/ui.js** - UI rendering logic and state management
- **js/config-loader.js** - Configuration loading (localStorage only)
- **js/main.js** - Application initialization and connection testing

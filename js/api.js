export class LeenAPIClient {
  constructor(config) {
    this.baseUrl = config.apiBaseUrl;
    this.headers = {
      'X-API-KEY': config.apiKey,
      'X-CONNECTION-ID': config.connectionId,
      'Content-Type': 'application/json'
    };
  }

  async getProjects(params = {}) {
    return this._request('GET', '/v1/itsm/projects', null, params);
  }

  async getUsers(params = {}) {
    return this._request('GET', '/v1/itsm/users', null, params);
  }

  async getTickets(params = {}) {
    return this._request('GET', '/v1/itsm/tickets', null, params);
  }

  async getTicket(ticketId) {
    return this._request('GET', `/v1/itsm/tickets/${ticketId}`);
  }

  async getTicketByIdentifier(identifier) {
    return this._request('GET', `/v1/itsm/tickets/by-identifier/${encodeURIComponent(identifier)}`);
  }

  async createTicket(ticketData) {
    return this._request('POST', '/v1/itsm/tickets', ticketData);
  }

  async updateTicket(ticketId, updates) {
    return this._request('PATCH', `/v1/itsm/tickets/${ticketId}`, updates);
  }

  async _request(method, endpoint, body = null, params = {}) {
    const url = new URL(this.baseUrl + endpoint);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const options = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.detail || data.message || 'API request failed',
          data: data
        };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error or server unavailable', data: {} };
    }
  }
}

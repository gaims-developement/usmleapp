class Api {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  async get(endpoint: string, options?: RequestInit) {
    const response = await this.request(endpoint, { ...options, method: 'GET' })
    return response.json()
  }

  async post(endpoint: string, body: unknown, options?: RequestInit) {
    const response = await this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
    return response.json()
  }

  async patch(endpoint: string, body: unknown, options?: RequestInit) {
    const response = await this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) })
    return response.json()
  }

  async delete(endpoint: string, options?: RequestInit) {
    const response = await this.request(endpoint, { ...options, method: 'DELETE' })
    return response.json()
  }
}

export const api = new Api('http://127.0.0.1:5000/api')

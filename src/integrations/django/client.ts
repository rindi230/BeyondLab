// Vite exposes env variables via import.meta.env and requires VITE_ prefix for client-side variables
const API_BASE_URL = (import.meta as any).env?.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  token: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class DjangoClient {
  private token: string | null = null;
  private user: AuthResponse['user'] | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        this.user = null;
      }
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return this.token;
  }

  setUser(user: AuthResponse['user']) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  clearToken() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let text = await response.text();
      try {
        const errorJson = JSON.parse(text);
        throw new Error(JSON.stringify(errorJson));
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      }
    }

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`Invalid JSON response (status ${response.status}): ${text}`);
    }
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let text = await response.text();
      try {
        const errorJson = JSON.parse(text);
        throw new Error(JSON.stringify(errorJson));
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      }
    }

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`Invalid JSON response (status ${response.status}): ${text}`);
    }
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async submitContact(payload: ContactPayload): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contact/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let text = await response.text();
      try {
        const errorJson = JSON.parse(text);
        throw new Error(JSON.stringify(errorJson));
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      }
    }

    try {
      return await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`Invalid JSON response (status ${response.status}): ${text}`);
    }
  }

  async logout(): Promise<void> {
    this.clearToken();
  }
}

export const djangoClient = new DjangoClient();

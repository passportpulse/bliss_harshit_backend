// Update this to your Next.js backend URL
const API_BASE_URL = 'http://localhost:3000/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
};

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, credentials = 'include' } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
    // Include credentials if needed (cookies, HTTP authentication)
    credentials: 'include',
    mode: 'cors', // Ensure CORS mode is enabled
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Example usage:
/*
// GET request
const products = await apiClient('/products');

// POST request
const newProduct = await apiClient('/products', {
  method: 'POST',
  body: { name: 'New Product', price: 99.99 }
});

// With custom headers
const userData = await apiClient('/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
*/

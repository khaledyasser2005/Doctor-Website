const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_BASE_URL = ENV_API_URL ? ENV_API_URL.replace(/\/$/, '') : '/api';
export const TOKEN_STORAGE_KEY = 'khaled_yasser_token';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage quota errors
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = skipAuth ? null : getStoredToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, 'Network connection failed. Please check your internet connection and try again.');
  }

  let payload: { success?: boolean; message?: string; data?: T; errors?: Record<string, string[]> } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallbackMessage =
      response.status === 401
        ? 'Your session has expired or credentials are invalid.'
        : response.status === 403
        ? 'You do not have permission to perform this action.'
        : response.status === 404
        ? 'The requested resource was not found.'
        : response.status === 409
        ? 'A scheduling conflict occurred. Please select another slot.'
        : response.status >= 500
        ? 'A server error occurred. Please try again shortly.'
        : 'Request failed. Please review your input.';

    throw new ApiError(response.status, payload?.message || fallbackMessage, payload?.errors);
  }

  if (payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as unknown as T;
}

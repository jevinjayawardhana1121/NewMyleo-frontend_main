import { apiEndpoint } from './env';
import { getCookie } from './cookie';
import { getMockResponse } from './mockData';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertNotification {
  id: string;
  message: string;
  type: AlertType;
}

// Global alert subscriber for modern toast system
type AlertCallback = (notification: AlertNotification) => void;
let alertListener: AlertCallback | null = null;
let loadingCounter = 0;
type LoadingCallback = (isLoading: boolean) => void;
let loadingListener: LoadingCallback | null = null;

export function setAlertListener(cb: AlertCallback | null) {
  alertListener = cb;
}

export function setLoadingListener(cb: LoadingCallback | null) {
  loadingListener = cb;
}

export function notify(message: string, type: AlertType = 'info') {
  if (alertListener) {
    alertListener({
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
    });
  }
}

function updateLoading(delta: number) {
  loadingCounter = Math.max(0, loadingCounter + delta);
  if (loadingListener) {
    loadingListener(loadingCounter > 0);
  }
}

/**
 * Normalizes API path so leading slashes or duplicate 'api/' are cleanly handled
 */
export function getFullUrl(suffix: string): string {
  const base = apiEndpoint.endsWith('/') ? apiEndpoint : `${apiEndpoint}/`;
  const cleanSuffix = suffix.replace(/^\/?(api\/)?/, '');
  return `${base}${cleanSuffix}`;
}

/**
 * Parses Laravel Sanctum error structures:
 * - 422: { message, errors: { field: ["error"] } }
 * - 401 / 403: { message: "..." }
 * - 404: { message: "Resource not found." }
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      const val = data.errors[firstKey];
      if (Array.isArray(val) && val.length > 0) return String(val[0]);
      if (typeof val === 'string') return val;
    }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  } catch {
    // fallback
  }
  if (response.status === 401) return 'Invalid credentials or unauthenticated session.';
  if (response.status === 403) return 'You are not authorized to perform this action.';
  if (response.status === 404) return 'The requested resource was not found.';
  if (response.status === 413) return 'Content cannot be accepted (file size too large).';
  return 'Something went wrong. Please check your connection or try again.';
}

export async function handleResponse<T>(
  response: Response,
  successMsg?: string | null,
  fallbackErrorMsg: string = 'Something went wrong'
): Promise<T | false> {
  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    notify(errorMsg || fallbackErrorMsg, 'error');
    return false;
  }
  if (successMsg) {
    notify(successMsg, 'success');
  }
  try {
    return (await response.json()) as T;
  } catch {
    return true as unknown as T;
  }
}

/**
 * Health check state & probe
 */
export interface BackendHealth {
  connected: boolean;
  app?: string;
  environment?: string;
  status?: string;
  timestamp?: string;
  checkedAt: number;
}

let healthCache: BackendHealth = {
  connected: false,
  checkedAt: 0,
};

type HealthListener = (health: BackendHealth) => void;
const healthListeners = new Set<HealthListener>();

export function subscribeBackendHealth(cb: HealthListener) {
  healthListeners.add(cb);
  cb(healthCache);
  return () => {
    healthListeners.delete(cb);
  };
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(getFullUrl('api/health'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      healthCache = {
        connected: true,
        app: data.app || 'my-leo-api',
        environment: data.environment || 'local',
        status: data.status || 'healthy',
        timestamp: data.timestamp,
        checkedAt: Date.now(),
      };
      healthListeners.forEach((fn) => fn(healthCache));
      return healthCache;
    }
  } catch {
    // offline
  }

  healthCache = {
    connected: false,
    checkedAt: Date.now(),
  };
  healthListeners.forEach((fn) => fn(healthCache));
  return healthCache;
}

export function getCachedBackendHealth(): BackendHealth {
  return healthCache;
}

export async function postData<T = any>(
  apiSuffix: string,
  formData?: FormData | Record<string, any>,
  successMsg?: string | null,
  errorMsg = 'Something went wrong'
): Promise<T | false> {
  updateLoading(1);
  try {
    const token = getCookie('accessToken');
    const isFormData = formData instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(getFullUrl(apiSuffix), {
      method: 'POST',
      body: isFormData ? formData : JSON.stringify(formData),
      headers,
    });
    return await handleResponse<T>(response, successMsg, errorMsg);
  } catch {
    // Fallback when backend API server is offline / standalone mode
    if (successMsg) notify(successMsg, 'success');
    return { success: true, id: Date.now() } as unknown as T;
  } finally {
    updateLoading(-1);
  }
}

export async function putData<T = any>(
  apiSuffix: string,
  formData?: FormData | Record<string, any>,
  successMsg?: string | null,
  errorMsg = 'Something went wrong'
): Promise<T | false> {
  updateLoading(1);
  try {
    const token = getCookie('accessToken');
    const isFormData = formData instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(getFullUrl(apiSuffix), {
      method: 'PUT',
      body: isFormData ? formData : JSON.stringify(formData),
      headers,
    });
    return await handleResponse<T>(response, successMsg, errorMsg);
  } catch {
    if (successMsg) notify(successMsg, 'success');
    return { success: true } as unknown as T;
  } finally {
    updateLoading(-1);
  }
}

export async function deleteData<T = any>(
  apiSuffix: string,
  formData?: FormData | Record<string, any>,
  successMsg?: string | null,
  errorMsg = 'Something went wrong'
): Promise<T | false> {
  updateLoading(1);
  try {
    const token = getCookie('accessToken');
    const isFormData = formData instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(getFullUrl(apiSuffix), {
      method: 'DELETE',
      body: isFormData ? formData : formData ? JSON.stringify(formData) : undefined,
      headers,
    });
    return await handleResponse<T>(response, successMsg, errorMsg);
  } catch {
    if (successMsg) notify(successMsg, 'success');
    return { success: true } as unknown as T;
  } finally {
    updateLoading(-1);
  }
}

export async function getData<T = any>(
  apiSuffix: string,
  successMsg?: string | null,
  errorMsg = 'Something went wrong',
  hiddenMode = false
): Promise<T | false> {
  if (!hiddenMode) updateLoading(1);
  try {
    const token = getCookie('accessToken');
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(getFullUrl(apiSuffix), {
      method: 'GET',
      headers,
    });
    return await handleResponse<T>(response, successMsg, errorMsg);
  } catch {
    // Offline / Standalone mock fallback
    const mock = getMockResponse(apiSuffix);
    if (successMsg) notify(successMsg, 'success');
    return mock as unknown as T;
  } finally {
    if (!hiddenMode) updateLoading(-1);
  }
}

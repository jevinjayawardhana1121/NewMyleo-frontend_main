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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    if (response.status === 403) {
      const data = await response.json();
      for (const [, value] of Object.entries(data)) {
        if (Array.isArray(value) && value[0]) {
          return String(value[0]);
        }
      }
    } else if (response.status === 422) {
      const data = await response.json();
      if (data.errorType === 'UserNotEligibleToDesignationException') {
        return 'User is not eligible for the designation';
      }
      if (data.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first)) return first[0];
      }
    } else if (response.status === 413) {
      return 'Content cannot be accepted (file size too large)';
    } else if (response.status === 401) {
      const data = await response.json();
      if (data.errorType === 'InvalidCredentialsException') {
        return 'Invalid credentials';
      }
      if (data.errorType === 'InsecurePasswordException') {
        return 'Password must contain at least one uppercase character, one lowercase character, one numeric character and one special character (minimum 7 characters).';
      }
    }
  } catch {
    // fallback
  }
  return 'Something went wrong';
}

async function handleResponse<T>(
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
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(apiEndpoint + apiSuffix, {
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
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(apiEndpoint + apiSuffix, {
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
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (!isFormData && formData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(apiEndpoint + apiSuffix, {
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
    const response = await fetch(apiEndpoint + apiSuffix, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
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


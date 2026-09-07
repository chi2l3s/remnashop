const ROOT = '/api/v1/public';
let refresh;
export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
export async function api(path, { method = 'GET', body, retry = true } = {}) {
  let response;
  try {
    response = await fetch(ROOT + path, {
      method, credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new ApiError('Не удалось связаться с сервером. Проверьте соединение и повторите.', 0); }
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    refresh ??= api('/auth/refresh', { method: 'POST', retry: false }).finally(() => { refresh = null; });
    await refresh;
    return api(path, { method, body, retry: false });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const translations = {
      'Not authenticated': 'Войдите в аккаунт, чтобы продолжить.',
      'Invalid or expired token': 'Сессия завершилась. Войдите снова.',
      'Email must be verified before purchasing or extending a subscription': 'Сначала подтвердите почту в разделе «Профиль».',
      'Trial is not available': 'Пробный период недоступен для этого аккаунта.',
      'Subscription not found': 'Подписка пока не оформлена.',
      'Matching plan for renewal is not available': 'Ваш тариф больше недоступен. Выберите новый.',
    };
    throw new ApiError(response.status >= 500 ? 'Сервер недоступен. Попробуйте позже.' : translations[data?.detail] || (typeof data?.detail === 'string' ? data.detail : 'Не удалось выполнить действие. Проверьте введённые данные.'), response.status);
  }
  return data;
}
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

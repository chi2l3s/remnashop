import type {
  DashboardData,
  PaymentGatewayType,
  PaymentInit,
  SubscriptionInfo,
  SubscriptionOffers,
  UserProfile,
} from "./types";

const API_ROOT = "/api/v1/public";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "Не удалось выполнить запрос";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the friendly fallback for non-JSON proxy errors.
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/auth/me");
}

async function ensureTelegramSession(initData: string): Promise<UserProfile> {
  try {
    return await getProfile();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !initData) throw error;
  }

  await request("/auth/telegram/webapp", {
    method: "POST",
    body: JSON.stringify({ init_data: initData }),
  });
  return getProfile();
}

export async function loadDashboard(initData: string): Promise<DashboardData> {
  const user = await ensureTelegramSession(initData);
  const [subscription, offers] = await Promise.all([
    request<SubscriptionInfo | null>("/subscription/current"),
    request<SubscriptionOffers>("/subscription/offers"),
  ]);
  return { user, subscription, offers };
}

interface PaymentSelection {
  planCode: string;
  durationDays: number;
  gatewayType: PaymentGatewayType;
  isRenewal: boolean;
}

export function createPayment(selection: PaymentSelection): Promise<PaymentInit> {
  const body = selection.isRenewal
    ? {
        duration_days: selection.durationDays,
        gateway_type: selection.gatewayType,
      }
    : {
        plan_code: selection.planCode,
        duration_days: selection.durationDays,
        gateway_type: selection.gatewayType,
      };

  return request<PaymentInit>(
    selection.isRenewal ? "/subscription/extend" : "/subscription/purchase",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

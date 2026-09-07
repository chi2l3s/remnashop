import type { DashboardData } from "./types";

export const demoDashboard: DashboardData = {
  user: {
    telegram_id: 120045678,
    auth_type: "TELEGRAM",
    email: null,
    is_email_verified: false,
    pending_email: null,
    name: "Александр",
    username: "alex",
    language: "ru",
  },
  subscription: {
    user_remna_id: "6e73e188-8707-4b2a-8f1d-5419f32503cd",
    status: "ACTIVE",
    is_trial: false,
    traffic_limit: 300,
    device_limit: 5,
    traffic_limit_strategy: "MONTH",
    expire_at: new Date(Date.now() + 24 * 86_400_000).toISOString(),
    url: "https://example.com/sub/demo-key-a3e5b81c",
    plan_name: "Premium",
    plan_duration_days: 90,
    used_traffic_bytes: 68 * 1024 ** 3,
    lifetime_used_traffic_bytes: 243 * 1024 ** 3,
    online_at: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  offers: {
    gateways: [
      { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽" },
      { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$" },
    ],
    plans: [
      {
        id: 1,
        public_code: "start",
        name: "Start",
        description: "Для одного устройства и повседневных задач",
        traffic_limit: 100,
        device_limit: 1,
        type: "BOTH",
        recommended_purchase_type: "CHANGE",
        durations: [
          {
            days: 30,
            prices: [
              { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽", original_amount: "199", discount_percent: 0, final_amount: "199", is_free: false },
              { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$", original_amount: "2.3", discount_percent: 0, final_amount: "2.3", is_free: false },
            ],
          },
          {
            days: 90,
            prices: [
              { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽", original_amount: "549", discount_percent: 8, final_amount: "505", is_free: false },
              { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$", original_amount: "6.2", discount_percent: 8, final_amount: "5.7", is_free: false },
            ],
          },
        ],
      },
      {
        id: 2,
        public_code: "premium",
        name: "Premium",
        description: "Больше трафика и до пяти устройств",
        traffic_limit: 300,
        device_limit: 5,
        type: "BOTH",
        recommended_purchase_type: "RENEW",
        durations: [
          {
            days: 30,
            prices: [
              { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽", original_amount: "349", discount_percent: 0, final_amount: "349", is_free: false },
              { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$", original_amount: "4", discount_percent: 0, final_amount: "4", is_free: false },
            ],
          },
          {
            days: 90,
            prices: [
              { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽", original_amount: "999", discount_percent: 12, final_amount: "879", is_free: false },
              { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$", original_amount: "11.5", discount_percent: 12, final_amount: "10.1", is_free: false },
            ],
          },
          {
            days: 365,
            prices: [
              { gateway_type: "YOOKASSA", currency: "RUB", currency_symbol: "₽", original_amount: "3490", discount_percent: 20, final_amount: "2792", is_free: false },
              { gateway_type: "CRYPTOMUS", currency: "USD", currency_symbol: "$", original_amount: "40", discount_percent: 20, final_amount: "32", is_free: false },
            ],
          },
        ],
      },
    ],
    has_current_subscription: true,
    current_subscription_status: "ACTIVE",
  },
};

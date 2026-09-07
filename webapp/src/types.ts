export type PaymentGatewayType =
  | "YOOKASSA"
  | "YOOMONEY"
  | "VALUTIX"
  | "CRYPTOMUS"
  | "HELEKET"
  | "CRYPTOPAY"
  | "FREEKASSA"
  | "MULENPAY"
  | "PAYMASTER"
  | "PLATEGA"
  | "ROBOKASSA"
  | "URLPAY"
  | "WATA";

export interface UserProfile {
  telegram_id: number | null;
  auth_type: string;
  email: string | null;
  is_email_verified: boolean;
  pending_email: string | null;
  name: string;
  username: string | null;
  language: string;
}

export interface SubscriptionInfo {
  user_remna_id: string;
  status: string;
  is_trial: boolean;
  traffic_limit: number;
  device_limit: number;
  traffic_limit_strategy: string;
  expire_at: string;
  url: string;
  plan_name: string;
  plan_duration_days: number;
  used_traffic_bytes: number | null;
  lifetime_used_traffic_bytes: number | null;
  online_at: string | null;
}

export interface GatewayOffer {
  gateway_type: PaymentGatewayType;
  currency: string;
  currency_symbol: string;
}

export interface GatewayPrice {
  gateway_type: PaymentGatewayType;
  currency: string;
  currency_symbol: string;
  original_amount: string;
  discount_percent: number;
  final_amount: string;
  is_free: boolean;
}

export interface DurationOffer {
  days: number;
  prices: GatewayPrice[];
}

export interface PlanOffer {
  id: number;
  public_code: string;
  name: string;
  description: string | null;
  traffic_limit: number;
  device_limit: number;
  type: string;
  recommended_purchase_type: "NEW" | "RENEW" | "CHANGE";
  durations: DurationOffer[];
}

export interface SubscriptionOffers {
  gateways: GatewayOffer[];
  plans: PlanOffer[];
  has_current_subscription: boolean;
  current_subscription_status: string | null;
}

export interface DashboardData {
  user: UserProfile;
  subscription: SubscriptionInfo | null;
  offers: SubscriptionOffers;
}

export interface PaymentInit {
  payment_id: string;
  payment_url: string | null;
  purchase_type: string;
  status: string;
  is_free: boolean;
  final_amount: string;
  currency: string;
}

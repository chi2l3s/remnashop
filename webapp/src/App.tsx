import { useEffect, useState, type CSSProperties } from "react";
import { Toaster, toast } from "sonner";

import { ApiError, createPayment, loadDashboard } from "./api";
import { demoDashboard } from "./demo";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  DevicesIcon,
  GaugeIcon,
  LockIcon,
  ShieldIcon,
  SparkIcon,
  WalletIcon,
} from "./icons";
import {
  getTelegramWebApp,
  hapticImpact,
  hapticResult,
  hapticSelection,
  openExternalLink,
} from "./telegram";
import type {
  DashboardData,
  DurationOffer,
  GatewayPrice,
  PaymentGatewayType,
  PlanOffer,
  SubscriptionInfo,
} from "./types";

interface Selection {
  planCode: string;
  durationDays: number;
  gatewayType: PaymentGatewayType;
}

type ViewState =
  | { phase: "loading" }
  | { phase: "ready"; data: DashboardData; demo: boolean }
  | { phase: "error"; message: string };

const GATEWAY_NAMES: Record<string, string> = {
  YOOKASSA: "ЮKassa",
  YOOMONEY: "ЮMoney",
  VALUTIX: "Valutix",
  CRYPTOMUS: "Cryptomus",
  HELEKET: "Heleket",
  CRYPTOPAY: "CryptoPay",
  FREEKASSA: "FreeKassa",
  MULENPAY: "MulenPay",
  PAYMASTER: "PayMaster",
  PLATEGA: "Platega",
  ROBOKASSA: "Robokassa",
  URLPAY: "Быстрый платёж",
  WATA: "WATA",
};

const STATUS_META: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: "Активна", tone: "positive" },
  LIMITED: { label: "Лимит исчерпан", tone: "warning" },
  EXPIRED: { label: "Истекла", tone: "danger" },
  DISABLED: { label: "Приостановлена", tone: "neutral" },
  DELETED: { label: "Неактивна", tone: "neutral" },
};

let dashboardRequest: Promise<DashboardData> | null = null;

function getDashboard(initData: string): Promise<DashboardData> {
  dashboardRequest ??= loadDashboard(initData).finally(() => {
    dashboardRequest = null;
  });
  return dashboardRequest;
}

function initialSelection(plans: PlanOffer[]): Selection | null {
  const plan = plans.find((item) => item.recommended_purchase_type === "RENEW") ?? plans[0];
  const duration = plan?.durations[0];
  const price = duration?.prices[0];
  if (!plan || !duration || !price) return null;
  return {
    planCode: plan.public_code,
    durationDays: duration.days,
    gatewayType: price.gateway_type,
  };
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatCompactDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function daysRemaining(value: string): number {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

function pluralDays(days: number): string {
  const mod100 = days % 100;
  const mod10 = days % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

function durationLabel(days: number): string {
  if (days === 30) return "1 месяц";
  if (days === 90) return "3 месяца";
  if (days === 180) return "6 месяцев";
  if (days === 365) return "1 год";
  return `${days} ${pluralDays(days)}`;
}

function formatTraffic(bytes: number | null): string {
  if (bytes === null) return "—";
  const gigabytes = bytes / 1024 ** 3;
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: gigabytes < 10 ? 1 : 0 }).format(gigabytes)} ГБ`;
}

function planTraffic(plan: PlanOffer): string {
  return plan.traffic_limit > 0 ? `${plan.traffic_limit} ГБ` : "Безлимит";
}

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Сессия Telegram истекла. Закройте приложение и откройте его снова из бота.";
    if (error.status === 403) return "Доступ к аккаунту ограничен. Обратитесь в поддержку.";
    if (error.status >= 500) return "Сервис временно недоступен. Попробуйте ещё раз через минуту.";
    return error.message;
  }
  return "Не удалось связаться с сервером. Проверьте подключение к интернету.";
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function Header({ name }: { name: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "друг";
  const initial = firstName.slice(0, 1).toUpperCase();

  return (
    <header className="topbar entrance entrance-1">
      <div className="brand" aria-label="Remna">
        <span className="brand-mark"><ShieldIcon /></span>
        <span className="brand-name">REMNA</span>
      </div>
      <div className="profile-chip" aria-label={`Профиль: ${firstName}`}>
        <span className="profile-copy">
          <span className="profile-greeting">{greeting()}</span>
          <strong>{firstName}</strong>
        </span>
        <span className="avatar">{initial}</span>
      </div>
    </header>
  );
}

function SubscriptionCard({ subscription }: { subscription: SubscriptionInfo }) {
  const remaining = daysRemaining(subscription.expire_at);
  const status = STATUS_META[subscription.status] ?? STATUS_META.DISABLED;
  const usedGigabytes = (subscription.used_traffic_bytes ?? 0) / 1024 ** 3;
  const trafficRatio = subscription.traffic_limit > 0
    ? Math.min(1, usedGigabytes / subscription.traffic_limit)
    : 0;
  const trafficValue = subscription.traffic_limit > 0
    ? `${formatTraffic(subscription.used_traffic_bytes)} из ${subscription.traffic_limit} ГБ`
    : "Без ограничений";
  const meterStyle = { "--meter-value": trafficRatio } as CSSProperties;

  const handleCopy = async () => {
    try {
      await copyText(subscription.url);
      hapticResult("success");
      toast.success("Ключ скопирован", { description: "Вставьте его в приложение для подключения" });
    } catch {
      hapticResult("error");
      toast.error("Не удалось скопировать ключ");
    }
  };

  return (
    <section className="subscription-card entrance entrance-2" aria-labelledby="subscription-heading">
      <div className="card-orb" aria-hidden="true" />
      <div className="subscription-head">
        <div>
          <span className="eyebrow">Ваша подписка</span>
          <h1 id="subscription-heading">{subscription.plan_name}</h1>
        </div>
        <span className={`status-pill status-${status.tone}`}>
          <i aria-hidden="true" />{status.label}
        </span>
      </div>

      <div className="expiry-block">
        <div className="days-value">
          <strong>{remaining}</strong>
          <span>{pluralDays(remaining)}</span>
        </div>
        <p>до {formatDate(subscription.expire_at)}</p>
      </div>

      <div className="usage-grid">
        <div className="usage-item">
          <span className="usage-icon"><GaugeIcon /></span>
          <span>
            <small>Трафик</small>
            <strong>{trafficValue}</strong>
          </span>
          <span className="mini-meter" style={meterStyle} aria-label={`Использовано ${Math.round(trafficRatio * 100)}%`}>
            <i />
          </span>
        </div>
        <div className="usage-divider" />
        <div className="usage-item">
          <span className="usage-icon"><DevicesIcon /></span>
          <span>
            <small>Устройства</small>
            <strong>до {subscription.device_limit || "∞"}</strong>
          </span>
        </div>
      </div>

      <div className="key-block">
        <div className="key-label">
          <span><LockIcon /> Ключ подписки</span>
          <span className="secure-label"><i /> защищён</span>
        </div>
        <div className="key-field">
          <code>{subscription.url}</code>
          <button type="button" className="icon-button" onClick={handleCopy} aria-label="Скопировать ключ">
            <CopyIcon />
          </button>
        </div>
        <button type="button" className="connect-button" onClick={() => openExternalLink(subscription.url)}>
          <span>Открыть подписку</span>
          <ArrowUpRightIcon />
        </button>
      </div>
    </section>
  );
}

function EmptySubscription() {
  return (
    <section className="empty-card entrance entrance-2" aria-labelledby="subscription-heading">
      <div className="empty-icon"><ShieldIcon /></div>
      <span className="eyebrow">Ваша подписка</span>
      <h1 id="subscription-heading">Пока не активна</h1>
      <p>Выберите подходящий тариф ниже — подключение займёт пару минут.</p>
    </section>
  );
}

function PlanCard({ plan, selected, onSelect }: { plan: PlanOffer; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`plan-card ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="plan-card-top">
        <span className="plan-name">{plan.name}</span>
        <span className="plan-check"><CheckIcon /></span>
      </span>
      <span className="plan-description">{plan.description || "Быстрое и безопасное подключение"}</span>
      <span className="plan-meta">
        <span><GaugeIcon />{planTraffic(plan)}</span>
        <span><DevicesIcon />{plan.device_limit > 0 ? `${plan.device_limit} устр.` : "∞ устр."}</span>
      </span>
    </button>
  );
}

function RenewalSection({
  data,
  demo,
  onDashboardChange,
}: {
  data: DashboardData;
  demo: boolean;
  onDashboardChange: (next: DashboardData) => void;
}) {
  const [selection, setSelection] = useState<Selection | null>(() => initialSelection(data.offers.plans));
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = data.offers.plans.find((plan) => plan.public_code === selection?.planCode) ?? null;
  const selectedDuration = selectedPlan?.durations.find((duration) => duration.days === selection?.durationDays) ?? null;
  const selectedPrice = selectedDuration?.prices.find((price) => price.gateway_type === selection?.gatewayType) ?? null;
  const displayedPlans = [
    ...data.offers.plans.filter((plan) => plan.recommended_purchase_type === "RENEW"),
    ...data.offers.plans.filter((plan) => plan.recommended_purchase_type !== "RENEW"),
  ];
  const renewalStartsAt = selectedPlan?.recommended_purchase_type === "RENEW" && data.subscription
    ? new Date(data.subscription.expire_at).getTime()
    : Date.now();
  const selectedEndDate = new Date(renewalStartsAt + (selection?.durationDays ?? 0) * 86_400_000).toISOString();

  const selectPlan = (plan: PlanOffer) => {
    const duration = plan.durations[0];
    const price = duration?.prices[0];
    if (!duration || !price) return;
    hapticSelection();
    setSelection({
      planCode: plan.public_code,
      durationDays: duration.days,
      gatewayType: price.gateway_type,
    });
  };

  const selectDuration = (duration: DurationOffer) => {
    const preservedGateway = duration.prices.find((price) => price.gateway_type === selection?.gatewayType);
    const gateway = preservedGateway ?? duration.prices[0];
    if (!selection || !gateway) return;
    hapticSelection();
    setSelection({ ...selection, durationDays: duration.days, gatewayType: gateway.gateway_type });
  };

  const selectGateway = (price: GatewayPrice) => {
    if (!selection) return;
    hapticSelection();
    setSelection({ ...selection, gatewayType: price.gateway_type });
  };

  const handleCheckout = async () => {
    if (!selection || !selectedPlan || !selectedPrice || submitting) return;
    hapticImpact();

    if (demo) {
      toast.info("Демо-режим", { description: "В Telegram здесь откроется страница оплаты" });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Создаём платёж…");
    try {
      const payment = await createPayment({
        planCode: selection.planCode,
        durationDays: selection.durationDays,
        gatewayType: selection.gatewayType,
        isRenewal: selectedPlan.recommended_purchase_type === "RENEW",
      });

      hapticResult("success");
      if (payment.payment_url) {
        toast.success("Платёж готов", { id: toastId, description: "Открываем безопасную страницу оплаты" });
        openExternalLink(payment.payment_url);
      } else if (payment.is_free || payment.status === "COMPLETED") {
        toast.success("Подписка активирована", { id: toastId });
        const refreshed = await getDashboard(getTelegramWebApp()?.initData ?? "");
        onDashboardChange(refreshed);
      } else {
        toast.info("Платёж создан", { id: toastId, description: "Проверьте статус в боте" });
      }
    } catch (error) {
      hapticResult("error");
      toast.error("Не удалось создать платёж", { id: toastId, description: friendlyError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selection || !selectedPlan || !selectedDuration || !selectedPrice) {
    return (
      <section className="renewal-section entrance entrance-3">
        <div className="section-heading">
          <div><span className="eyebrow">Тарифы</span><h2>Сейчас нет доступных предложений</h2></div>
        </div>
      </section>
    );
  }

  return (
    <section className="renewal-section entrance entrance-3" aria-labelledby="renewal-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Продление</span>
          <h2 id="renewal-heading">Выберите тариф</h2>
        </div>
        <span className="section-badge"><SparkIcon /> выгоднее надолго</span>
      </div>

      <div className="plans-scroller" role="group" aria-label="Выбор тарифа">
        {displayedPlans.map((plan) => (
          <PlanCard
            key={plan.public_code}
            plan={plan}
            selected={plan.public_code === selection.planCode}
            onSelect={() => selectPlan(plan)}
          />
        ))}
      </div>

      <div className="option-group">
        <div className="option-heading">
          <h3>Срок подписки</h3>
          <span>до {formatCompactDate(selectedEndDate)}</span>
        </div>
        <div className="duration-grid" role="group" aria-label="Срок подписки">
          {selectedPlan.durations.map((duration) => {
            const price = duration.prices.find((item) => item.gateway_type === selection.gatewayType) ?? duration.prices[0];
            return (
              <button
                key={duration.days}
                type="button"
                className={`duration-button ${duration.days === selection.durationDays ? "is-selected" : ""}`}
                onClick={() => selectDuration(duration)}
                aria-pressed={duration.days === selection.durationDays}
              >
                <span>{durationLabel(duration.days)}</span>
                {price ? <small>{price.final_amount} {price.currency_symbol}</small> : null}
                {price?.discount_percent ? <i>−{price.discount_percent}%</i> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="option-group">
        <div className="option-heading"><h3>Способ оплаты</h3><span>безопасно</span></div>
        <div className="gateway-grid" role="group" aria-label="Способ оплаты">
          {selectedDuration.prices.map((price) => (
            <button
              key={price.gateway_type}
              type="button"
              className={`gateway-button ${price.gateway_type === selection.gatewayType ? "is-selected" : ""}`}
              onClick={() => selectGateway(price)}
              aria-pressed={price.gateway_type === selection.gatewayType}
            >
              <span className="gateway-icon"><WalletIcon /></span>
              <span><strong>{GATEWAY_NAMES[price.gateway_type] ?? price.gateway_type}</strong><small>{price.currency}</small></span>
              <span className="gateway-check"><CheckIcon /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="checkout-bar">
        <div className="checkout-total">
          <span>К оплате</span>
          <div>
            {selectedPrice.discount_percent > 0 ? <del>{selectedPrice.original_amount}</del> : null}
            <strong>{selectedPrice.final_amount} {selectedPrice.currency_symbol}</strong>
          </div>
        </div>
        <button type="button" className="checkout-button" onClick={handleCheckout} disabled={submitting}>
          <span>{submitting ? "Подождите…" : selectedPrice.is_free ? "Активировать" : "Продолжить"}</span>
          {submitting ? <i className="spinner" aria-hidden="true" /> : <ChevronRightIcon />}
        </button>
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="app-shell loading-shell" aria-busy="true" aria-label="Загрузка подписки">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-hero" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton-row"><div className="skeleton skeleton-plan" /><div className="skeleton skeleton-plan" /></div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="center-screen">
      <div className="error-card">
        <span className="error-icon"><ShieldIcon /></span>
        <span className="eyebrow">Нет соединения</span>
        <h1>Не удалось открыть кабинет</h1>
        <p>{message}</p>
        <button type="button" className="retry-button" onClick={onRetry}>Попробовать снова</button>
      </div>
    </main>
  );
}

export function App() {
  const [view, setView] = useState<ViewState>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);
  const telegram = getTelegramWebApp();
  const toasterTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setView({ phase: "loading" });

      if (!telegram?.initData) {
        if (import.meta.env.DEV) {
          if (active) setView({ phase: "ready", data: demoDashboard, demo: true });
          return;
        }
        if (active) {
          setView({
            phase: "error",
            message: "Этот кабинет работает внутри Telegram. Откройте его кнопкой в меню бота.",
          });
        }
        return;
      }

      try {
        const data = await getDashboard(telegram.initData);
        if (active) setView({ phase: "ready", data, demo: false });
      } catch (error) {
        if (active) setView({ phase: "error", message: friendlyError(error) });
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, [attempt, telegram]);

  if (view.phase === "loading") return <LoadingScreen />;
  if (view.phase === "error") {
    return <ErrorScreen message={view.message} onRetry={() => setAttempt((value) => value + 1)} />;
  }

  return (
    <div className="app-shell">
      {view.demo ? <div className="demo-banner">Предпросмотр интерфейса · платежи отключены</div> : null}
      <Header name={view.data.user.name} />
      <main>
        {view.data.subscription
          ? <SubscriptionCard subscription={view.data.subscription} />
          : <EmptySubscription />}
        <RenewalSection
          data={view.data}
          demo={view.demo}
          onDashboardChange={(data) => setView({ phase: "ready", data, demo: view.demo })}
        />
      </main>
      <footer className="privacy-note entrance entrance-4">
        <LockIcon /> Вход защищён Telegram
      </footer>
      <Toaster
        theme={toasterTheme}
        position="top-center"
        richColors
        closeButton
        mobileOffset={{ top: "calc(12px + var(--tg-safe-area-inset-top, 0px))" }}
      />
    </div>
  );
}

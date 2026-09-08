import { openExternalLink } from "./telegram";
import {
  BrandMark,
  copyKey,
  dateLabel,
  daysLeft,
  dayWord,
  durationLabel,
  Glyph,
  money,
  PaymentLogo,
  trafficLabel,
  type IconName,
} from "./ui";
import type { DashboardData, PlanOffer, SubscriptionInfo } from "./types";

export type Panel = "guide" | "details" | "help" | null;
export const statuses: Record<string, string> = {
  ACTIVE: "Активна",
  EXPIRED: "Истекла",
  LIMITED: "Лимит исчерпан",
  DISABLED: "Приостановлена",
  DELETED: "Неактивна",
};
function PageHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      {description ? <p className="page-description">{description}</p> : null}
    </div>
  );
}
export function Row({
  icon,
  title,
  subtitle,
  onClick,
  trailing,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onClick: () => void;
  trailing?: string;
}) {
  return (
    <button className="menu-row" onClick={onClick}>
      <span className="row-icon">
        <Glyph name={icon} />
      </span>
      <span className="row-copy">
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      {trailing ? <span className="row-trailing">{trailing}</span> : null}
      <Glyph name="chevron" />
    </button>
  );
}
function MembershipCard({
  subscription,
  onDetails,
}: {
  subscription: SubscriptionInfo;
  onDetails: () => void;
}) {
  const days = daysLeft(subscription.expire_at);
  const unlimited = subscription.plan_duration_days === 0;
  return (
    <button
      className="membership-card"
      onClick={onDetails}
      aria-label="Подробности подписки"
    >
      <div className="membership-top">
        <span className="card-brand">
          <BrandMark /> remna
        </span>
        <span
          className={`status ${subscription.status === "ACTIVE" ? "active" : ""}`}
        >
          <i />
          {statuses[subscription.status] ?? "Неактивна"}
        </span>
      </div>
      <div className="membership-main">
        <div>
          <span className="card-label">Ваш тариф</span>
          <h2>{subscription.plan_name}</h2>
        </div>
        <div className="card-monogram" aria-hidden="true">
          <BrandMark />
        </div>
      </div>
      <div className="membership-bottom">
        <div>
          <strong>
            {unlimited ? "∞" : days}{" "}
            <span>{unlimited ? "без срока" : dayWord(days)}</span>
          </strong>
          <small>
            {unlimited
              ? "Бессрочная подписка"
              : `до ${dateLabel(subscription.expire_at)}`}
          </small>
        </div>
        <span className="card-arrow">
          <Glyph name="external" />
        </span>
      </div>
    </button>
  );
}
export function Overview({
  data,
  onPlan,
  onConnect,
  onPanel,
}: {
  data: DashboardData;
  onPlan: () => void;
  onConnect: () => void;
  onPanel: (panel: Panel) => void;
}) {
  const s = data.subscription;
  const ratio =
    s?.traffic_limit && s.used_traffic_bytes !== null
      ? Math.min(1, s.used_traffic_bytes / (s.traffic_limit * 1024 ** 3))
      : 0;
  return (
    <>
      <PageHeading
        kicker={`Рады видеть, ${data.user.name.split(/\s+/)[0]}`}
        title="Моя подписка"
      />
      {s ? (
        <MembershipCard subscription={s} onDetails={() => onPanel("details")} />
      ) : (
        <div className="no-subscription">
          <BrandMark />
          <h2>Начнём с подключения</h2>
          <p>Выберите тариф, получите ключ и добавьте его в приложение.</p>
        </div>
      )}
      <div className="main-actions">
        <button className="primary-button" onClick={onPlan}>
          {s ? "Продлить подписку" : "Выбрать тариф"}
          <Glyph name="arrow" />
        </button>
        <button
          className="round-button copy-action"
          disabled={!s?.url}
          onClick={() => s && void copyKey(s.url)}
          aria-label="Скопировать ключ"
        >
          <Glyph name="copy" />
        </button>
      </div>
      {s ? (
        <section className="usage-section" aria-label="Использование подписки">
          <div className="section-title">
            <h2>В вашем тарифе</h2>
            <span>{s.is_trial ? "Пробный период" : s.plan_name}</span>
          </div>
          <div className="usage-columns">
            <div>
              <span className="metric-label">Трафик</span>
              <strong>
                {s.used_traffic_bytes === null
                  ? "—"
                  : trafficLabel(s.used_traffic_bytes)}
                <small>
                  {" "}
                  / {s.traffic_limit ? `${s.traffic_limit} ГБ` : "∞"}
                </small>
              </strong>
              <div
                className="traffic-track"
                role="meter"
                aria-label="Использование трафика"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
              >
                <span style={{ transform: `scaleX(${ratio})` }} />
              </div>
            </div>
            <div>
              <span className="metric-label">Устройства</span>
              <strong>
                {s.device_limit || "∞"}
                <small> одновременно</small>
              </strong>
              <p>Один ключ на все</p>
            </div>
          </div>
        </section>
      ) : null}
      <section className="menu-group">
        <Row
          icon="connect"
          title="Подключить устройство"
          subtitle="Ваш ключ и инструкция"
          onClick={onConnect}
        />
        <Row
          icon="help"
          title="Нужна помощь?"
          subtitle="Ответы на частые вопросы"
          onClick={() => onPanel("help")}
        />
      </section>
      <div className="quiet-footer">
        <span className="tiny-mark" />
        <span>Всё для вашего подключения</span>
      </div>
    </>
  );
}
export function Plans({
  data,
  onSelect,
}: {
  data: DashboardData;
  onSelect: (plan: PlanOffer) => void;
}) {
  return (
    <>
      <PageHeading
        kicker="Выберите своё"
        title="Тарифы"
        description="Для одного устройства или сразу для всех ваших близких."
      />
      <div className="plan-list">
        {data.offers.plans.map((plan, index) => {
          const duration = plan.durations.find(
            (item) => item.prices.length > 0,
          );
          const price = duration?.prices[0];
          const current = plan.recommended_purchase_type === "RENEW";
          return (
            <article
              className={`plan ${current ? "current-plan" : ""}`}
              key={plan.public_code}
            >
              <div className="plan-top">
                <span className="plan-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {current ? (
                  <span className="current-label">
                    <i />
                    Ваш тариф
                  </span>
                ) : null}
              </div>
              <h2>{plan.name}</h2>
              <p className="plan-description">
                {plan.description || "Доступ на ваших устройствах"}
              </p>
              <div className="plan-features">
                <span>
                  <Glyph name="connect" />
                  {plan.traffic_limit
                    ? `${plan.traffic_limit} ГБ`
                    : "Безлимитный трафик"}
                </span>
                <span>
                  <Glyph name="phone" />
                  {plan.device_limit
                    ? `До ${plan.device_limit} устройств`
                    : "Без лимита устройств"}
                </span>
              </div>
              <div className="plan-bottom">
                <div>
                  {price && duration ? (
                    <>
                      <strong>{money(price)}</strong>
                      <small>за {durationLabel(duration.days)}</small>
                    </>
                  ) : (
                    <small>Пока недоступен</small>
                  )}
                </div>
                <button
                  className="plan-select"
                  disabled={!price}
                  aria-label={`${current ? "Продлить" : "Выбрать"} ${plan.name}`}
                  onClick={() => onSelect(plan)}
                >
                  <Glyph name="arrow" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!data.offers.plans.length ? (
        <p className="empty-inline">
          Пока нет доступных тарифов. Попробуйте обновить данные в профиле.
        </p>
      ) : null}
      {data.offers.gateways.length ? (
        <div className="accepted-payments">
          <div className="payment-logo-stack">
            {data.offers.gateways.map((g) => (
              <PaymentLogo key={g.gateway_type} type={g.gateway_type} />
            ))}
          </div>
          <span>
            Выберите удобный способ
            <br />
            на следующем шаге
          </span>
        </div>
      ) : null}
    </>
  );
}
export function Connection({
  data,
  onGuide,
  onPlan,
}: {
  data: DashboardData;
  onGuide: () => void;
  onPlan: () => void;
}) {
  const s = data.subscription;
  return (
    <>
      <PageHeading
        kicker="Всего пара шагов"
        title="Подключение"
        description="Один ключ для телефона, ноутбука и других устройств."
      />
      <div className="connection-visual" aria-hidden="true">
        <div className="device-screen">
          <span className="screen-notch" />
          <BrandMark />
          <span className="screen-connected">
            <i />
            remna
          </span>
        </div>
        <div className="device-phone">
          <span />
          <Glyph name="check" />
        </div>
        <div className="visual-caption">Ваши устройства. Вместе.</div>
      </div>
      {s?.url ? (
        <section className="connection-key">
          <div className="section-title">
            <h2>Ключ подписки</h2>
            <span>Личный</span>
          </div>
          <code tabIndex={0}>{s.url}</code>
          <button
            className="primary-button"
            onClick={() => void copyKey(s.url)}
          >
            <Glyph name="copy" />
            Скопировать ключ
          </button>
          <button
            className="secondary-button"
            onClick={() => openExternalLink(s.url)}
          >
            Открыть страницу подключения
            <Glyph name="external" />
          </button>
        </section>
      ) : (
        <div className="empty-inline">
          <p>Ключ появится после активации подписки.</p>
          <button className="primary-button" onClick={onPlan}>
            Выбрать тариф <Glyph name="arrow" />
          </button>
        </div>
      )}
      <section className="menu-group">
        <Row
          icon="phone"
          title="Как настроить приложение"
          subtitle="Инструкция для вашего устройства"
          onClick={onGuide}
        />
      </section>
      <p className="privacy-caption">
        <Glyph name="shield" />
        Не передавайте ключ незнакомым людям
      </p>
    </>
  );
}
export function Profile({
  data,
  theme,
  onTheme,
  onRefresh,
  refreshing,
  onHelp,
}: {
  data: DashboardData;
  theme: "light" | "dark";
  onTheme: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onHelp: () => void;
}) {
  return (
    <>
      <PageHeading kicker="Ваш аккаунт" title="Профиль" />
      <div className="profile-identity">
        <span className="large-avatar">
          {data.user.name.slice(0, 1).toUpperCase()}
        </span>
        <h2>{data.user.name}</h2>
        <p>
          {data.user.username ? `@${data.user.username}` : "Аккаунт Telegram"}
        </p>
      </div>
      <dl className="account-details">
        <div>
          <dt>Telegram ID</dt>
          <dd>{data.user.telegram_id ?? "—"}</dd>
        </div>
        <div>
          <dt>Подписка</dt>
          <dd>{data.subscription?.plan_name ?? "Не подключена"}</dd>
        </div>
        {data.user.email ? (
          <div>
            <dt>Почта</dt>
            <dd>{data.user.email}</dd>
          </div>
        ) : null}
      </dl>
      <section className="menu-group">
        <Row
          icon={theme === "light" ? "sun" : "moon"}
          title="Оформление"
          trailing={theme === "light" ? "Светлое" : "Тёмное"}
          onClick={onTheme}
        />
        <Row
          icon="refresh"
          title={refreshing ? "Обновляем…" : "Обновить данные"}
          onClick={onRefresh}
        />
        <Row icon="help" title="Помощь с подпиской" onClick={onHelp} />
      </section>
      <div className="profile-signature">
        <BrandMark />
        <strong>remna</strong>
        <span>Рядом, где бы вы ни были.</span>
      </div>
    </>
  );
}

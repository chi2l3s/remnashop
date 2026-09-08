import { useRef, useState } from "react";
import { toast } from "sonner";
import { createPayment } from "./api";
import { FamilyDrawer } from "./FamilyDrawer";
import {
  hapticImpact,
  hapticResult,
  hapticSelection,
  openExternalLink,
} from "./telegram";
import {
  dateLabel,
  durationLabel,
  friendlyError,
  gatewayNames,
  Glyph,
  money,
  PaymentLogo,
} from "./ui";
import type {
  DashboardData,
  PaymentGatewayType,
  PaymentInit,
  PlanOffer,
} from "./types";

interface Props {
  plan: PlanOffer;
  data: DashboardData;
  demo: boolean;
  open: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}
const steps = ["Срок подписки", "Способ оплаты", "Всё верно?"];
export function CheckoutDrawer({
  plan,
  data,
  demo,
  open,
  onClose,
  onRefresh,
}: Props) {
  const available = plan.durations.filter(
    (duration) => duration.prices.length > 0,
  );
  const [days, setDays] = useState(available[0]?.days ?? 0);
  const [gateway, setGateway] = useState<PaymentGatewayType | undefined>(
    available[0]?.prices[0]?.gateway_type,
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentInit | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const duration = available.find((item) => item.days === days) ?? available[0];
  const price =
    duration?.prices.find((item) => item.gateway_type === gateway) ??
    duration?.prices[0];
  const renewal = plan.recommended_purchase_type === "RENEW";
  const startsAt =
    renewal && data.subscription
      ? Math.max(Date.now(), new Date(data.subscription.expire_at).getTime())
      : Date.now();
  const endsAt = dateLabel(
    new Date(startsAt + days * 86_400_000).toISOString(),
  );
  const go = (next: number) => {
    hapticSelection();
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setError("");
  };
  const check = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await onRefresh();
      toast("Данные подписки обновлены", {
        description:
          "После подтверждения оплаты новый срок появится на главной.",
      });
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setChecking(false);
    }
  };
  const pay = async () => {
    if (!price || !duration || busy.current || payment) return;
    hapticImpact();
    if (demo) {
      setPayment({
        payment_id: "preview",
        payment_url: null,
        status: "PREVIEW",
        is_free: false,
        final_amount: price.final_amount,
        currency: price.currency_symbol,
        purchase_type: plan.recommended_purchase_type,
      });
      go(3);
      return;
    }
    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      const result = await createPayment({
        planCode: plan.public_code,
        durationDays: duration.days,
        gatewayType: price.gateway_type,
        isRenewal: renewal,
      });
      setPayment(result);
      go(3);
      if (result.status === "COMPLETED") {
        hapticResult("success");
        await onRefresh();
      } else if (result.payment_url) openExternalLink(result.payment_url);
    } catch (err) {
      setError(friendlyError(err));
      hapticResult("error");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };
  return (
    <FamilyDrawer
      open={open}
      busy={submitting}
      onClose={onClose}
      title={
        step < 3
          ? steps[step]
          : payment?.status === "COMPLETED"
            ? "Готово"
            : demo
              ? "Предпросмотр оплаты"
              : "Платёж создан"
      }
      description={step < 3 ? `${plan.name} · шаг ${step + 1} из 3` : plan.name}
      pageKey={String(step)}
      direction={direction}
      onBack={
        step > 0 && step < 3 && !submitting ? () => go(step - 1) : undefined
      }
    >
      {step < 3 ? (
        <div className="step-indicator" aria-label={`Шаг ${step + 1} из 3`}>
          {steps.map((label, index) => (
            <span key={label} className={index <= step ? "filled" : ""} />
          ))}
        </div>
      ) : null}
      {!duration || !price ? (
        <div className="empty-inline">
          Для этого тарифа пока нет способов оплаты.
        </div>
      ) : (
        <>
          {step === 0 ? (
            <>
              <p className="sheet-lead">Сколько времени вам нужно?</p>
              <div
                className="choice-list"
                role="group"
                aria-label="Срок подписки"
              >
                {available.map((item) => {
                  const shown =
                    item.prices.find((p) => p.gateway_type === gateway) ??
                    item.prices[0];
                  return (
                    <button
                      className={`choice-row ${days === item.days ? "selected" : ""}`}
                      key={item.days}
                      aria-pressed={days === item.days}
                      onClick={() => {
                        setDays(item.days);
                        setGateway(shown.gateway_type);
                        hapticSelection();
                      }}
                    >
                      <span className="selection-dot">
                        {days === item.days ? <Glyph name="check" /> : null}
                      </span>
                      <span className="row-copy">
                        <strong>{durationLabel(item.days)}</strong>
                        <small>
                          {item.days === 0
                            ? "Без ограничения срока"
                            : `${item.days} дней доступа`}
                        </small>
                      </span>
                      <span className="choice-price">
                        <strong>{money(shown)}</strong>
                        {shown.discount_percent > 0 ? (
                          <small className="discount">
                            −{shown.discount_percent}%
                          </small>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="sheet-note">
                {renewal
                  ? "Добавим срок к действующей подписке."
                  : "Срок начнётся после активации."}
              </p>
              <button className="primary-button" onClick={() => go(1)}>
                Выбрать оплату <Glyph name="arrow" />
              </button>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p className="sheet-lead">Как вам удобнее оплатить?</p>
              <div
                className="choice-list"
                role="group"
                aria-label="Способ оплаты"
              >
                {duration.prices.map((item) => (
                  <button
                    key={item.gateway_type}
                    className={`choice-row payment-choice ${item.gateway_type === price.gateway_type ? "selected" : ""}`}
                    aria-pressed={item.gateway_type === price.gateway_type}
                    onClick={() => {
                      setGateway(item.gateway_type);
                      hapticSelection();
                    }}
                  >
                    <PaymentLogo type={item.gateway_type} />
                    <span className="row-copy">
                      <strong>{gatewayNames[item.gateway_type]}</strong>
                      <small>
                        {item.currency} · {money(item)}
                      </small>
                    </span>
                    <span className="selection-dot">
                      {item.gateway_type === price.gateway_type ? (
                        <Glyph name="check" />
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
              <p className="sheet-note">
                Оплата откроется на странице выбранного сервиса.
              </p>
              <button className="primary-button" onClick={() => go(2)}>
                Продолжить <Glyph name="arrow" />
              </button>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <div className="order-summary">
                <span>{renewal ? "Продление подписки" : "Подписка"}</span>
                <strong>{plan.name}</strong>
                <p>
                  {durationLabel(days)} · {plan.device_limit || "∞"} устройств
                </p>
              </div>
              <dl className="details-list">
                <div>
                  <dt>Срок</dt>
                  <dd>{durationLabel(days)}</dd>
                </div>
                <div>
                  <dt>Действует до</dt>
                  <dd>{days === 0 ? "Без ограничения" : endsAt}</dd>
                </div>
                <div>
                  <dt>Оплата через</dt>
                  <dd>
                    <PaymentLogo type={price.gateway_type} />
                    {gatewayNames[price.gateway_type]}
                  </dd>
                </div>
                {price.discount_percent > 0 ? (
                  <div>
                    <dt>Ваша скидка</dt>
                    <dd className="accent-text">{price.discount_percent}%</dd>
                  </div>
                ) : null}
              </dl>
              {plan.recommended_purchase_type === "CHANGE" ? (
                <p className="inline-notice">
                  Это смена тарифа: после оплаты действующая подписка будет
                  заменена выбранной.
                </p>
              ) : null}
              <div className="order-total">
                <span>Итого</span>
                <strong>{money(price)}</strong>
              </div>
              {error ? (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                className="primary-button"
                disabled={submitting}
                onClick={() => void pay()}
              >
                {submitting ? (
                  <>
                    <span className="spinner" /> Создаём платёж
                  </>
                ) : (
                  <>
                    {price.is_free
                      ? "Активировать"
                      : `Оплатить ${money(price)}`}
                    <Glyph name="arrow" />
                  </>
                )}
              </button>
              <p className="sheet-note">
                {price.is_free
                  ? "Платёжные данные не потребуются"
                  : "Вы подтверждаете только этот платёж"}
              </p>
            </>
          ) : null}
          {step === 3 && payment ? (
            <div className="payment-result">
              <span
                className={`result-icon ${payment.status === "COMPLETED" ? "result-success" : ""}`}
              >
                <Glyph
                  name={payment.status === "COMPLETED" ? "check" : "external"}
                />
              </span>
              <h3>
                {demo
                  ? "Всё готово к оплате"
                  : payment.status === "COMPLETED"
                    ? "Подписка активирована"
                    : "Завершите оплату"}
              </h3>
              <p>
                {demo
                  ? "Это демонстрация. В Telegram здесь откроется страница платёжного сервиса."
                  : payment.status === "COMPLETED"
                    ? "Актуальный срок доступен в разделе «Подписка»."
                    : "После подтверждения платёжным сервисом подписка обновится автоматически."}
              </p>
              {payment.payment_url ? (
                <button
                  className="primary-button"
                  onClick={() => openExternalLink(payment.payment_url!)}
                >
                  Открыть оплату <Glyph name="external" />
                </button>
              ) : null}
              {!demo && payment.status !== "COMPLETED" ? (
                <button
                  className="secondary-button"
                  disabled={checking}
                  onClick={() => void check()}
                >
                  {checking ? "Обновляем…" : "Обновить подписку"}
                  <Glyph name="refresh" />
                </button>
              ) : null}
              <button className="text-button" onClick={onClose}>
                Вернуться в приложение
              </button>
            </div>
          ) : null}
        </>
      )}
    </FamilyDrawer>
  );
}

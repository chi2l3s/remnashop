import { useState } from "react";
import { FamilyDrawer } from "./FamilyDrawer";
import { Row, statuses, type Panel } from "./pages";
import { hapticSelection, openExternalLink } from "./telegram";
import { BrandMark, copyKey, dateLabel, Glyph, trafficLabel } from "./ui";
import type { DashboardData } from "./types";

const platforms = ["iPhone / iPad", "Android", "Windows", "macOS"];
export function InfoDrawer({
  panel,
  data,
  open,
  onClose,
}: {
  panel: Panel;
  data: DashboardData;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState(platforms[0]);
  const [direction, setDirection] = useState(1);
  const go = (value: number) => {
    setDirection(value > step ? 1 : -1);
    setStep(value);
    hapticSelection();
  };
  const s = data.subscription;
  const titles =
    panel === "guide"
      ? ["Ваше устройство", "Установите приложение", "Добавьте подписку"]
      : panel === "help"
        ? ["Чем помочь?", "Подключение", "Продление", "Ключ подписки"]
        : ["Ваша подписка"];
  return (
    <FamilyDrawer
      open={open}
      onClose={onClose}
      title={titles[step] ?? titles[0]}
      description={
        panel === "guide" ? `${platform} · ${step + 1} из 3` : "remna"
      }
      pageKey={`${panel}-${step}`}
      direction={direction}
      onBack={step > 0 ? () => go(panel === "help" ? 0 : step - 1) : undefined}
    >
      {panel === "details" && s ? (
        <>
          <div className="detail-plan">
            <BrandMark />
            <h3>{s.plan_name}</h3>
            <span>{statuses[s.status] ?? s.status}</span>
          </div>
          <dl className="details-list">
            <div>
              <dt>Действует до</dt>
              <dd>
                {s.plan_duration_days === 0
                  ? "Без ограничения"
                  : dateLabel(s.expire_at)}
              </dd>
            </div>
            <div>
              <dt>Трафик</dt>
              <dd>{s.traffic_limit ? `${s.traffic_limit} ГБ` : "Безлимит"}</dd>
            </div>
            <div>
              <dt>Устройства</dt>
              <dd>{s.device_limit || "Без лимита"}</dd>
            </div>
            <div>
              <dt>Использовано</dt>
              <dd>{trafficLabel(s.used_traffic_bytes)}</dd>
            </div>
          </dl>
          <button className="primary-button" onClick={onClose}>
            Понятно <Glyph name="check" />
          </button>
        </>
      ) : null}
      {panel === "guide" && step === 0 ? (
        <>
          <p className="sheet-lead">Где будем подключаться?</p>
          <div className="choice-list">
            {platforms.map((name, index) => (
              <button
                key={name}
                className={`choice-row ${platform === name ? "selected" : ""}`}
                aria-pressed={platform === name}
                onClick={() => {
                  setPlatform(name);
                  hapticSelection();
                }}
              >
                <span className="row-icon">
                  <Glyph name={index < 2 ? "phone" : "desktop"} />
                </span>
                <span className="row-copy">
                  <strong>{name}</strong>
                </span>
                <span className="selection-dot">
                  {platform === name ? <Glyph name="check" /> : null}
                </span>
              </button>
            ))}
          </div>
          <button className="primary-button" onClick={() => go(1)}>
            Продолжить
            <Glyph name="arrow" />
          </button>
        </>
      ) : null}
      {panel === "guide" && step === 1 ? (
        <>
          <span className="guide-number">01</span>
          <h3 className="guide-title">Приложение для {platform}</h3>
          <p className="guide-copy">
            На странице подключения выберите {platform} и установите одно из
            предложенных приложений. Ссылки для вашей подписки собраны там.
          </p>
          {s?.url ? (
            <button
              className="secondary-button"
              onClick={() => openExternalLink(s.url)}
            >
              Открыть инструкцию
              <Glyph name="external" />
            </button>
          ) : (
            <p className="inline-notice">
              Сначала подключите подписку — в ней появится ссылка на установку.
            </p>
          )}
          <button className="primary-button" onClick={() => go(2)}>
            Приложение установлено
            <Glyph name="arrow" />
          </button>
        </>
      ) : null}
      {panel === "guide" && step === 2 ? (
        <>
          <span className="guide-number">02</span>
          <h3 className="guide-title">Осталось добавить ключ</h3>
          <ol className="instruction-list">
            <li>Скопируйте ключ подписки.</li>
            <li>
              Откройте установленное приложение и выберите импорт из буфера
              обмена.
            </li>
            <li>Выберите сервер и включите подключение.</li>
          </ol>
          {s?.url ? (
            <button
              className="primary-button"
              onClick={() => void copyKey(s.url)}
            >
              Скопировать ключ
              <Glyph name="copy" />
            </button>
          ) : null}
          <button className="text-button" onClick={onClose}>
            Готово, спасибо
          </button>
        </>
      ) : null}
      {panel === "help" && step === 0 ? (
        <div className="help-menu">
          <Row
            icon="connect"
            title="Не получается подключиться"
            onClick={() => go(1)}
          />
          <Row
            icon="receipt"
            title="Как работает продление"
            onClick={() => go(2)}
          />
          <Row icon="copy" title="Где найти ключ" onClick={() => go(3)} />
          <p className="sheet-note">
            Если вопрос остался, откройте поддержку в меню бота.
          </p>
        </div>
      ) : null}
      {panel === "help" && step > 0 ? (
        <>
          <div className="help-illustration">
            <Glyph
              name={step === 1 ? "connect" : step === 2 ? "receipt" : "copy"}
            />
          </div>
          <p className="guide-copy">
            {step === 1
              ? "Проверьте, что подписка активна и трафик не закончился. Обновите подписку в VPN-приложении, выберите другой сервер и подключитесь снова."
              : step === 2
                ? "Выберите свой тариф и нужный срок. После подтверждения оплаты время добавится к действующей подписке. Если срок уже истёк, новый период начнётся с момента активации. Смена тарифа заменяет текущую подписку."
                : "Ключ находится в разделе «Подключение». Нажмите «Скопировать ключ» и импортируйте его в своё VPN-приложение. Он подходит для всех устройств в пределах лимита тарифа."}
          </p>
          <button className="primary-button" onClick={() => go(0)}>
            К другим вопросам
            <Glyph name="back" />
          </button>
        </>
      ) : null}
    </FamilyDrawer>
  );
}

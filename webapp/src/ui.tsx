import type { ReactNode } from "react";
import { toast } from "sonner";
import { ApiError } from "./api";
import { hapticResult } from "./telegram";
import type { GatewayPrice, PaymentGatewayType } from "./types";

export type IconName =
  | "home"
  | "grid"
  | "connect"
  | "user"
  | "arrow"
  | "back"
  | "close"
  | "copy"
  | "check"
  | "external"
  | "refresh"
  | "phone"
  | "desktop"
  | "help"
  | "sun"
  | "moon"
  | "shield"
  | "receipt"
  | "chevron";
const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  connect: (
    <>
      <path d="m9 15 6-6m-9 3-2 2a4.2 4.2 0 0 0 6 6l2-2m0-12 2-2a4.2 4.2 0 0 1 6 6l-2 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="3" />
      <path d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
  external: <path d="M8 5h11v11M19 5 5 19" />,
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.3 6.3A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.7 5.7" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 18h4" />
    </>
  ),
  desktop: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="3" />
      <path d="M8 21h8m-4-4v4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8C12.5 11.8 12 12 12 14m0 3h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.6 13A9 9 0 0 1 11 3.4 9 9 0 1 0 20.6 13Z" />,
  shield: (
    <>
      <path d="M12 2 4 6v6c0 5 8 10 8 10s8-5 8-10V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2zM9 9h6m-6 4h4" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
};
export function Glyph({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 5c8 0 15 7 15 15H20V5Zm0 30C12 35 5 28 5 20h15v15ZM5 20C5 12 12 5 20 5v15H5Zm30 0c0 8-7 15-15 15V20h15Z"
        fill="currentColor"
      />
      <circle cx="20" cy="20" r="6" fill="var(--logo-cutout, var(--bg))" />
    </svg>
  );
}
export const dayWord = (days: number) =>
  days % 100 >= 11 && days % 100 <= 14
    ? "дней"
    : days % 10 === 1
      ? "день"
      : days % 10 >= 2 && days % 10 <= 4
        ? "дня"
        : "дней";
export const daysLeft = (date: string) =>
  Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
export const durationLabel = (days: number) =>
  ({
    0: "Бессрочно",
    30: "1 месяц",
    90: "3 месяца",
    180: "6 месяцев",
    365: "1 год",
  })[days] ?? `${days} ${dayWord(days)}`;
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
export const trafficLabel = (bytes: number | null) =>
  bytes === null
    ? "Нет данных"
    : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(bytes / 1024 ** 3)} ГБ`;
export const money = (price: GatewayPrice) =>
  `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number(price.final_amount))} ${price.currency_symbol}`;
export const gatewayNames: Record<PaymentGatewayType, string> = {
  YOOKASSA: "ЮKassa",
  YOOMONEY: "ЮMoney",
  VALUTIX: "Valutix",
  CRYPTOMUS: "Cryptomus",
  HELEKET: "Heleket",
  CRYPTOPAY: "Crypto Pay",
  FREEKASSA: "FreeKassa",
  MULENPAY: "MulenPay",
  PAYMASTER: "PayMaster",
  PLATEGA: "Platega",
  ROBOKASSA: "Robokassa",
  URLPAY: "Онлайн-оплата",
  WATA: "WATA",
};
export const gatewayAssets: Partial<Record<PaymentGatewayType, string>> = {
  YOOKASSA: "yookassa.png",
  YOOMONEY: "yoomoney.png",
  CRYPTOMUS: "cryptomus.ico",
  PLATEGA: "platega.ico",
  WATA: "wata.ico",
  ROBOKASSA: "robokassa.ico",
};
export function PaymentLogo({ type }: { type: PaymentGatewayType }) {
  const asset = gatewayAssets[type];
  return (
    <span className="payment-logo">
      {asset ? (
        <img
          src={`/payments/${asset}`}
          alt=""
          width="30"
          height="30"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement?.classList.add("logo-failed");
          }}
        />
      ) : (
        <Glyph name="receipt" />
      )}
      <span className="logo-fallback">{gatewayNames[type].slice(0, 1)}</span>
    </span>
  );
}
export function friendlyError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Откройте приложение заново из меню бота — сессия закончилась.";
    if (error.status === 403)
      return "Доступ ограничен. Обратитесь в поддержку через бота.";
    if (error.status >= 500)
      return "Сервис временно недоступен. Попробуйте чуть позже.";
    return error.message;
  }
  return "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.";
}
export async function copyKey(value: string) {
  try {
    if (navigator.clipboard?.writeText)
      await navigator.clipboard.writeText(value);
    else {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.cssText = "position:fixed;opacity:0";
      document.body.append(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      if (!copied) throw new Error("Clipboard unavailable");
    }
    hapticResult("success");
    toast.success("Ключ скопирован");
  } catch {
    toast.error(
      "Не удалось скопировать. Нажмите и удерживайте ключ, чтобы выделить его.",
    );
  }
}

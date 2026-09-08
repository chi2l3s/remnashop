export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramHaptics {
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
  notificationOccurred(type: "error" | "success" | "warning"): void;
  selectionChanged(): void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser };
  colorScheme: "light" | "dark";
  ready(): void;
  expand(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  HapticFeedback?: TelegramHaptics;
  BackButton?: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function prepareTelegramWebApp(): TelegramWebApp | null {
  const app = getTelegramWebApp();
  let theme: "light" | "dark" =
    app?.initData && app.colorScheme === "dark" ? "dark" : "light";
  try {
    const saved = localStorage.getItem("remna-theme-v1");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch {
    /* Private WebViews may disable storage. */
  }
  applyTheme(theme);

  if (!app) return null;
  if (!app.initData) return app;

  app.ready();
  app.expand();
  return app;
}

export function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.dataset.theme = theme;
  const color = theme === "light" ? "#f6f5f2" : "#171817";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
  const app = getTelegramWebApp();
  if (app?.initData) {
    try {
      app.setHeaderColor(color);
      app.setBackgroundColor(color);
    } catch {
      /* Older clients. */
    }
  }
}

export function hapticSelection(): void {
  const app = getTelegramWebApp();
  if (app?.initData) app.HapticFeedback?.selectionChanged();
}

export function hapticImpact(): void {
  const app = getTelegramWebApp();
  if (app?.initData) app.HapticFeedback?.impactOccurred("light");
}

export function hapticResult(type: "success" | "error" | "warning"): void {
  const app = getTelegramWebApp();
  if (app?.initData) app.HapticFeedback?.notificationOccurred(type);
}

export function openExternalLink(url: string): void {
  const app = getTelegramWebApp();
  if (app?.initData) {
    app.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

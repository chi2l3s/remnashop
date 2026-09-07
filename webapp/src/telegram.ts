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
  const theme = app?.colorScheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;

  if (!app) return null;
  if (!app.initData) return app;

  app.ready();
  app.expand();
  try {
    app.setHeaderColor(theme === "light" ? "#f2f5f3" : "#080d17");
    app.setBackgroundColor(theme === "light" ? "#f2f5f3" : "#080d17");
  } catch {
    // Older Telegram clients may not support programmatic colors.
  }
  return app;
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

import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { loadDashboard } from "./api";
import { CheckoutDrawer } from "./CheckoutDrawer";
import { InfoDrawer } from "./InfoDrawer";
import { Overview, Plans, Connection, Profile, type Panel } from "./pages";
import { demoDashboard } from "./demo";
import { getTelegramWebApp, hapticSelection, applyTheme } from "./telegram";
import { BrandMark, friendlyError, Glyph } from "./ui";
import type { DashboardData, PlanOffer } from "./types";

const tabs = [
  { id: "subscription", label: "Подписка", icon: "home" },
  { id: "plans", label: "Тарифы", icon: "grid" },
  { id: "connect", label: "Подключение", icon: "connect" },
  { id: "profile", label: "Профиль", icon: "user" },
] as const;
type Tab = (typeof tabs)[number]["id"];
type View =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; data: DashboardData; demo: boolean };
let inflight: Promise<DashboardData> | null = null;
function getDashboard(initData: string) {
  inflight ??= loadDashboard(initData).finally(() => {
    inflight = null;
  });
  return inflight;
}
function currentTab(): Tab {
  const hash = window.location.hash.slice(1);
  return tabs.some((tab) => tab.id === hash) ? (hash as Tab) : "subscription";
}
export function App() {
  const [view, setView] = useState<View>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>(currentTab);
  const [selectedPlan, setSelectedPlan] = useState<PlanOffer | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSession, setPanelSession] = useState(0);
  const [checkoutSession, setCheckoutSession] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [refreshing, setRefreshing] = useState(false);
  const refreshBusy = useRef(false);
  const initData = getTelegramWebApp()?.initData ?? "";
  useEffect(() => {
    let active = true;
    setView({ phase: "loading" });
    if (!initData) {
      setView(
        import.meta.env.DEV
          ? { phase: "ready", data: demoDashboard, demo: true }
          : {
              phase: "error",
              message:
                "Откройте приложение кнопкой «Личный кабинет» в меню Telegram-бота.",
            },
      );
      return;
    }
    getDashboard(initData)
      .then((data) => {
        if (active) setView({ phase: "ready", data, demo: false });
      })
      .catch((error) => {
        if (active) setView({ phase: "error", message: friendlyError(error) });
      });
    return () => {
      active = false;
    };
  }, [attempt, initData]);
  useEffect(() => {
    const change = () => {
      setTab(currentTab());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const navigate = (next: Tab) => {
    if (next !== tab) {
      hapticSelection();
      window.location.hash = next;
      setTab(next);
      window.scrollTo({ top: 0 });
    }
  };
  const refresh = useCallback(async () => {
    if (refreshBusy.current) return;
    refreshBusy.current = true;
    setRefreshing(true);
    try {
      if (initData) {
        const data = await getDashboard(initData);
        setView({ phase: "ready", data, demo: false });
      }
    } finally {
      setRefreshing(false);
      refreshBusy.current = false;
    }
  }, [initData]);
  useEffect(() => {
    if (!initData) return;
    const visible = () => {
      if (document.visibilityState === "visible")
        void refresh().catch(() => {});
    };
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [initData, refresh]);
  const openPanel = (value: Panel) => {
    setPanel(value);
    setPanelSession((v) => v + 1);
    setPanelOpen(true);
    hapticSelection();
  };
  const openPlan = (plan: PlanOffer) => {
    setSelectedPlan(plan);
    setCheckoutSession((v) => v + 1);
    setCheckoutOpen(true);
    hapticSelection();
  };
  const renew = () => {
    if (view.phase !== "ready") return;
    const plan = view.data.offers.plans.find(
      (p) => p.recommended_purchase_type === "RENEW",
    );
    if (plan) openPlan(plan);
    else navigate("plans");
  };
  const changeTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem("remna-theme-v1", next);
    } catch {
      /* WebView storage is optional. */
    }
    hapticSelection();
  };
  useEffect(() => {
    const backButton = getTelegramWebApp()?.BackButton;
    if (!backButton || !initData || checkoutOpen || panelOpen) return;
    const back = () => {
      window.location.hash = "subscription";
    };
    if (tab !== "subscription") backButton.show();
    else backButton.hide();
    backButton.onClick(back);
    return () => {
      backButton.offClick(back);
    };
  }, [checkoutOpen, panelOpen, tab, initData]);
  return (
    <>
      {view.phase === "loading" ? (
        <main className="app-shell skeleton-shell" aria-busy="true">
          <div className="skeleton skeleton-top" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-button" />
          <p className="sheet-note">Загружаем вашу подписку…</p>
        </main>
      ) : null}
      {view.phase === "error" ? (
        <main className="error-screen">
          <BrandMark />
          <p className="kicker">remna · Telegram mini app</p>
          <h1>{initData ? "Не удалось загрузить" : "Начните с Telegram"}</h1>
          <p>{view.message}</p>
          <button
            className="primary-button"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Попробовать снова <Glyph name="refresh" />
          </button>
        </main>
      ) : null}
      {view.phase === "ready" ? (
        <>
          <div
            className="app-shell"
            data-sheet-open={checkoutOpen || panelOpen}
          >
            <header className="app-header">
              <a
                className="brand"
                href="#subscription"
                aria-label="Remna — подписка"
              >
                <BrandMark />
                <span>
                  remna<span className="brand-dot">.</span>
                </span>
              </a>
              <div className="header-right">
                {view.demo ? <span className="preview-label">Демо</span> : null}
                <button
                  className="avatar-button"
                  aria-label="Открыть профиль"
                  onClick={() => navigate("profile")}
                >
                  {view.data.user.name.slice(0, 1).toUpperCase()}
                </button>
              </div>
            </header>
            <main className="page-content" id="page-content">
              {tab === "subscription" ? (
                <Overview
                  data={view.data}
                  onPlan={renew}
                  onConnect={() => navigate("connect")}
                  onPanel={openPanel}
                />
              ) : null}
              {tab === "plans" ? (
                <Plans data={view.data} onSelect={openPlan} />
              ) : null}
              {tab === "connect" ? (
                <Connection
                  data={view.data}
                  onGuide={() => openPanel("guide")}
                  onPlan={() => navigate("plans")}
                />
              ) : null}
              {tab === "profile" ? (
                <Profile
                  data={view.data}
                  theme={theme}
                  onTheme={changeTheme}
                  refreshing={refreshing}
                  onRefresh={() => {
                    if (!refreshing)
                      void refresh()
                        .then(() => toast.success("Данные обновлены"))
                        .catch((error) => toast.error(friendlyError(error)));
                  }}
                  onHelp={() => openPanel("help")}
                />
              ) : null}
            </main>
          </div>
          <div className="nav-dock">
            <nav className="bottom-nav" aria-label="Основная навигация">
              <span
                className="nav-indicator"
                style={{
                  transform: `translateX(${tabs.findIndex((item) => item.id === tab) * 100}%)`,
                }}
              />
              {tabs.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={tab === item.id ? "nav-item selected" : "nav-item"}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => {
                    if (tab !== item.id) hapticSelection();
                  }}
                >
                  <Glyph name={item.icon} />
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
          {selectedPlan ? (
            <CheckoutDrawer
              key={checkoutSession}
              plan={selectedPlan}
              data={view.data}
              demo={view.demo}
              open={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
              onRefresh={refresh}
            />
          ) : null}
          <InfoDrawer
            key={panelSession}
            panel={panel}
            data={view.data}
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
          />
        </>
      ) : null}
      <Toaster
        theme={theme}
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            borderRadius: "18px",
          },
        }}
        mobileOffset={{
          top: "calc(16px + var(--tg-content-safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px))",
        }}
      />
    </>
  );
}

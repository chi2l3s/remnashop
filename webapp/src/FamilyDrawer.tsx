import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { Drawer } from "@base-ui/react/drawer";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { Glyph } from "./ui";
import { getTelegramWebApp } from "./telegram";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  pageKey: string;
  direction?: number;
  onBack?: () => void;
  busy?: boolean;
  children: ReactNode;
}

function DrawerPage({
  children,
  direction = 1,
  ref,
}: {
  children: ReactNode;
  direction?: number;
  ref: Ref<HTMLDivElement>;
}) {
  const present = useIsPresent();
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className="drawer-page"
      inert={!present}
      aria-hidden={!present || undefined}
      initial={{
        opacity: 0,
        transform: reduce ? "none" : `translateX(${direction * 28}px)`,
      }}
      animate={{ opacity: 1, transform: reduce ? "none" : "translateX(0px)" }}
      variants={{
        leave: (d: number) => ({
          opacity: 0,
          transform: reduce ? "none" : `translateX(${d * -20}px)`,
        }),
      }}
      exit="leave"
      transition={{ duration: reduce ? 0.12 : 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

// One measured surface, multiple pages: content never scales with the shell.
// The small height transition is intentional for the Family-style drawer.
function DrawerPages({
  pageKey,
  direction,
  children,
}: Pick<Props, "pageKey" | "direction" | "children">) {
  const reduce = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setHeight(element.getBoundingClientRect().height),
    );
    setHeight(element.getBoundingClientRect().height);
    observer.observe(element);
    return () => observer.disconnect();
  }, [pageKey]);
  return (
    <motion.div
      className="drawer-measure"
      animate={{ height: height ?? "auto" }}
      transition={{ duration: reduce ? 0 : 0.24, ease: [0.32, 0.72, 0, 1] }}
    >
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <DrawerPage key={pageKey} ref={content} direction={direction}>
          {children}
        </DrawerPage>
      </AnimatePresence>
    </motion.div>
  );
}

export function FamilyDrawer({
  open,
  onClose,
  title,
  description,
  onBack,
  children,
  pageKey,
  direction = 1,
  busy = false,
}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const app = getTelegramWebApp();
    if (!open || !app?.initData || !app.BackButton) return;
    const back = () => {
      if (!busy) (onBack ?? onClose)();
    };
    app.BackButton.show();
    app.BackButton.onClick(back);
    return () => {
      app.BackButton?.offClick(back);
    };
  }, [open, busy, onBack, onClose]);
  useLayoutEffect(() => {
    if (open) heading.current?.focus({ preventScroll: true });
  }, [pageKey, open]);
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next, event) => {
        if (busy) event.cancel();
        else if (!next) onClose();
      }}
      swipeDirection="down"
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="drawer-backdrop" />
        <Drawer.Viewport className="drawer-viewport">
          <Drawer.Popup className="family-drawer" initialFocus={heading}>
            <div className="drawer-grip" aria-hidden="true">
              <span />
            </div>
            <header className="drawer-header">
              {onBack ? (
                <button
                  className="round-button"
                  aria-label="Назад"
                  onClick={onBack}
                >
                  <Glyph name="back" />
                </button>
              ) : (
                <span className="drawer-symbol">
                  <Glyph name="receipt" />
                </span>
              )}
              <div>
                <Drawer.Title ref={heading} tabIndex={-1}>
                  {title}
                </Drawer.Title>
                <Drawer.Description>{description}</Drawer.Description>
              </div>
              <Drawer.Close
                className="round-button"
                aria-label="Закрыть"
                disabled={busy}
              >
                <Glyph name="close" />
              </Drawer.Close>
            </header>
            <Drawer.Content className="drawer-scroll">
              <DrawerPages pageKey={pageKey} direction={direction}>
                {children}
              </DrawerPages>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

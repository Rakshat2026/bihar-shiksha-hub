import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

let scriptLoaded = false;
function loadTurnstileScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => { scriptLoaded = true; resolve(); };
    document.head.appendChild(s);
  });
}

interface Props {
  onVerify: (token: string) => void;
  className?: string;
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * If VITE_TURNSTILE_SITE_KEY is not set, falls back to a "dev mode" pass-through
 * so login still works during initial setup. Token "DEV_BYPASS" is sent which
 * the verify-turnstile edge function recognizes only when no secret is set.
 */
export function TurnstileWidget({ onVerify, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      // Dev fallback — auto-verify
      onVerify("DEV_BYPASS");
      return;
    }
    let cancelled = false;
    loadTurnstileScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onVerify(token),
        "error-callback": () => onVerify(""),
        "expired-callback": () => onVerify(""),
        theme: "light",
        size: "flexible",
      });
    });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) {
    return (
      <div className={className}>
        <div className="text-xs text-muted-foreground rounded-md border border-dashed border-border px-3 py-2 bg-muted/30">
          🛡️ CAPTCHA in setup mode (no site key configured yet)
        </div>
      </div>
    );
  }

  return <div ref={ref} className={className} />;
}

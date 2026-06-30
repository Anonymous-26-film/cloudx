import { useEffect, useRef } from "react";

export type AdsterraType =
  | "160x300"
  | "160x600"
  | "300x250"
  | "320x50"
  | "468x60"
  | "728x90";

interface AdBannerProps {
  type: AdsterraType;
  className?: string;
}

interface AdConfig {
  key: string;
  width: number;
  height: number;
  invokeUrl: string;
}

const CONFIGS: Record<AdsterraType, AdConfig> = {
  "160x300": {
    key: "e4771ea5ace89e332e280a77dabecf8b",
    width: 160,
    height: 300,
    invokeUrl:
      "https://www.highperformanceformat.com/e4771ea5ace89e332e280a77dabecf8b/invoke.js",
  },
  "160x600": {
    key: "a5f623354eddbd8c3df41e1b109107d8",
    width: 160,
    height: 600,
    invokeUrl:
      "https://www.highperformanceformat.com/a5f623354eddbd8c3df41e1b109107d8/invoke.js",
  },
  "300x250": {
    key: "3337e2302f6b75c28eee4ace05ab3497",
    width: 300,
    height: 250,
    invokeUrl:
      "https://www.highperformanceformat.com/3337e2302f6b75c28eee4ace05ab3497/invoke.js",
  },
  "320x50": {
    key: "761e9b803d59add71fcd21ac88002626",
    width: 320,
    height: 50,
    invokeUrl:
      "https://www.highperformanceformat.com/761e9b803d59add71fcd21ac88002626/invoke.js",
  },
  "468x60": {
    key: "0cff5f5128f911ca7fabcb625083689f",
    width: 468,
    height: 60,
    invokeUrl:
      "https://www.highperformanceformat.com/0cff5f5128f911ca7fabcb625083689f/invoke.js",
  },
  "728x90": {
    key: "cbf0db19e68f77c6900be399fc16ab42",
    width: 728,
    height: 90,
    invokeUrl:
      "https://www.highperformanceformat.com/cbf0db19e68f77c6900be399fc16ab42/invoke.js",
  },
};

export default function AdBanner({ type, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const config = CONFIGS[type];
    if (!config) return;

    const container = containerRef.current;
    if (!container) return;

    let currentScripts: HTMLScriptElement[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || loadedRef.current) return;

        loadedRef.current = true;

        const atOpts = document.createElement("script");
        atOpts.textContent = `window.atOptions = ${JSON.stringify({ key: config.key, format: "iframe", height: config.height, width: config.width, params: {} })};`;

        const invoke = document.createElement("script");
        invoke.src = config.invokeUrl;
        invoke.async = true;

        container.appendChild(atOpts);
        container.appendChild(invoke);
        currentScripts = [atOpts, invoke];

        observer.disconnect();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      currentScripts.forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
      if (typeof window !== "undefined") {
        delete (window as any).atOptions;
      }
    };
  }, [type]);

  const config = CONFIGS[type];

  if (!config) {
    if (typeof window !== "undefined") {
      console.warn(
        `[AdBanner] Unknown type: "${type}". Valid: ${Object.keys(CONFIGS).join(", ")}`,
      );
    }
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{
        width: "100%",
        maxWidth: config.width,
        minHeight: config.height,
        margin: "0 auto",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}

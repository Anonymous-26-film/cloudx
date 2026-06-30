import { useEffect, useRef } from "react";

const SCRIPT_URL =
  "https://pl30121266.effectivecpmnetwork.com/1a29d7ab7a5428f502eb4900b165879c/invoke.js";
const CONTAINER_ID = "container-1a29d7ab7a5428f502eb4900b165879c";

export default function NativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    let currentScript: HTMLScriptElement | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loadedRef.current) return;

        loadedRef.current = true;

        const script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.async = true;
        script.setAttribute("data-cfasync", "false");

        document.body.appendChild(script);
        currentScript = script;

        observer.disconnect();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.removeChild(currentScript);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id={CONTAINER_ID}
      className="ad-container"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}

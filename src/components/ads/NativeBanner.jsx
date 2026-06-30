import { useEffect, useRef } from "react";

const SCRIPT_URL =
  "https://pl30121266.effectivecpmnetwork.com/1a29d7ab7a5428f502eb4900b165879c/invoke.js";
const CONTAINER_ID = "container-1a29d7ab7a5428f502eb4900b165879c";

export default function NativeBanner() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadedRef.current) return;

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);
    loadedRef.current = true;

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      id={CONTAINER_ID}
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

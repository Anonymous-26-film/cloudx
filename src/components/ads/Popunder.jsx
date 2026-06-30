import { useEffect } from "react";

const POPUNDER_URL =
  "https://pl30121265.effectivecpmnetwork.com/8b/d9/5c/8bd95c2266e3658635aecb8e176bad42.js";

const loadedScripts = /* @__PURE__ */ new Set();

export default function Popunder() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadedScripts.has("popunder")) return;

    const script = document.createElement("script");
    script.src = POPUNDER_URL;
    script.async = true;

    document.body.appendChild(script);
    loadedScripts.add("popunder");
  }, []);

  return null;
}

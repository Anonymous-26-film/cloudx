import { useEffect } from "react";

const SOCIAL_BAR_URL =
  "https://pl30121274.effectivecpmnetwork.com/cf/4f/4c/cf4f4c51c5621faa743c3615d67b6aac.js";

const loadedScripts = new Set<string>();

export default function SocialBar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadedScripts.has("socialbar")) return;

    const script = document.createElement("script");
    script.src = SOCIAL_BAR_URL;
    script.async = true;

    document.body.appendChild(script);
    loadedScripts.add("socialbar");
  }, []);

  return null;
}

const SMART_LINK_URL =
  "https://www.effectivecpmnetwork.com/nwnun8bxn?key=2473f572c9d86892c17b5196b186fa0e";

export function openSmartLink() {
  if (typeof window !== "undefined") {
    window.open(SMART_LINK_URL, "_blank", "noopener,noreferrer");
  }
}

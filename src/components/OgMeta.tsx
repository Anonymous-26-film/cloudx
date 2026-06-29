import { useMemo } from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

interface OgMetaProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
}

export function OgMeta({ title, description, image, type = "website" }: OgMetaProps) {
  const pageUrl = useMemo(() => {
    if (typeof window === "undefined") return SITE_URL;
    return window.location.href;
  }, []);

  return (
    <Helmet>
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="PortalHub Cinema" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />
    </Helmet>
  );
}
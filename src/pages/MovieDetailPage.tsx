import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";

/** Simplified detail page that redirects to the plugin catalog */
export function MovieDetailPage() {

  return (
    <>
      <Helmet>
        <title>PortalHub Cinema</title>
        <meta name="description" content="PortalHub Cinema — Indonesian streaming source catalog. Browse available sources to find where to watch content." />
      </Helmet>
      <OgMeta
        title="PortalHub Cinema"
        description="Indonesian streaming source catalog. Browse available sources to find where to watch content."
      />
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">&#x1F3AC;</div>
        <h1 className="text-2xl font-bold text-foreground">Content Moved</h1>
        <p className="text-muted-foreground text-center max-w-md">
          PortalHub now serves as a catalog of Indonesian streaming sources. Browse available sources to find where to watch content.
        </p>
        <Link to="/" className="text-primary hover:text-primary/80 font-medium mt-2">
          Browse Sources
        </Link>
      </div>
    </>
  );
}
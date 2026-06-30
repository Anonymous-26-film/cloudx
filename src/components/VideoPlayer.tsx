import { NativeBanner } from "./ads";

interface VideoPlayerProps {
  mediaType: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
}

export function VideoPlayer(_props: VideoPlayerProps) {
  return (
    <>
    <div className="w-full aspect-video bg-secondary rounded-lg flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">&#x1F3AC;</div>
      <div className="text-center px-4">
        <p className="text-foreground font-semibold text-lg mb-1">Streaming Source Catalog</p>
        <p className="text-muted-foreground text-sm">
          PortalHub provides a catalog of Indonesian streaming sources. Browse available providers to find where to watch content.
        </p>
      </div>
    </div>
    <div className="mt-4 flex justify-center">
      <NativeBanner />
    </div>
    </>
  );
}
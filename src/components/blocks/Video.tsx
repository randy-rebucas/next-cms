import type { VideoBlock } from "@/models/content";

/** Convert a YouTube / Vimeo watch URL to an embeddable iframe src. */
function toEmbedUrl(url: string): string {
  // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
  const ytMatch =
    url.match(/youtube\.com\/watch\?v=([\w-]+)/) ??
    url.match(/youtu\.be\/([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: https://vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Assume already an embeddable or direct video URL
  return url;
}

export default function Video({ block }: { block: VideoBlock }) {
  const embedUrl = toEmbedUrl(block.url);
  const isDirect =
    !embedUrl.includes("youtube.com/embed") &&
    !embedUrl.includes("player.vimeo.com");

  return (
    <figure className="my-6">
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-800 aspect-video">
        {isDirect ? (
          <video
            src={embedUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <iframe
            src={embedUrl}
            title={block.caption ?? "Video"}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs text-slate-500 mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

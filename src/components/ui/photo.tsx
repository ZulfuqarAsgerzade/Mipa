import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PhotoKey } from "@/config/photos";

/**
 * Graded factory photo. The wrapper owns the size; the image fills it.
 * `motion` drives the scroll wipe + drift set up in SmoothScroll.
 */
export function Photo({
  name,
  alt,
  sizes = "100vw",
  className,
  imgClassName,
  priority,
  motion = "drift",
  shade = "soft",
}: {
  name: PhotoKey;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  motion?: "drift" | "static" | "none";
  shade?: "none" | "soft" | "bottom" | "strong";
}) {
  return (
    <figure className={cn("photo relative overflow-hidden bg-surface", className)} data-photo={motion === "none" ? undefined : motion}>
      <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
      {shade !== "none" && <span aria-hidden className={cn("photo-shade", `shade-${shade}`)} />}
    </figure>
  );
}

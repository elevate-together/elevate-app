import Image from "next/image";

type RoundedImageProps = {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  priority?: boolean;
};

export function RoundedImage({
  src,
  alt,
  className = "min-w-28 sm:min-w-32 md:min-w-40",
  rounded = "rounded-md",
  priority = false,
}: RoundedImageProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden ${className} ${rounded}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        key={src}
        className="object-cover"
        sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
        priority={priority}
      />
    </div>
  );
}

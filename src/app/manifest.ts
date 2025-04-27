import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elevate Together",
    short_name: "Elevate",
    description: "Elevate your Christian accountability.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

/**
 * Hiermee wordt de site een echte app op je startscherm: zonder adresbalk en
 * zonder de knoppenbalk van Safari onderaan.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "De Amigos — pokerclub uit Aalst",
    short_name: "Amigos",
    description:
      "Het prikbord, de pot en het beheer van pokerclub De Amigos uit Aalst.",
    lang: "nl",
    start_url: "/prikbord",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f1e4",
    theme_color: "#f8f1e4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

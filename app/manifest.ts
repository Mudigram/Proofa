import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Proofa",
    short_name: "Proofa",
    description: "Proofa is a platform for creating and managing business invoices and receipts.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#EC5800", // Match your app's header/brand color
    orientation: "portrait-primary",
    icons: [
      {
        src: "/home.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/splash.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/mask.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Tells Android it's safe to crop this asset safely
      },
    ],
  };
}
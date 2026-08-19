import type { Metadata, Viewport } from "next";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "De Amigo's — pokerclub uit Aalst",
  description:
    "Een groep vrienden uit Aalst die elkaar tegenkwam aan de pokertafel en er nooit meer is weggegaan.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f1e4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

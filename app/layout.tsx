import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joel Martínez | Desarrollo Web Jr. · Soporte TI · IA",
  description:
    "Portafolio de Joel Martínez: desarrollo web Full Stack, soporte TI, automatización con IA y proyectos como TramitexFederal y EndoCare.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}

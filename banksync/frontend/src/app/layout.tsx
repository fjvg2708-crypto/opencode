import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DG BankSync Portugal",
  description: "Sistema interno de sincronização bancária PSD2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}

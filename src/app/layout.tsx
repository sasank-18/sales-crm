import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Sidebar from "@/components/Sidebar";
import { CRMProvider } from "@/context/CRMContext";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aether CRM | Premium Sales Pipeline & Intelligence",
  description: "Next-generation customer relationship management platform for high-performance sales teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body>
        <CRMProvider>
          <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </CRMProvider>
      </body>
    </html>
  );
}

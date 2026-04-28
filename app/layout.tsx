import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/Navigation/Sidebar";
import ClientLayout from "@/components/Layout/ClientLayout";

export const metadata: Metadata = {
  title: "DevFlow",
  description: "개발친화적 올인원 웹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <Providers>
          {/* 클라이언트 로직(사이드바 유무)을 담당하는 컴포넌트로 감싸기 */}
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}

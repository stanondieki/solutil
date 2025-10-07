import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace']
});

export const metadata: Metadata = {
  title: "Solutil Connect - Professional Home Services Made Simple",
  description: "Professional home services including plumbing, electrical, cleaning, carpentry, and painting. Book trusted service providers in Kenya.",
  keywords: "home services, plumbing, electrical, cleaning, carpentry, painting, Kenya, Nairobi",
  icons: {
    icon: [
      { url: '/images/log.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/log.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/images/log.png',
    apple: [
      { url: '/images/log.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/images/log.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

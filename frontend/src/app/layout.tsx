import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
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
      { url: '/logo.jpg', sizes: '64x64', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    shortcut: '/logo.jpg',
    apple: [
      { url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '152x152', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '120x120', type: 'image/jpeg' },
    ],
    other: [
      { rel: 'icon', url: '/logo.jpg', sizes: '192x192' },
      { rel: 'icon', url: '/logo.jpg', sizes: '512x512' },
      { rel: 'apple-touch-icon', url: '/logo.jpg', sizes: '180x180' },
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
      <head>
        <link rel="icon" href="/logo.jpg" sizes="any" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="16x16" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="32x32" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="48x48" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="64x64" />
        <link rel="apple-touch-icon" href="/logo.jpg" sizes="180x180" />
        <link rel="apple-touch-icon" href="/logo.jpg" sizes="152x152" />
        <link rel="apple-touch-icon" href="/logo.jpg" sizes="120x120" />
        <link rel="shortcut icon" href="/logo.jpg" />
        <meta name="msapplication-TileImage" content="/logo.jpg" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="theme-color" content="#ff6b35" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { Inter, Space_Mono } from 'next/font/google';
import Providers from './providers';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'NerDism - The Modern Nerd',
  description: 'Discover the Nerd Inside You. Tech, Gaming, Coding, Anime, Movies, AI - your modern nerd culture blog.',
  keywords: 'tech, gaming, anime, movies, AI, nerd culture, blog',
  authors: [{ name: 'Nerdism' }],
  openGraph: {
    title: 'NerDism - The Modern Nerd',
    description: 'Where code meets culture. Dive deep into Tech, Gaming, Anime, Movies, and AI.',
    url: 'https://nerdism.me',
    siteName: 'NerDism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NerDism - The Modern Nerd',
    description: 'Where code meets culture. Dive deep into Tech, Gaming, Anime, Movies, and AI.',
    creator: '@NerDismme',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8144272281776750"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${spaceMono.variable}`}>
        <Providers>
          <div className="app">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

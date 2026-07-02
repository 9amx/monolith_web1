import './globals.css';
import Script from 'next/script';
import CustomContextMenu from '@/components/CustomContextMenu';
import CustomCursor from '@/components/CustomCursor';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata = {
  title: 'Monolith Media The Top Tier Video Editing Agency',
  description: 'Looking to hire a professional video editing agency? Monolith Media provides high-retention YouTube video editing, cinematic documentaries, shorts, and VSLs to help creators scale.',
  robots: 'max-image-preview:large',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Plyr Video Player CSS */}
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Monolith Media",
              "url": "https://monolithmedia.digital",
              "description": "Monolith Media is a premium video editing agency founded by Alvi Karim, specializing in high-retention content for YouTube, brands, and businesses.",
              "founder": { "@type": "Person", "name": "Alvi Karim" },
              "sameAs": ["https://x.com/AlviKarim175590"]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SmoothScroll>
          {children}
          <CustomContextMenu />
          <CustomCursor />
        </SmoothScroll>
        {/* Plyr Video Player JS */}
        <Script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Inline no-flash script: read theme cookie (or fall back to system preference)
// and set data-theme on <html> before paint. Runs before React hydrates.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var t=m&&m[1];if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Startpage",
  description: "Your personal start page on the internet.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  // Server-side default: respect cookie if set, otherwise light. The inline
  // script overrides this client-side before paint when no cookie exists.
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <div className="aurora" aria-hidden />
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

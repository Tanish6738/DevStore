import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ThemeInitializer from "@/components/theme/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevStore - Your Developer Toolkit, Organized",
  description:
    "Bookmark. Curate. Share. Discover. All your favorite development tools in one personal space. The perfect developer command center for organizing APIs, design systems, SaaS tools, and frameworks.",
  keywords: [
    "developer tools",
    "bookmark manager",
    "developer resources",
    "toolkit organizer",
    "coding tools",
    "development resources",
    "tool curation",
    "developer productivity",
  ],
  authors: [{ name: "DevStore Team" }],
  creator: "DevStore",
  publisher: "DevStore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://devtoolkit.com"),
  alternates: {
    canonical: "/",
    title: "DevStore",
  },
  openGraph: {
    title: "DevStore - Your Developer Toolkit, Organized",
    description:
      "Bookmark. Curate. Share. Discover. All your favorite development tools in one personal space.",
    url: "https://devtoolkit.com",
    siteName: "DevStore",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevStore - Developer Tools Organizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStore - Your Developer Toolkit, Organized",
    description:
      "Bookmark. Curate. Share. Discover. All your favorite development tools in one personal space.",
    images: ["/twitter-image.png"],
    creator: "@devtoolkit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00A99D",
          colorBackground: "#1B212C",
          colorInputBackground: "#151B24",
          colorInputText: "#E1E6EB",
        },
        elements: {
          formButtonPrimary:
            "bg-theme-primary hover:bg-theme-primary/90 text-sm normal-case",
          card: "bg-theme-secondary border border-theme-border/20",
          headerTitle: "text-theme-text",
          headerSubtitle: "text-theme-text-secondary",
        },
      }}
      // Redirect to a public route after auth to prevent middleware loops if session refresh fails
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="h-full">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen font-sans`}
        >
          <ThemeInitializer />
          <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-theme-background text-theme-text">
              <main className="flex-1">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

'use client'

import dynamic from "next/dynamic";

// Dynamic import for Landing page to avoid SSR issues with Clerk
const Landing = dynamic(() => import("@/Pages/Landing"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-theme-background">
      <div className="text-theme-text">Loading...</div>
    </div>
  )
});

const Page = () => {
  return <Landing />;
};

export default Page;
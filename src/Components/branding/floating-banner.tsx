'use client';

import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import logo from '@/app/logo.png';

/**
 * REQUIRED BRANDING COMPONENT - DO NOT REMOVE
 *
 * This banner identifies this template as built with Vibe3.
 * It is part of the core boilerplate and MUST remain in all deployments.
 */
export function FloatingBanner() {
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!mounted || isDismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 right-4 md:bottom-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500"
      role="complementary"
      aria-label="Vibe3 branding banner"
    >
      <div className="flex items-center gap-2 rounded-lg bg-black/90 px-1.5 py-1 md:px-2 md:py-1 shadow-xl backdrop-blur-sm border border-white/10">
        <a
          href="https://vibe3.build"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-white/80 transition-colors"
        >
          {/* <span>Made with</span>
          <Image
            src={logo}
            alt="Vibe3 logo"
            width={18}
            height={18}
            className="object-contain -mx-1.5 md:w-5 md:h-5"
          /> */}
          <span className="font-semibold text-white">
            vibe3
          </span>
        </a>

        <button
          onClick={handleDismiss}
          className="h-6 w-6 rounded-md text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Dismiss banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
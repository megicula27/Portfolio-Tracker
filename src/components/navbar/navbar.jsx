"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useScrollPosition } from "@/utils/animation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { useSession, signOut } from "next-auth/react";

// Custom hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScrollPosition();
  const isMobile = useIsMobile();
  const { data: session } = useSession();

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Portfolio Tracker
            </Link>
          </div>

          {scrolled || isMobile ? (
            <>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground p-2 hover:bg-slate-900 rounded-md"
              >
                <Menu className="h-6 w-6" />
              </button>
              {isOpen && (
                <div className="absolute top-full right-0 w-48 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="px-4 py-2 space-y-2">
                    <Link
                      href="/"
                      className="block py-2 text-foreground hover:text-primary text-right"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/invest"
                      className="block py-2 text-foreground hover:text-primary text-right"
                    >
                      Invest
                    </Link>
                    {session ? (
                      <button
                        onClick={() => signOut()}
                        className="w-full block py-2 text-foreground hover:text-primary text-right"
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        href="/auth"
                        className="block py-2 text-foreground hover:text-primary text-right"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link
                  href="/invest"
                  className="text-foreground hover:text-primary"
                >
                  Invest
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="text-foreground hover:text-primary"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/auth/"
                    className="text-foreground hover:text-primary"
                  >
                    Login
                  </Link>
                )}
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

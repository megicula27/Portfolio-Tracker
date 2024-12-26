"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useScrollPosition } from "@/utils/animation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScrollPosition();

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

          {scrolled ? (
            <>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground"
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
                    <Link
                      href="/login"
                      className="block py-2 text-foreground hover:text-primary text-right"
                    >
                      Login/Logout
                    </Link>
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
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary"
                >
                  Login/Logout
                </Link>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

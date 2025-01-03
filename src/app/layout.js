import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../providers/AuthProvider";
import { ThemeProvider } from "../components/theme-provider/theme-provider";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Portfolio Tracker",
  description: "Track your investment portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Toaster /> */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

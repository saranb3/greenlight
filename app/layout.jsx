import "./globals.css";
import { Hanken_Grotesk } from "next/font/google";

// One humanist grotesque carries the whole tool — headings, labels, data, body.
// Loaded as a variable font (full weight axis) and self-hosted by next/font, so
// there's no render-blocking @import and next generates a metric-matched
// fallback to keep layout shift at zero.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "Greenlight — mock PM interviews",
  description: "Live, voice-driven PM interview practice with AI grading.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={hanken.variable}>
      <body>{children}</body>
    </html>
  );
}

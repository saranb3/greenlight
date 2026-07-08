import "./globals.css";

export const metadata = {
  title: "Greenlight — mock PM interviews",
  description: "Live, voice-driven PM interview practice with AI grading.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

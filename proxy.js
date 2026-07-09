// Pre-launch password wall. Runs in front of every request (pages + API).
// Set SITE_PASSWORD in the environment to lock the site; unset it to open up.
// Local dev stays open because .env.local doesn't define SITE_PASSWORD.
import { NextResponse } from "next/server";

export function proxy(req) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next(); // no password configured → open

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    // Accept any username; only the password matters.
    const supplied = decoded.slice(decoded.indexOf(":") + 1);
    if (supplied === password) return NextResponse.next();
  }

  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Greenlight"' },
  });
}

import type { NextConfig } from "next";

/**
 * Standard security headers applied to every response.
 * See https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  {
    // Prevent MIME-type sniffing (stops browsers from reinterpreting files)
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Block framing entirely to prevent clickjacking
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Legacy XSS filter — modern browsers ignore it, but older ones benefit
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Only send the origin (not the full path) on cross-origin requests
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Enforce HTTPS for 1 year, including subdomains
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Disable browser features we don't use
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    // Content Security Policy — restrict where resources can load from.
    // 'unsafe-inline' is required for Next.js style injection;
    // 'unsafe-eval' is intentionally omitted.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' https://accounts.google.com https://fonts.googleapis.com${process.env.NODE_ENV === "development" ? " ws://localhost:3000 ws://127.0.0.1:3000" : ""}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

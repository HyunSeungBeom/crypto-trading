export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/trade/:path*", "/api/portfolio/:path*", "/api/transactions/:path*", "/api/alerts/:path*"],
};

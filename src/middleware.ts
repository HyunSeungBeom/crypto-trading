import NextAuth from "next-auth";
import { authConfig } from "@/shared/config/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/api/trade/:path*", "/api/portfolio/:path*", "/api/transactions/:path*", "/api/alerts/:path*"],
};

import NextAuth from "next-auth";
import { authConfig } from "@/shared/config/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/portfolio/:path*", "/transactions/:path*", "/alerts/:path*", "/leaderboard/:path*"],
};

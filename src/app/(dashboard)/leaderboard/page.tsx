import { fetchLeaderboard } from "@/features/leaderboard/api/leaderboardActions";
import { LeaderboardView } from "@/features/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  let users = null;
  try {
    users = await fetchLeaderboard();
  } catch {
    // DB 연결 실패 등 — 클라이언트에서 재시도
  }

  return <LeaderboardView initialData={users ?? undefined} />;
}

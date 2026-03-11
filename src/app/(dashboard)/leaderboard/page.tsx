import { fetchLeaderboard } from "@/features/leaderboard/api/leaderboardActions";
import { LeaderboardView } from "@/features/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const users = await fetchLeaderboard();

  return <LeaderboardView initialData={users} />;
}

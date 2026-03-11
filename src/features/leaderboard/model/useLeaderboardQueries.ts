import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import type { LeaderboardUser } from "@/entities/user";
import { fetchLeaderboard } from "../api/leaderboardActions";

export function useLeaderboard(options?: { initialData?: LeaderboardUser[] }) {
  return useQuery({
    queryKey: queryKeys.leaderboard.all,
    queryFn: () => fetchLeaderboard(),
    initialData: options?.initialData,
    staleTime: 60_000,
  });
}

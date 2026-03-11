import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { leaderboardApi } from "../api/leaderboardApi";

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard.all,
    queryFn: () => leaderboardApi.list(),
    staleTime: 60 * 1000,
  });
}

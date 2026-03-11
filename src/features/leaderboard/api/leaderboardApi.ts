import { apiClient } from "@/shared/api";
import type { LeaderboardUser } from "@/entities/user";

export const leaderboardApi = {
  list(): Promise<LeaderboardUser[]> {
    return apiClient.get("api/leaderboard").json();
  },
};

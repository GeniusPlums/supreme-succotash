import { useQuery } from "@tanstack/react-query";
import type { Contest } from "@shared/schema";

export function useContest() {
  return useQuery<Contest>({
    queryKey: ['/api/contest'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refetch every minute
  });
}

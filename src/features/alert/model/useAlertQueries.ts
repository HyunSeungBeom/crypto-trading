import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import type { PriceAlert } from "@/entities/alert";
import { alertApi } from "../api/alertApi";

export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts.all,
    queryFn: () => alertApi.list(),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertApi.delete,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.alerts.all });

      const previous = queryClient.getQueryData<PriceAlert[]>(
        queryKeys.alerts.all,
      );

      queryClient.setQueryData<PriceAlert[]>(queryKeys.alerts.all, (old) =>
        old?.filter((a) => a.id !== deletedId),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.alerts.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

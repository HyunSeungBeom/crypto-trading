import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import type { PriceAlert } from "@/entities/alert";
import { fetchAlerts, createAlert, deleteAlert } from "../api/alertActions";

export function useAlerts(options?: { initialData?: PriceAlert[] }) {
  return useQuery({
    queryKey: queryKeys.alerts.all,
    queryFn: () => fetchAlerts(),
    initialData: options?.initialData,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      symbol: string;
      targetPrice: number;
      condition: "ABOVE" | "BELOW";
    }) => {
      const result = await createAlert(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAlert(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
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

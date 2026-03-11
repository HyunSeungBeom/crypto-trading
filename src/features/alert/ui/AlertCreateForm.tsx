"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SUPPORTED_SYMBOLS, SYMBOL_NAMES } from "@/entities/coin";
import { alertSchema, type AlertFormValues } from "../model/alertSchema";
import { useCreateAlert } from "../model/useAlertQueries";

export function AlertCreateForm() {
  const createAlert = useCreateAlert();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      symbol: SUPPORTED_SYMBOLS[0],
      condition: "ABOVE",
    },
  });

  function onSubmit(values: AlertFormValues) {
    createAlert.mutate(values, {
      onSuccess: () => {
        toast.success("알림이 설정되었습니다");
        reset({ symbol: SUPPORTED_SYMBOLS[0], condition: "ABOVE", targetPrice: undefined as unknown as number });
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div>
        <label className="mb-1 block text-sm text-muted">코인</label>
        <select
          {...register("symbol")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          {SUPPORTED_SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s.replace("USDT", "")} - {SYMBOL_NAMES[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">조건</label>
        <select
          {...register("condition")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="ABOVE">이상</option>
          <option value="BELOW">이하</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">
          목표가 (USD)
        </label>
        <input
          type="number"
          step="any"
          {...register("targetPrice", { valueAsNumber: true })}
          placeholder="0.00"
          className="w-40 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        {errors.targetPrice && (
          <p className="mt-1 text-xs text-danger">
            {errors.targetPrice.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={createAlert.isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        알림 추가
      </button>
    </form>
  );
}

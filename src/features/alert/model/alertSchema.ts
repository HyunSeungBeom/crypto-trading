import { z } from "zod";

export const alertSchema = z.object({
  symbol: z.string().min(1),
  targetPrice: z
    .number({ error: "목표가를 입력해주세요" })
    .positive({ error: "목표가는 0보다 커야 합니다" }),
  condition: z.enum(["ABOVE", "BELOW"]),
});

export type AlertFormValues = z.infer<typeof alertSchema>;

import { z } from "zod";

export const tradeSchema = z.object({
  quantity: z
    .number({ error: "수량을 입력해주세요" })
    .positive({ error: "수량은 0보다 커야 합니다" }),
});

export type TradeFormValues = z.infer<typeof tradeSchema>;
